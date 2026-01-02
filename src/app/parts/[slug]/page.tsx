import { prisma } from "@/db/prisma";

export default async function PartPage({ params }: { params: { slug: string } }) {
  const locale = "de";

  const part = await prisma.part.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      sku: true,
      stockStatus: true,
      quantity: true,
      notes: true,
      category: { select: { name: true } },
      translations: { where: { locale }, take: 1, select: { title: true, description: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { originalPath: true, thumbnailPath: true, altText: true } },
      fitments: {
        select: {
          firearmModel: { select: { name: true, slug: true } },
          firearmVariant: { select: { name: true, slug: true } },
          manufacturer: { select: { name: true } },
          confidence: true,
        },
      },
    },
  });

  if (!part) return <div className="p-6">Teil nicht gefunden.</div>;

  const t = part.translations[0];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{t?.title ?? part.slug}</h1>
      <div className="text-sm text-gray-600">
        {part.category?.name ?? "Ohne Kategorie"} · {part.sku ?? part.slug}
      </div>

      {t?.description ? <p className="text-sm">{t.description}</p> : null}

      <div className="text-sm">
        Lager: <span className="font-medium">{part.stockStatus}</span> · Qty:{" "}
        <span className="font-medium">{part.quantity}</span>
      </div>

      {part.images.length ? (
        <div className="space-y-1 text-xs text-gray-500">
          {part.images.map((img, idx) => (
            <div key={idx} className="font-mono">
              {img.thumbnailPath ?? "-"} | {img.originalPath}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-400">Keine Bilder</div>
      )}

      <div className="pt-2">
        <div className="font-medium">Kompatibilität</div>
        <ul className="text-sm list-disc pl-5">
          {part.fitments.map((f, i) => (
            <li key={i}>
              {f.firearmModel.name}
              {f.firearmVariant?.name ? ` – ${f.firearmVariant.name}` : ""}
              {f.manufacturer?.name ? ` (${f.manufacturer.name})` : ""} ·{" "}
              {f.confidence}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
