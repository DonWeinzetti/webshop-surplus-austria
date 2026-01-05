import Link from "next/link";
import { prisma } from "@/db/prisma";
import { createCategory } from "../actions";

export const dynamic = "force-dynamic";

export default async function CategoryNewPage() {
  const parents = await prisma.partCategory.findMany({
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Neue Kategorie</h1>
        <Link className="text-sm underline underline-offset-2" href="/admin/categories">
          ← zurück
        </Link>
      </div>

      <form action={createCategory} className="space-y-6 max-w-2xl">
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-medium">Stammdaten</div>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Slug</div>
            <input name="slug" className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="z. B. receiver-parts" required />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Name (intern, Anzeige fallback)</div>
            <input name="name" className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="z. B. Receiver Teile" required />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Parent Kategorie (optional)</div>
            <select name="parentId" className="w-full border rounded-xl px-3 py-2 text-sm" defaultValue="">
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
            <input name="deTitle" className="w-full border rounded-xl px-3 py-2 text-sm" required />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Beschreibung</div>
            <textarea name="deDescription" className="w-full border rounded-xl px-3 py-2 text-sm" rows={4} />
          </label>
        </div>

        <div className="rounded-2xl border p-4 space-y-4">
          <div className="text-sm font-medium">English (en)</div>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Title</div>
            <input name="enTitle" className="w-full border rounded-xl px-3 py-2 text-sm" required />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Description</div>
            <textarea name="enDescription" className="w-full border rounded-xl px-3 py-2 text-sm" rows={4} />
          </label>
        </div>

        <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
          Kategorie anlegen
        </button>
      </form>
    </div>
  );
}
