import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/db/prisma";
import { supabasePublicUrl } from "@/lib/storage";
import LightboxImage from "@/components/LightboxImage";
import DiagramViewer from "@/components/DiagramViewer";

type PageProps = {
  params: Promise<{ slug?: string[] }> | { slug?: string[] };
  searchParams?: Promise<{ inStock?: string }> | { inStock?: string };
};

export default async function ModelPage({ params, searchParams }: PageProps) {
  // ---- params / searchParams robust auflösen (Next 16 safe)
  const p =
    typeof (params as any)?.then === "function"
      ? await (params as Promise<{ slug?: string[] }>)
      : (params as { slug?: string[] });

  const sp =
    searchParams &&
    (typeof (searchParams as any)?.then === "function"
      ? await (searchParams as Promise<{ inStock?: string }>)
      : (searchParams as { inStock?: string }));

  const slug = p?.slug?.[0];
  if (!slug) notFound();

  const locale = "de";
  const inStockDefault = true;
  const inStock =
    sp?.inStock === undefined ? inStockDefault : sp.inStock !== "0";

  // ------------------------------------------------------------
  // Modell + Diagramme (inkl. Hotspots)
  // ------------------------------------------------------------
  const model = await prisma.firearmModel.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      diagrams: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          storagePath: true,
          widthPx: true,
          heightPx: true,
          hotspots: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              label: true,
              shapeType: true,
              pointsJson: true,
              linkType: true,
              part: { select: { slug: true } },
              partSet: { select: { slug: true } },
              category: { select: { slug: true } },
              filterJson: true,
            },
          },
        },
      },
    },
  });

  if (!model) notFound();

  // ------------------------------------------------------------
  // Varianten
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Teile
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Diagramm vorbereiten (erstes Diagramm anzeigen)
  // ------------------------------------------------------------
  const firstDiagram = model.diagrams[0];
  const diagramUrl = supabasePublicUrl(firstDiagram?.storagePath);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="p-6 space-y-10">
      {/* ================= HEADER ================= */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{model.name}</h1>
        {model.description && (
          <p className="text-sm text-gray-600 max-w-2xl">
            {model.description}
          </p>
        )}
      </header>

      {/* ================= EXPLOSIONSZEICHNUNG ================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Explosionszeichnung</h2>

          {firstDiagram && (
            <div className="flex items-center gap-3 text-sm">
              <Link
                className="underline"
                href={`/diagrams/${firstDiagram.id}`}
              >
                Öffnen →
              </Link>
              <Link
                className="underline"
                href={`/admin/diagrams/${firstDiagram.id}/edit`}
              >
                Hotspots bearbeiten →
              </Link>
            </div>
          )}
        </div>

        {!firstDiagram ? (
          <p className="text-sm text-gray-500">
            Noch keine Explosionszeichnung hinterlegt.
          </p>
        ) : !diagramUrl ? (
          <p className="text-sm text-red-600">
            Diagramm hat keinen gültigen storagePath.
          </p>
        ) : (
          <DiagramViewer
            imageUrl={diagramUrl}
            widthPx={firstDiagram.widthPx ?? 1000}
            heightPx={firstDiagram.heightPx ?? 1000}
            hotspots={firstDiagram.hotspots}
          />
        )}
      </section>

      {/* ================= VARIANTEN ================= */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Varianten</h2>

        {variants.length === 0 ? (
          <p className="text-sm text-gray-500">
            Noch keine Varianten erfasst.
          </p>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {variants.map((v) => (
              <li key={v.id} className="rounded-2xl border p-4 shadow-sm">
                <div className="font-medium">{v.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {v.manufacturer?.name
                    ? `${v.manufacturer.name} · `
                    : ""}
                  {v.yearFrom ?? "?"}–{v.yearTo ?? "?"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ================= TEILE ================= */}
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
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>{p.category?.name ?? "Ohne Kategorie"}</span>
                      <span className="font-mono">{p.sku ?? p.slug}</span>
                    </div>

                    <div className="font-medium">
                      {t?.title ?? "(DE Titel fehlt)"}
                    </div>

                    {t?.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {t.description}
                      </p>
                    )}

                    {thumbUrl || originalUrl ? (
                      <LightboxImage
                        thumbUrl={thumbUrl}
                        originalUrl={originalUrl}
                        alt={img?.altText ?? t?.title ?? p.slug}
                      />
                    ) : (
                      <div className="text-xs text-gray-400">
                        Kein Bild
                      </div>
                    )}

                    <div className="pt-2 text-xs">
                      <span className="rounded-full border px-2 py-1">
                        Lager: {p.stockStatus}
                        {typeof p.quantity === "number"
                          ? ` · Qty: ${p.quantity}`
                          : ""}
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
