import Link from "next/link";
import { prisma } from "@/db/prisma";
import { createVariant } from "../actions";

export const dynamic = "force-dynamic";

export default async function VariantNewPage() {
  const [models, manufacturers] = await Promise.all([
    prisma.firearmModel.findMany({
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.manufacturer.findMany({
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, code: true },
    }),
  ]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Neue Variante</h1>
        <Link className="text-sm underline underline-offset-2" href="/admin/variants">
          ← zurück
        </Link>
      </div>

      <form action={createVariant} className="space-y-4 max-w-3xl">
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-1">
              <div className="text-xs text-gray-600">Model</div>
              <select name="firearmModelId" className="w-full border rounded-xl px-3 py-2 text-sm" required>
                <option value="">Bitte wählen…</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.slug})
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <div className="text-xs text-gray-600">Manufacturer (optional)</div>
              <select name="manufacturerId" className="w-full border rounded-xl px-3 py-2 text-sm">
                <option value="">—</option>
                {manufacturers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.code ? ` (${m.code})` : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-1">
              <div className="text-xs text-gray-600">Name</div>
              <input
                name="name"
                className="w-full border rounded-xl px-3 py-2 text-sm"
                placeholder="K98k (Standard)"
                required
              />
            </label>

            <label className="block space-y-1">
              <div className="text-xs text-gray-600">Slug</div>
              <input
                name="slug"
                className="w-full border rounded-xl px-3 py-2 text-sm"
                placeholder="k98k-standard"
                required
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-1">
              <div className="text-xs text-gray-600">Year from (optional)</div>
              <input name="yearFrom" className="w-full border rounded-xl px-3 py-2 text-sm" inputMode="numeric" />
            </label>

            <label className="block space-y-1">
              <div className="text-xs text-gray-600">Year to (optional)</div>
              <input name="yearTo" className="w-full border rounded-xl px-3 py-2 text-sm" inputMode="numeric" />
            </label>
          </div>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Beschreibung (optional)</div>
            <textarea name="description" className="w-full border rounded-xl px-3 py-2 text-sm" rows={4} />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Notes (optional)</div>
            <textarea name="notes" className="w-full border rounded-xl px-3 py-2 text-sm" rows={4} />
          </label>
        </div>

        <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
          Anlegen
        </button>
      </form>
    </div>
  );
}
