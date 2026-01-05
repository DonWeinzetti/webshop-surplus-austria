import Link from "next/link";
import { prisma } from "@/db/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const categories = await prisma.partCategory.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      parent: { select: { id: true, name: true } },
      _count: { select: { parts: true, children: true } },
      translations: {
        where: { locale: "de" },
        take: 1,
        select: { title: true },
      },
    },
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kategorien</h1>
          <p className="text-sm text-gray-600">Anlage / Änderung / Löschung + DE/EN Texte</p>
        </div>

        <Link
          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          href="/admin/categories/new"
        >
          + Neue Kategorie
        </Link>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Parent</th>
              <th className="p-3">Parts</th>
              <th className="p-3">Children</th>
              <th className="p-3">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => {
              const deTitle = c.translations[0]?.title;
              return (
                <tr key={c.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">
                      DE: {deTitle ?? "—"}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-xs">{c.slug}</td>
                  <td className="p-3 text-xs">{c.parent?.name ?? "—"}</td>
                  <td className="p-3">{c._count.parts}</td>
                  <td className="p-3">{c._count.children}</td>
                  <td className="p-3">
                    <Link
                      className="underline underline-offset-2"
                      href={`/admin/categories/${c.id}`}
                    >
                      Bearbeiten →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {categories.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-500" colSpan={6}>
                  Noch keine Kategorien vorhanden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
