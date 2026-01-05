"use server";

import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type UpsertPayload = {
  id?: string;
  slug: string;
  name: string;
  parentId?: string | null;

  deTitle: string;
  deDescription?: string | null;

  enTitle: string;
  enDescription?: string | null;
};

function normSlug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCategory(formData: FormData) {
  const payload = readPayload(formData);

  const created = await prisma.partCategory.create({
    data: {
      slug: payload.slug,
      name: payload.name,
      parentId: payload.parentId ?? null,
      translations: {
        create: [
          {
            locale: "de",
            title: payload.deTitle,
            description: payload.deDescription ?? null,
          },
          {
            locale: "en",
            title: payload.enTitle,
            description: payload.enDescription ?? null,
          },
        ],
      },
    },
    select: { id: true },
  });

  revalidatePath("/admin/categories");
  redirect(`/admin/categories/${created.id}`);
}

export async function updateCategory(formData: FormData) {
  const payload = readPayload(formData);
  if (!payload.id) throw new Error("Missing id");

  await prisma.partCategory.update({
    where: { id: payload.id },
    data: {
      slug: payload.slug,
      name: payload.name,
      parentId: payload.parentId ?? null,
    },
  });

  // translations upsert (DE/EN)
  await prisma.partCategoryTranslation.upsert({
    where: { categoryId_locale: { categoryId: payload.id, locale: "de" } },
    update: {
      title: payload.deTitle,
      description: payload.deDescription ?? null,
    },
    create: {
      categoryId: payload.id,
      locale: "de",
      title: payload.deTitle,
      description: payload.deDescription ?? null,
    },
  });

  await prisma.partCategoryTranslation.upsert({
    where: { categoryId_locale: { categoryId: payload.id, locale: "en" } },
    update: {
      title: payload.enTitle,
      description: payload.enDescription ?? null,
    },
    create: {
      categoryId: payload.id,
      locale: "en",
      title: payload.enTitle,
      description: payload.enDescription ?? null,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${payload.id}`);
  redirect(`/admin/categories/${payload.id}`);
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  // Hinweis: children.parentId ist SetNull, parts.categoryId ist SetNull (laut Schema)
  // wenn irgendwo FK restrict ist, bekommst du hier einen Prisma Fehler -> dann sagen wir dir, welche Relation blockiert.
  await prisma.partCategory.delete({ where: { id } });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

function readPayload(formData: FormData): UpsertPayload {
  const id = (formData.get("id") as string | null) ?? undefined;

  const slugRaw = String(formData.get("slug") ?? "");
  const slug = normSlug(slugRaw);

  const name = String(formData.get("name") ?? "").trim();

  const parentIdRaw = String(formData.get("parentId") ?? "").trim();
  const parentId = parentIdRaw ? parentIdRaw : null;

  const deTitle = String(formData.get("deTitle") ?? "").trim();
  const deDescription = String(formData.get("deDescription") ?? "").trim() || null;

  const enTitle = String(formData.get("enTitle") ?? "").trim();
  const enDescription = String(formData.get("enDescription") ?? "").trim() || null;

  if (!slug) throw new Error("Slug fehlt");
  if (!name) throw new Error("Name fehlt");
  if (!deTitle) throw new Error("DE Titel fehlt");
  if (!enTitle) throw new Error("EN Titel fehlt");

  return {
    id,
    slug,
    name,
    parentId,
    deTitle,
    deDescription,
    enTitle,
    enDescription,
  };
}
