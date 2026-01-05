"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/db/prisma";
import { supabaseAdmin, supabaseBucketName } from "@/lib/supabaseAdmin";

function toStr(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v.trim() : "";
}
function toInt(v: FormDataEntryValue | null, fallback = 0) {
  const s = toStr(v);
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createPart(formData: FormData) {
  const sku = toStr(formData.get("sku")) || null;

  const slugRaw = toStr(formData.get("slug"));
  const titleDe = toStr(formData.get("title_de"));
  const titleEn = toStr(formData.get("title_en"));

  const slug =
    slugRaw ? slugify(slugRaw) : titleDe ? slugify(titleDe) : titleEn ? slugify(titleEn) : "";

  if (!slug) throw new Error("Slug fehlt (oder Titel DE/EN zum Auto-Slug).");

  const categoryId = toStr(formData.get("categoryId")) || null;
  const condition = toStr(formData.get("condition")) || "UNKNOWN";
  const authenticity = toStr(formData.get("authenticity")) || "UNKNOWN";
  const stockStatus = toStr(formData.get("stockStatus")) || "OUT_OF_STOCK";
  const quantity = toInt(formData.get("quantity"), 0);
  const notes = toStr(formData.get("notes")) || null;

  const descDe = toStr(formData.get("description_de")) || null;
  const descEn = toStr(formData.get("description_en")) || null;

  const part = await prisma.part.create({
    data: {
      sku,
      slug,
      categoryId,
      condition: condition as any,
      authenticity: authenticity as any,
      stockStatus: stockStatus as any,
      quantity,
      notes,
      translations: {
        create: [
          ...(titleDe ? [{ locale: "de", title: titleDe, description: descDe }] : []),
          ...(titleEn ? [{ locale: "en", title: titleEn, description: descEn }] : []),
        ],
      },
    },
    select: { id: true },
  });

  revalidatePath("/admin/parts");
  redirect(`/admin/parts/${part.id}`);
}

export async function updatePart(formData: FormData) {
  const id = toStr(formData.get("id"));
  if (!id) throw new Error("ID fehlt");

  const sku = toStr(formData.get("sku")) || null;

  const slugRaw = toStr(formData.get("slug"));
  const titleDe = toStr(formData.get("title_de"));
  const titleEn = toStr(formData.get("title_en"));
  const slug = slugRaw ? slugify(slugRaw) : null;

  const categoryId = toStr(formData.get("categoryId")) || null;
  const condition = toStr(formData.get("condition")) || "UNKNOWN";
  const authenticity = toStr(formData.get("authenticity")) || "UNKNOWN";
  const stockStatus = toStr(formData.get("stockStatus")) || "OUT_OF_STOCK";
  const quantity = toInt(formData.get("quantity"), 0);
  const notes = toStr(formData.get("notes")) || null;

  const descDe = toStr(formData.get("description_de")) || null;
  const descEn = toStr(formData.get("description_en")) || null;

  // Basisdaten
  await prisma.part.update({
    where: { id },
    data: {
      sku,
      ...(slug ? { slug } : {}), // slug nur wenn gesetzt
      categoryId,
      condition: condition as any,
      authenticity: authenticity as any,
      stockStatus: stockStatus as any,
      quantity,
      notes,
    },
  });

  // Translations upsert
  if (titleDe) {
    await prisma.partTranslation.upsert({
      where: { partId_locale: { partId: id, locale: "de" } },
      update: { title: titleDe, description: descDe },
      create: { partId: id, locale: "de", title: titleDe, description: descDe },
    });
  }
  if (titleEn) {
    await prisma.partTranslation.upsert({
      where: { partId_locale: { partId: id, locale: "en" } },
      update: { title: titleEn, description: descEn },
      create: { partId: id, locale: "en", title: titleEn, description: descEn },
    });
  }

  revalidatePath("/admin/parts");
  revalidatePath(`/admin/parts/${id}`);
}

export async function deletePart(formData: FormData) {
  const id = toStr(formData.get("id"));
  if (!id) throw new Error("ID fehlt");

  await prisma.part.delete({ where: { id } });

  revalidatePath("/admin/parts");
  redirect("/admin/parts");
}

export async function uploadPartImage(formData: FormData) {
  const partId = toStr(formData.get("partId"));
  if (!partId) throw new Error("partId fehlt");

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Kein File hochgeladen");
  if (!file.size) throw new Error("File ist leer");

  const altText = toStr(formData.get("altText")) || null;

  const supa = supabaseAdmin();
  const bucket = supabaseBucketName();

  const safeName = file.name.replace(/[^\p{L}\p{N}.\-_]+/gu, "_");
  const path = `parts/${partId}/${Date.now()}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const { error } = await supa.storage.from(bucket).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) throw new Error(`Supabase Upload Fehler: ${error.message}`);

  // sortOrder ans Ende
  const last = await prisma.partImage.findFirst({
    where: { partId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.partImage.create({
    data: {
      partId,
      originalPath: path,
      thumbnailPath: null, // später: echte thumbs generieren
      altText,
      sortOrder: (last?.sortOrder ?? 0) + 10,
    },
  });

  revalidatePath(`/admin/parts/${partId}`);
}

export async function deletePartImage(formData: FormData) {
  const imageId = toStr(formData.get("imageId"));
  const partId = toStr(formData.get("partId"));
  if (!imageId || !partId) throw new Error("IDs fehlen");

  const img = await prisma.partImage.findUnique({
    where: { id: imageId },
    select: { id: true, originalPath: true, thumbnailPath: true },
  });
  if (!img) throw new Error("Bild nicht gefunden");

  // DB zuerst löschen
  await prisma.partImage.delete({ where: { id: imageId } });

  // Storage cleanup (best-effort)
  try {
    const supa = supabaseAdmin();
    const bucket = supabaseBucketName();
    const paths = [img.originalPath, img.thumbnailPath].filter(Boolean) as string[];
    if (paths.length) await supa.storage.from(bucket).remove(paths);
  } catch {
    // ignoriere bewusst (DB ist die Wahrheit)
  }

  revalidatePath(`/admin/parts/${partId}`);
}

// MVP: Sortierung hoch/runter
export async function movePartImage(formData: FormData) {
  const partId = toStr(formData.get("partId"));
  const imageId = toStr(formData.get("imageId"));
  const dir = toStr(formData.get("dir")); // "up"|"down"
  if (!partId || !imageId) throw new Error("IDs fehlen");

  const images = await prisma.partImage.findMany({
    where: { partId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });

  const idx = images.findIndex((x) => x.id === imageId);
  if (idx < 0) return;

  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= images.length) return;

  const a = images[idx];
  const b = images[swapWith];

  await prisma.$transaction([
    prisma.partImage.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.partImage.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);

  revalidatePath(`/admin/parts/${partId}`);
}
