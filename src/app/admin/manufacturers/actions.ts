"use server";

import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function normCode(s: string) {
  return s.trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, "");
}

export async function createManufacturer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const codeRaw = String(formData.get("code") ?? "");
  const code = normCode(codeRaw);

  const country = String(formData.get("country") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name) throw new Error("Name fehlt");
  if (!code) throw new Error("Code fehlt");

  const created = await prisma.manufacturer.create({
    data: { name, code, country, notes },
    select: { id: true },
  });

  revalidatePath("/admin/manufacturers");
  redirect(`/admin/manufacturers/${created.id}`);
}

export async function updateManufacturer(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const codeRaw = String(formData.get("code") ?? "");
  const code = normCode(codeRaw);

  const country = String(formData.get("country") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!id) throw new Error("ID fehlt");
  if (!name) throw new Error("Name fehlt");
  if (!code) throw new Error("Code fehlt");

  await prisma.manufacturer.update({
    where: { id },
    data: { name, code, country, notes },
  });

  revalidatePath("/admin/manufacturers");
  revalidatePath(`/admin/manufacturers/${id}`);
  redirect(`/admin/manufacturers/${id}`);
}

export async function deleteManufacturer(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID fehlt");

  await prisma.manufacturer.delete({ where: { id } });

  revalidatePath("/admin/manufacturers");
  redirect("/admin/manufacturers");
}
