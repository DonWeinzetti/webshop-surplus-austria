import { notFound } from "next/navigation";
import { prisma } from "@/db/prisma";
import { supabasePublicUrl } from "@/lib/storage";
import HotspotEditor from "@/components/HotspotEditor";

type PageProps = {
  params: Promise<{ id?: string }> | { id?: string };
};

export default async function DiagramEditPage({ params }: PageProps) {
  const p =
    typeof (params as any)?.then === "function"
      ? await (params as Promise<{ id?: string }>)
      : (params as { id?: string });

  const diagramId = p?.id;
  if (!diagramId) notFound();

  const diagram = await prisma.firearmDiagram.findUnique({
    where: { id: diagramId },
    select: {
      id: true,
      title: true,
      storagePath: true,
      widthPx: true,
      heightPx: true,
      firearmModel: { select: { slug: true } }, // default für FILTER
    },
  });

  if (!diagram) notFound();

  const imageUrl = supabasePublicUrl(diagram.storagePath);
  if (!imageUrl) notFound();

  // ---- Dropdown-Daten laden ----
const [parts, sets, categories] = await Promise.all([
  prisma.part.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      slug: true,
      sku: true,
      translations: {
        where: { locale: "de" },
        take: 1,
        select: { title: true },
      },
    },
  }),
  prisma.partSet.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      slug: true,
      translations: {
        where: { locale: "de" },
        take: 1,
        select: { title: true },
      },
    },
  }),
  prisma.partCategory.findMany({
    orderBy: { name: "asc" },
    take: 500,
    select: { id: true, slug: true, name: true },
  }),
]);

const partOptions = parts.map((p) => ({
  id: p.id,
  slug: p.slug,
  label: `${p.translations[0]?.title ?? p.slug}${p.sku ? ` (${p.sku})` : ""}`,
}));

const setOptions = sets.map((s) => ({
  id: s.id,
  slug: s.slug,
  label: s.translations[0]?.title ?? s.slug,
}));

const categoryOptions = categories.map((c) => ({
  id: c.id,
  slug: c.slug,
  label: c.name,
}));


  return (
    <div className="p-6 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Hotspot Editor</h1>
        <div className="text-sm text-gray-600">
          {diagram.title} · <span className="font-mono">{diagram.id}</span>
        </div>
      </div>

      <HotspotEditor
        diagramId={diagram.id}
        imageUrl={imageUrl}
        widthPx={diagram.widthPx ?? 1000}
        heightPx={diagram.heightPx ?? 1000}
        defaultModelSlug={diagram.firearmModel?.slug ?? null}
        partOptions={partOptions}
        setOptions={setOptions}
        categoryOptions={categoryOptions}
      />
    </div>
  );
}
