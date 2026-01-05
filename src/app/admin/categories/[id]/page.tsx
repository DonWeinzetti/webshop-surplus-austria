import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/db/prisma";
import { updateCategory, deleteCategory } from "../actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

async function unwrapParams(params: PageProps["params"]) {
  return typeof (params as any)?.then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string });
}

export default async function CategoryEditPage({ params }: PageProps) {
  const p = await unwrapParams(params);
  const id = p?.id;
  if (!id) notFound();

  const category = await prisma.partCategory.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      name: true,
      parentId: true,
      _count: { select: { parts: true, children: true } },
      translations: {
        where: { locale: { in: ["de", "en"] } },
        select: { locale: true, title: true, description: true },
      },
    },
  });

  if (!category) notFound();

  const parents = await prisma.partCategory.findMany({
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true },
    where: { id: { not: category.id } },
  });

  const de = category.translations.find((t) => t.locale === "de");
  const en = category.translations.find((t) => t.locale === "en");

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kategorie bearbeiten</h1>
          <div className="text-sm text-gray-600">
            ID: <span className="font-mono text-xs">{category.id}</span> · Parts:{" "}
            {category._count.parts} · Children: {category._count.children}
          </div>
        </div>

        <Link className="text-sm underline underline-offset-2" href="/admin/categories">
          ← zurück
        </Link>
      </div>

      <form action={updateCategory} className="space-y-6 max-w-2xl">
        <input type="hidden" name="id" value={category.id} />

        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-medium">Stammdaten</div>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Slug</div>
            <input
              name="slug"
              defaultValue={category.slug}
              className="w-full border rounded-xl px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Name (intern, Anzeige fallback)</div>
            <input
              name="name"
              defaultValue={category.name}
              className="w-full border rounded-xl px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Parent Kategorie (optional)</div>
            <select
              name="parentId"
              className="w-full border rounded-xl px-3 py-2 text-sm"
              defaultValue={category.parentId ?? ""}
            >
              <option value="">— keine —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-2xl border p-4 space-y-4">
          <div className="text-sm font-medium">Deutsch (de)</div>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Titel</div>
            <input
              name="deTitle"
              defaultValue={de?.title ?? ""}
              className="w-full border rounded-xl px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Beschreibung</div>
            <textarea
              name="deDescription"
              defaultValue={de?.description ?? ""}
              className="w-full border rounded-xl px-3 py-2 text-sm"
              rows={4}
            />
          </label>
        </div>

        <div className="rounded-2xl border p-4 space-y-4">
          <div className="text-sm font-medium">English (en)</div>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Title</div>
            <input
              name="enTitle"
              defaultValue={en?.title ?? ""}
              className="w-full border rounded-xl px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Description</div>
            <textarea
              name="enDescription"
              defaultValue={en?.description ?? ""}
              className="w-full border rounded-xl px-3 py-2 text-sm"
              rows={4}
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
            Speichern
          </button>
        </div>
      </form>

      <form
        action={deleteCategory}
        className="max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-4"
      >
        <input type="hidden" name="id" value={category.id} />
        <div className="text-sm font-medium text-red-800">Löschen</div>
        <p className="text-xs text-red-700 mt-1">
          Achtung: Parts verlieren dann die Kategorie (categoryId wird null), Children verlieren den Parent (parentId wird null).
        </p>
        <button className="admin-btn admin-btn-danger">
          Kategorie löschen
        </button>
      </form>
    </div>
  );
}
