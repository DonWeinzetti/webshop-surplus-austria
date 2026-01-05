import Link from "next/link";
import { prisma } from "@/db/prisma";

export const dynamic = "force-dynamic";

export default async function VariantsPage() {
  const items = await prisma.firearmVariant.findMany({
    orderBy: [{ updatedAt: "desc" }],
    take: 200,
    select: {
      id: true,
      name: true,
      slug: true,
      yearFrom: true,
      yearTo: true,
      firearmModel: { select: { name: true, slug: true } },
      manufacturer: { select: { name: true, code: true } }, // falls relation existiert
      _count: { select: { fitments: true } },
      updatedAt: true,
    } as any,
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Varianten</h1>
          <p className="text-sm text-gray-600">FirearmVariant – CRUD</p>
        </div>

        <Link className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50" href="/admin/variants/new">
          + Neu
        </Link>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">Variante</th>
              <th className="p-3">Model</th>
              <th className="p-3">Manufacturer</th>
              <th className="p-3">Jahre</th>
              <th className="p-3">Fitments</th>
              <th className="p-3">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{v.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{v.slug}</div>
                </td>
                <td className="p-3">
                  <div className="text-sm">{v.firearmModel?.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{v.firearmModel?.slug}</div>
                </td>
                <td className="p-3 text-xs">
                  {v.manufacturer?.name ?? "—"}
                  {v.manufacturer?.code ? <span className="text-gray-500"> · {v.manufacturer.code}</span> : null}
                </td>
                <td className="p-3 text-xs">
                  {(v.yearFrom ?? "—") + "–" + (v.yearTo ?? "—")}
                </td>
                <td className="p-3">{(v as any)._count?.fitments ?? 0}</td>
                <td className="p-3">
                  <Link className="underline underline-offset-2" href={`/admin/variants/${v.id}`}>
                    Bearbeiten →
                  </Link>
                </td>
              </tr>
            ))}

            {items.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-500" colSpan={6}>
                  Noch keine Varianten vorhanden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
