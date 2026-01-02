import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/db/prisma";
import { supabasePublicUrl } from "@/lib/storage";
import LightboxImage from "@/components/LightboxImage";

type PageProps = {
  // Next.js 16.1 / Turbopack: params/searchParams can be Promises
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ inStock?: string }>;
};

export default async function ModelPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : undefined;

  

  const locale = "de"; // fix wie gewünscht
  const inStockDefault = true; // fix wie gewünscht
  const inStock =
    sp?.inStock === undefined ? inStockDefault : sp.inStock !== "0";

  if (!slug) notFound();

  const model = await prisma.firearmModel.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, description: true },
  });

  if (!model) notFound();

  const variants = await prisma.firearmVariant.findMany({
    where: { firearmModelId: model.id },
    orderBy: [{ yearFrom: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      yearFrom: true,
      yearTo: true,
      manufacturer: { select: { name: true } },
    },
  });

  const parts = await prisma.part.findMany({
    where: {
      fitments: { some: { firearmModelId: model.id } },
      ...(inStock ? { stockStatus: "IN_STOCK" } : {}),
    },
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
    <div className="p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{model.name}</h1>
        {model.description ? (
          <p className="text-sm text-gray-600 max-w-2xl">{model.description}</p>
        ) : null}
      </header>



      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Varianten</h2>
          <span className="text-xs text-gray-500">
            Sprache: <span className="font-medium">de</span>
          </span>
        </div>

        {variants.length === 0 ? (
          <p className="text-sm text-gray-500">Noch keine Varianten erfasst.</p>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {variants.map((v) => (
              <li key={v.id} className="rounded-2xl border p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {v.manufacturer?.name ? `${v.manufacturer.name} · ` : ""}
                      {v.yearFrom ?? "?"}–{v.yearTo ?? "?"}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-gray-500">
                    {v.slug}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Teile</h2>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Nur lagernd</span>
            <Link
              className="rounded-full border px-3 py-1 text-xs hover:bg-gray-50"
              href={
                inStock
                  ? `/models/${model.slug}?inStock=0`
                  : `/models/${model.slug}`
              }
            >
              {inStock ? "AN" : "AUS"}
            </Link>
          </div>
        </div>

        {parts.length === 0 ? (
          <p className="text-sm text-gray-500">
            {inStock
              ? "Keine lagernden Teile gefunden."
              : "Keine Teile gefunden."}
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {parts.map((p) => {
              const t = p.translations[0];
              const img = p.images[0];
              const thumbUrl = supabasePublicUrl(img?.thumbnailPath);
              const originalUrl = supabasePublicUrl(img?.originalPath);
              return (
                <li key={p.id} className="rounded-2xl border p-4 shadow-sm">
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
  <LightboxImage
    thumbUrl={thumbUrl}
    originalUrl={originalUrl}
    alt={img?.altText ?? t?.title ?? "Bild"}
  />
) : (
  <div className="text-xs text-gray-400">Kein Bild</div>
)}


                    <div className="pt-2 text-xs">
                      <span className="rounded-full border px-2 py-1">
                        Lager: {p.stockStatus} · Qty: {p.quantity}
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
      </section>
    </div>
  );
}
