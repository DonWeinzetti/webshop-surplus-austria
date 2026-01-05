import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/db/prisma";
import { updateVariant, deleteVariant } from "../actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

async function unwrapParams(params: PageProps["params"]) {
  return typeof (params as any)?.then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string });
}

export default async function VariantEditPage({ params }: PageProps) {
  const p = await unwrapParams(params);
  const id = p?.id;
  if (!id) notFound();

  // Wichtig: Variant ist EIN Objekt, keine Promise.all-Verwechslung
  const variant = await prisma.firearmVariant.findUnique({
    where: { id },
    select: {
      id: true,
      firearmModelId: true,
      manufacturerId: true, // falls im Schema vorhanden
      name: true,
      slug: true,
      yearFrom: true,
      yearTo: true,
      notes: true,
      _count: { select: { fitments: true } },
    } as any,
  });

  if (!variant) notFound();

  const [models, manufacturers] = await Promise.all([
    prisma.firearmModel.findMany({
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.manufacturer.findMany({
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, code: true }, // Manufacturer hat KEIN slug
    }),
  ]);

  const fitmentCount = (variant as any)?._count?.fitments ?? 0;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Variante bearbeiten</h1>
          <div className="text-sm text-gray-600">Fitments: {fitmentCount}</div>
        </div>

        <Link className="text-sm underline underline-offset-2" href="/admin/variants">
          ← zurück
        </Link>
      </div>

      <form action={updateVariant} className="space-y-4 max-w-3xl">
        {/* ✅ hier ist variant.id garantiert string */}
        <input type="hidden" name="id" value={String((variant as any).id)} />

        <div className="rounded-2xl border p-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-1">
              <div className="text-xs text-gray-600">Model</div>
              <select
                name="firearmModelId"
                defaultValue={String((variant as any).firearmModelId)}
                className="w-full border rounded-xl px-3 py-2 text-sm"
                required
              >
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
              <select
                name="manufacturerId"
                defaultValue={String(((variant as any).manufacturerId ?? "") as string)}
                className="w-full border rounded-xl px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {manufacturers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {m.code ? ` (${m.code})` : ""}
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
                defaultValue={String((variant as any).name)}
                className="w-full border rounded-xl px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="block space-y-1">
              <div className="text-xs text-gray-600">Slug</div>
              <input
                name="slug"
                defaultValue={String((variant as any).slug)}
                className="w-full border rounded-xl px-3 py-2 text-sm"
                required
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-1">
              <div className="text-xs text-gray-600">Year from</div>
              <input
                name="yearFrom"
                defaultValue={(variant as any).yearFrom ?? ""}
                className="w-full border rounded-xl px-3 py-2 text-sm"
                inputMode="numeric"
              />
            </label>

            <label className="block space-y-1">
              <div className="text-xs text-gray-600">Year to</div>
              <input
                name="yearTo"
                defaultValue={(variant as any).yearTo ?? ""}
                className="w-full border rounded-xl px-3 py-2 text-sm"
                inputMode="numeric"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Notes</div>
            <textarea
              name="notes"
              defaultValue={(variant as any).notes ?? ""}
              className="w-full border rounded-xl px-3 py-2 text-sm"
              rows={4}
            />
          </label>
        </div>

        <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
          Speichern
        </button>
      </form>

      <form action={deleteVariant} className="max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-4">
        <input type="hidden" name="id" value={String((variant as any).id)} />
        <div className="text-sm font-medium text-red-800">Löschen</div>
        <p className="text-xs text-red-700 mt-1">
          Achtung: Wenn die Variante in Fitments/Diagrammen verwendet wird, kann das Löschen fehlschlagen.
        </p>
        <button className="mt-3 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm hover:bg-red-100">
          Variante löschen
        </button>
      </form>
    </div>
  );
}
