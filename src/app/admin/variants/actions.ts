"use server";

import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function normSlug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toIntOrNull(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function createVariant(formData: FormData) {
  const firearmModelId = String(formData.get("firearmModelId") ?? "").trim();
  const manufacturerIdRaw = String(formData.get("manufacturerId") ?? "").trim();
  const manufacturerId = manufacturerIdRaw ? manufacturerIdRaw : null;

  const name = String(formData.get("name") ?? "").trim();
  const slug = normSlug(String(formData.get("slug") ?? ""));
  const yearFrom = toIntOrNull(formData.get("yearFrom"));
  const yearTo = toIntOrNull(formData.get("yearTo"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!firearmModelId) throw new Error("Model fehlt");
  if (!name) throw new Error("Name fehlt");
  if (!slug) throw new Error("Slug fehlt");

  const created = await prisma.firearmVariant.create({
    data: {
      firearmModelId,
      manufacturerId, // falls Feld im Schema existiert
      name,
      slug,
      yearFrom,
      yearTo,
      notes,
    } as any,
    select: { id: true },
  });

  revalidatePath("/admin/variants");
  redirect(`/admin/variants/${created.id}`);
}

export async function updateVariant(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const firearmModelId = String(formData.get("firearmModelId") ?? "").trim();
  const manufacturerIdRaw = String(formData.get("manufacturerId") ?? "").trim();
  const manufacturerId = manufacturerIdRaw ? manufacturerIdRaw : null;

  const name = String(formData.get("name") ?? "").trim();
  const slug = normSlug(String(formData.get("slug") ?? ""));
  const yearFrom = toIntOrNull(formData.get("yearFrom"));
  const yearTo = toIntOrNull(formData.get("yearTo"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!id) throw new Error("ID fehlt");
  if (!firearmModelId) throw new Error("Model fehlt");
  if (!name) throw new Error("Name fehlt");
  if (!slug) throw new Error("Slug fehlt");

  await prisma.firearmVariant.update({
    where: { id },
    data: {
      firearmModelId,
      manufacturerId,
      name,
      slug,
      yearFrom,
      yearTo,
      notes,
    } as any,
  });

  revalidatePath("/admin/variants");
  revalidatePath(`/admin/variants/${id}`);
  redirect(`/admin/variants/${id}`);
}

export async function deleteVariant(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("ID fehlt");

  await prisma.firearmVariant.delete({ where: { id } });

  revalidatePath("/admin/variants");
  redirect("/admin/variants");
}
