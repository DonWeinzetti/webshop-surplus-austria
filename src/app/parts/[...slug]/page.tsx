import Link from "next/link";
import { prisma } from "@/db/prisma";
import { supabasePublicUrl } from "@/lib/storage";

type SearchParams =
  | Promise<{
      cat?: string;
      f?: string;
      q?: string;
      inStock?: string;
    }>
  | {
      cat?: string;
      f?: string;
      q?: string;
      inStock?: string;
    };

type PageProps = {
  searchParams?: SearchParams;
};

function fromBase64UrlToJson(b64url: string): any | null {
  try {
    // base64url -> base64
    let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    // pad
    while (b64.length % 4 !== 0) b64 += "=";

    const jsonStr = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Wir erlauben nur eine WHITELIST an Filter-Feldern aus filterJson,
 * damit keine “freien Prisma where”-Objekte aus der URL kommen.
 */
function filterJsonToWhere(filterJson: any) {
  if (!filterJson || typeof filterJson !== "object") return {};

  const where: any = {};

  // Beispiele für erlaubte Filter (du kannst das später erweitern)
  if (typeof filterJson.categorySlug === "string" && filterJson.categorySlug) {
    where.category = { is: { slug: filterJson.categorySlug } };
  }

  if (typeof filterJson.inStock === "boolean") {
    if (filterJson.inStock) where.stockStatus = "IN_STOCK";
  }

  if (typeof filterJson.stockStatus === "string" && filterJson.stockStatus) {
    // nur erlaubte Status
    const allowed = new Set(["IN_STOCK", "OUT_OF_STOCK", "DISCONTINUED"]);
    if (allowed.has(filterJson.stockStatus)) where.stockStatus = filterJson.stockStatus;
  }

  if (typeof filterJson.condition === "string" && filterJson.condition) {
    // Beispiel: "USED", "NEW", ...
    where.condition = filterJson.condition;
  }

  if (typeof filterJson.authenticity === "string" && filterJson.authenticity) {
    where.authenticity = filterJson.authenticity;
  }

  // Fitment-Filter (z.B. nach Modell/Variante)
  if (typeof filterJson.modelSlug === "string" && filterJson.modelSlug) {
    where.fitments = {
      some: {
        firearmModel: { is: { slug: filterJson.modelSlug } },
      },
    };
  }

  if (typeof filterJson.variantSlug === "string" && filterJson.variantSlug) {
    where.fitments = {
      some: {
        firearmVariant: { is: { slug: filterJson.variantSlug } },
      },
    };
  }

  return where;
}

export default async function PartsPage({ searchParams }: PageProps) {
  const sp =
    searchParams &&
    (typeof (searchParams as any)?.then === "function"
      ? await (searchParams as Promise<any>)
      : (searchParams as any));

  const locale = "de";

  const cat = sp?.cat ? String(sp.cat) : undefined;
  const q = sp?.q ? String(sp.q) : undefined;

  // Default: nur lagernd AN
  const inStock =
    sp?.inStock === undefined ? true : String(sp.inStock) !== "0";

  // filterJson aus ?f=
  const filterJson = sp?.f ? fromBase64UrlToJson(String(sp.f)) : null;

  // Basis-Where
  const where: any = {};

  // inStock
  if (inStock) where.stockStatus = "IN_STOCK";

  // category über ?cat=
  if (cat) {
    where.category = { is: { slug: cat } };
  }

  // filterJson (whitelist)
  const whereFromF = filterJsonToWhere(filterJson);
  Object.assign(where, whereFromF);

  // Search / q (Titel/Slug/SKU)
  // -> wir suchen über translations.title + slug + sku (simple & effektiv)
  if (q && q.trim()) {
    const qq = q.trim();
    where.OR = [
      { slug: { contains: qq, mode: "insensitive" } },
      { sku: { contains: qq, mode: "insensitive" } },
      { translations: { some: { locale, title: { contains: qq, mode: "insensitive" } } } },
    ];
  }

  const parts = await prisma.part.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      sku: true,
      stockStatus: true,
      quantity: true,
      category: { select: { name: true, slug: true } },
      translations: {
        where: { locale },
        take: 1,
        select: { title: true, description: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { thumbnailPath: true, originalPath: true, altText: true },
      },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Teile</h1>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full border px-3 py-1">
            Nur lagernd: <b>{inStock ? "AN" : "AUS"}</b>
          </span>

          <Link
            className="rounded-full border px-3 py-1 hover:bg-gray-50"
            href={
              inStock
                ? `/parts?${cat ? `cat=${encodeURIComponent(cat)}&` : ""}${q ? `q=${encodeURIComponent(q)}&` : ""}${sp?.f ? `f=${encodeURIComponent(String(sp.f))}&` : ""}inStock=0`
                : `/parts?${cat ? `cat=${encodeURIComponent(cat)}&` : ""}${q ? `q=${encodeURIComponent(q)}&` : ""}${sp?.f ? `f=${encodeURIComponent(String(sp.f))}&` : ""}`
            }
          >
            Toggle
          </Link>

          {cat ? (
            <span className="rounded-full border px-3 py-1">
              Kategorie: <span className="font-mono">{cat}</span>
            </span>
          ) : null}

          {filterJson ? (
            <span className="rounded-full border px-3 py-1">
              Filter: <span className="font-mono">f=…</span>
            </span>
          ) : null}

          {q ? (
            <span className="rounded-full border px-3 py-1">
              Suche: <span className="font-mono">{q}</span>
            </span>
          ) : null}
        </div>
      </header>

      {parts.length === 0 ? (
        <div className="text-sm text-gray-500">Keine Teile gefunden.</div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {parts.map((p) => {
            const t = p.translations[0];
            const img = p.images[0];
            const thumbUrl = supabasePublicUrl(img?.thumbnailPath);
            const originalUrl = supabasePublicUrl(img?.originalPath);

            return (
              <li key={p.id} className="rounded-2xl border p-4 shadow-sm bg-black">
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 flex justify-between gap-2">
                    <span>{p.category?.name ?? "Ohne Kategorie"}</span>
                    <span className="font-mono">{p.sku ?? p.slug}</span>
                  </div>

                  <div className="font-medium">
                    {t?.title ?? "(DE Titel fehlt)"}
                  </div>

                  {t?.description ? (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {t.description}
                    </p>
                  ) : null}

                  {thumbUrl || originalUrl ? (
                    <img
                      src={thumbUrl ?? originalUrl ?? ""}
                      alt={img?.altText ?? t?.title ?? "Bild"}
                      className="h-40 w-40 object-contain rounded-xl border bg-black"
                    />
                  ) : (
                    <div className="text-xs text-gray-400">Kein Bild</div>
                  )}

                  <div className="pt-2 text-xs">
                    <span className="rounded-full border px-2 py-1">
                      Lager: {p.stockStatus}
                      {typeof p.quantity === "number" ? ` · Qty: ${p.quantity}` : ""}
                    </span>
                  </div>

                  <div className="pt-2">
                    <Link
                      className="text-sm underline underline-offset-2"
                      href={`/parts/${p.slug}`}
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
