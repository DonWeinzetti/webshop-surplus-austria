import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/db/prisma";
import { supabasePublicUrl } from "@/lib/storage";
import {
  updatePart,
  deletePart,
  uploadPartImage,
  deletePartImage,
  movePartImage,
} from "../actions";

type PageProps = {
  params: Promise<{ id?: string }> | { id?: string };
};

export const dynamic = "force-dynamic";

export default async function AdminPartEditPage({ params }: PageProps) {
  const p =
    typeof (params as any)?.then === "function"
      ? await (params as Promise<{ id?: string }>)
      : (params as { id?: string });

  const id = p?.id;
  if (!id) notFound();

  const [part, categories] = await Promise.all([
    prisma.part.findUnique({
      where: { id },
      select: {
        id: true,
        sku: true,
        slug: true,
        categoryId: true,
        condition: true,
        authenticity: true,
        stockStatus: true,
        quantity: true,
        notes: true,
        translations: {
          select: { locale: true, title: true, description: true },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, originalPath: true, thumbnailPath: true, altText: true, sortOrder: true },
        },
      },
    }),
    prisma.partCategory.findMany({
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!part) notFound();

  const tDe = part.translations.find((t) => t.locale === "de");
  const tEn = part.translations.find((t) => t.locale === "en");

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Teil bearbeiten</h1>
          <div className="text-sm text-gray-600 font-mono">{part.id}</div>
        </div>

        <div className="flex items-center gap-2">
          <Link className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50" href="/admin/parts">
            ← Zurück
          </Link>

          <form action={deletePart}>
            <input type="hidden" name="id" value={part.id} />
            <button className="rounded-xl border px-4 py-2 text-sm hover:bg-red-50 text-red-700" type="submit">
              Löschen
            </button>
          </form>
        </div>
      </header>

      <form action={updatePart} className="space-y-4 max-w-5xl">
        <input type="hidden" name="id" value={part.id} />

        <div className="rounded-2xl border p-4 space-y-3 bg-gray-800">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm font-medium">Slug</div>
              <input name="slug" defaultValue={part.slug} className="border rounded-xl px-3 py-2 text-sm w-full" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">SKU</div>
              <input name="sku" defaultValue={part.sku ?? ""} className="border rounded-xl px-3 py-2 text-sm w-full" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Kategorie</div>
              <select name="categoryId" className="border rounded-xl px-3 py-2 text-sm w-full" defaultValue={part.categoryId ?? ""}>
                <option value="">— keine —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <div className="text-sm font-medium">Zustand</div>
                <select name="condition" className="border rounded-xl px-3 py-2 text-sm w-full" defaultValue={String(part.condition)}>
                  <option value="UNKNOWN">UNKNOWN</option>
                  <option value="NEW">NEW</option>
                  <option value="USED">USED</option>
                  <option value="NOS">NOS</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Authentizität</div>
                <select name="authenticity" className="border rounded-xl px-3 py-2 text-sm w-full" defaultValue={String(part.authenticity)}>
                  <option value="UNKNOWN">UNKNOWN</option>
                  <option value="ORIGINAL">ORIGINAL</option>
                  <option value="REPRO">REPRO</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <div className="text-sm font-medium">StockStatus</div>
                <select name="stockStatus" className="border rounded-xl px-3 py-2 text-sm w-full" defaultValue={String(part.stockStatus)}>
                  <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                  <option value="IN_STOCK">IN_STOCK</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Quantity</div>
                <input name="quantity" type="number" defaultValue={part.quantity} className="border rounded-xl px-3 py-2 text-sm w-full" />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <div className="text-sm font-medium">Notes (intern)</div>
              <textarea name="notes" defaultValue={part.notes ?? ""} className="border rounded-xl px-3 py-2 text-sm w-full" rows={3} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-4 space-y-3 bg-gray-800">
          <div className="text-sm font-semibold">Übersetzungen</div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Deutsch (de)</div>
              <input name="title_de" defaultValue={tDe?.title ?? ""} className="border rounded-xl px-3 py-2 text-sm w-full" placeholder="Titel DE" />
              <textarea name="description_de" defaultValue={tDe?.description ?? ""} className="border rounded-xl px-3 py-2 text-sm w-full" rows={4} placeholder="Beschreibung DE" />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Englisch (en)</div>
              <input name="title_en" defaultValue={tEn?.title ?? ""} className="border rounded-xl px-3 py-2 text-sm w-full" placeholder="Title EN" />
              <textarea name="description_en" defaultValue={tEn?.description ?? ""} className="border rounded-xl px-3 py-2 text-sm w-full" rows={4} placeholder="Description EN" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50" type="submit">
            Speichern
          </button>

          <Link className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50" href={`/parts/${part.slug}`}>
            Im Shop ansehen →
          </Link>
        </div>
      </form>

      {/* Images */}
      <div className="rounded-2xl border p-4 bg-gray-800 space-y-3 max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Bilder</div>
          <div className="text-xs text-gray-500">Upload → Supabase Storage</div>
        </div>

        <form action={uploadPartImage} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="partId" value={part.id} />
          <div className="space-y-1">
            <div className="text-xs text-gray-600">Datei</div>
            <input type="file" name="file" accept="image/*" className="text-sm" required />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">Alt Text (optional)</div>
            <input name="altText" className="border rounded-xl px-3 py-2 text-sm w-72" placeholder="z.B. K98k Kimme rechts" />
          </div>
          <button className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50" type="submit">
            Upload
          </button>
        </form>

        {part.images.length === 0 ? (
          <div className="text-sm text-gray-500">Noch keine Bilder.</div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {part.images.map((img, idx) => {
              const url = supabasePublicUrl(img.thumbnailPath) ?? supabasePublicUrl(img.originalPath);
              return (
                <li key={img.id} className="rounded-2xl border p-3 flex gap-3">
                  <div className="shrink-0">
                    {url ? (
                      <img src={url} alt={img.altText ?? ""} className="h-24 w-24 rounded-xl border object-contain bg-black" />
                    ) : (
                      <div className="h-24 w-24 rounded-xl border bg-gray-50" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-xs text-gray-500">sortOrder: {img.sortOrder}</div>
                    <div className="text-xs text-gray-500 font-mono break-all">{img.originalPath}</div>
                    {img.altText ? <div className="text-sm">{img.altText}</div> : <div className="text-sm text-gray-400">—</div>}

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <form action={movePartImage}>
                        <input type="hidden" name="partId" value={part.id} />
                        <input type="hidden" name="imageId" value={img.id} />
                        <input type="hidden" name="dir" value="up" />
                        <button className="rounded-xl border px-3 py-1 text-xs hover:bg-gray-50" type="submit" disabled={idx === 0}>
                          ↑
                        </button>
                      </form>

                      <form action={movePartImage}>
                        <input type="hidden" name="partId" value={part.id} />
                        <input type="hidden" name="imageId" value={img.id} />
                        <input type="hidden" name="dir" value="down" />
                        <button
                          className="rounded-xl border px-3 py-1 text-xs hover:bg-gray-50"
                          type="submit"
                          disabled={idx === part.images.length - 1}
                        >
                          ↓
                        </button>
                      </form>

                      <form action={deletePartImage}>
                        <input type="hidden" name="partId" value={part.id} />
                        <input type="hidden" name="imageId" value={img.id} />
                        <button className="rounded-xl border px-3 py-1 text-xs hover:bg-red-50 text-red-700" type="submit">
                          Entfernen
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
