import Link from "next/link";
import { prisma } from "@/db/prisma";

export const dynamic = "force-dynamic";

export default async function ManufacturersPage() {
  const items = await prisma.manufacturer.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      code: true,
      country: true,
      _count: { select: { variants: true, fitments: true } },
    },
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Manufacturer</h1>
          <p className="text-sm text-gray-600">Anlegen, ändern, löschen</p>
        </div>

        <Link className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50" href="/admin/manufacturers/new">
          + Neu
        </Link>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Code</th>
              <th className="p-3">Country</th>
              <th className="p-3">Variants</th>
              <th className="p-3">Fitments</th>
              <th className="p-3">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3 font-mono text-xs">{m.code ?? "—"}</td>
                <td className="p-3 text-xs">{m.country ?? "—"}</td>
                <td className="p-3">{m._count.variants}</td>
                <td className="p-3">{m._count.fitments}</td>
                <td className="p-3">
                  <Link className="underline underline-offset-2" href={`/admin/manufacturers/${m.id}`}>
                    Bearbeiten →
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-500" colSpan={6}>
                  Noch keine Manufacturer vorhanden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
