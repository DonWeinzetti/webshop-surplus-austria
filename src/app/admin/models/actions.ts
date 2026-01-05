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

export async function createModel(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = normSlug(String(formData.get("slug") ?? ""));
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name) throw new Error("Name fehlt");
  if (!slug) throw new Error("Slug fehlt");

  const created = await prisma.firearmModel.create({
    data: { name, slug, description },
    select: { id: true },
  });

  revalidatePath("/admin/models");
  redirect(`/admin/models/${created.id}`);
}

export async function updateModel(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = normSlug(String(formData.get("slug") ?? ""));
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!id) throw new Error("ID fehlt");
  if (!name) throw new Error("Name fehlt");
  if (!slug) throw new Error("Slug fehlt");

  await prisma.firearmModel.update({
    where: { id },
    data: { name, slug, description },
  });

  revalidatePath("/admin/models");
  revalidatePath(`/admin/models/${id}`);
  redirect(`/admin/models/${id}`);
}

export async function deleteModel(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID fehlt");

  await prisma.firearmModel.delete({ where: { id } });

  revalidatePath("/admin/models");
  redirect("/admin/models");
}
