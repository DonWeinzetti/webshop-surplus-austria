import Link from "next/link";
import { prisma } from "@/db/prisma";
import { supabasePublicUrl } from "@/lib/storage";

type SearchParams =
  | Promise<{ q?: string; inStock?: string }>
  | { q?: string; inStock?: string };

type PageProps = {
  searchParams?: SearchParams;
};

export const dynamic = "force-dynamic";

export default async function AdminPartsPage({ searchParams }: PageProps) {
  const sp =
    searchParams &&
    (typeof (searchParams as any)?.then === "function"
      ? await (searchParams as Promise<any>)
      : (searchParams as any));

  const q = sp?.q ? String(sp.q).trim() : "";
  const inStock = sp?.inStock === undefined ? false : String(sp.inStock) !== "0";

  const where: any = {};
  if (inStock) where.stockStatus = "IN_STOCK";

  if (q) {
    where.OR = [
      { slug: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { translations: { some: { locale: "de", title: { contains: q, mode: "insensitive" } } } },
      { translations: { some: { locale: "en", title: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const items = await prisma.part.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    take: 200,
    select: {
      id: true,
      slug: true,
      sku: true,
      stockStatus: true,
      quantity: true,
      category: { select: { name: true } },
      translations: {
        where: { locale: "de" },
        take: 1,
        select: { title: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { thumbnailPath: true, originalPath: true },
      },
    },
  });

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin · Teile (Parts)</h1>
          <div className="text-sm text-gray-600">Anlegen, bearbeiten, Bilder & Lagerstand.</div>
        </div>

        <Link className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50" href="/admin/parts/new">
          + Neues Teil
        </Link>
      </header>

      <div className="rounded-2xl border p-4 bg-black space-y-3">
        <form className="flex flex-wrap items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Suche: Titel, SKU, Slug…"
            className="border rounded-xl px-3 py-2 text-sm w-72"
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="inStock" value="1" defaultChecked={inStock} />
            nur lagernd
          </label>

          <button className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50" type="submit">
            Filtern
          </button>

          {(q || inStock) ? (
            <Link className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50" href="/admin/parts">
              Reset
            </Link>
          ) : null}
        </form>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 text-left">Teil</th>
              <th className="p-3 text-left">Kategorie</th>
              <th className="p-3 text-left">Lager</th>
              <th className="p-3 text-left">Bild</th>
              <th className="p-3 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const title = p.translations[0]?.title ?? "(DE Titel fehlt)";
              const img = p.images[0];
              const url = supabasePublicUrl(img?.thumbnailPath) ?? supabasePublicUrl(img?.originalPath);

              return (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{title}</div>
                    <div className="text-xs text-gray-500 font-mono">
                      {p.sku ? `SKU ${p.sku} · ` : ""}slug {p.slug}
                    </div>
                  </td>

                  <td className="p-3">{p.category?.name ?? "—"}</td>

                  <td className="p-3">
                    <span className="rounded-full border px-2 py-1 text-xs">
                      {p.stockStatus} · Qty {p.quantity}
                    </span>
                  </td>

                  <td className="p-3">
                    {url ? (
                      <img src={url} alt="" className="h-12 w-12 rounded-lg border object-contain bg-black" />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <Link className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50" href={`/admin/parts/${p.id}`}>
                      Öffnen
                    </Link>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 ? (
              <tr>
                <td className="p-6 text-sm text-gray-500" colSpan={5}>
                  Keine Teile gefunden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
