import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/db/prisma";
import { updateManufacturer, deleteManufacturer } from "../actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

async function unwrapParams(params: PageProps["params"]) {
  return typeof (params as any)?.then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string });
}

export default async function ManufacturerEditPage({ params }: PageProps) {
  const p = await unwrapParams(params);
  const id = p?.id;
  if (!id) notFound();

  const item = await prisma.manufacturer.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      code: true,
      country: true,
      notes: true,
      _count: { select: { variants: true, fitments: true } },
    },
  });

  if (!item) notFound();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Manufacturer bearbeiten</h1>
          <div className="text-sm text-gray-600">
            Variants: {item._count.variants} · Fitments: {item._count.fitments}
          </div>
        </div>

        <Link className="text-sm underline underline-offset-2" href="/admin/manufacturers">
          ← zurück
        </Link>
      </div>

      <form action={updateManufacturer} className="space-y-4 max-w-xl">
        <input type="hidden" name="id" value={item.id} />

        <div className="rounded-2xl border p-4 space-y-3">
          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Name</div>
            <input name="name" defaultValue={item.name} className="w-full border rounded-xl px-3 py-2 text-sm" required />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Code</div>
            <input name="code" defaultValue={item.code ?? ""} className="w-full border rounded-xl px-3 py-2 text-sm" required />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Country</div>
            <input name="country" defaultValue={item.country ?? ""} className="w-full border rounded-xl px-3 py-2 text-sm" />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Notes</div>
            <textarea name="notes" defaultValue={item.notes ?? ""} className="w-full border rounded-xl px-3 py-2 text-sm" rows={4} />
          </label>
        </div>

        <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">Speichern</button>
      </form>

      <form action={deleteManufacturer} className="max-w-xl rounded-2xl border border-red-200 bg-red-50 p-4">
        <input type="hidden" name="id" value={item.id} />
        <div className="text-sm font-medium text-red-800">Löschen</div>
        <p className="text-xs text-red-700 mt-1">
          Achtung: Wenn Manufacturer noch in Varianten/Fitments verwendet wird, kann das Löschen fehlschlagen.
        </p>
        <button className="mt-3 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm hover:bg-red-100">
          Manufacturer löschen
        </button>
      </form>
    </div>
  );
}
