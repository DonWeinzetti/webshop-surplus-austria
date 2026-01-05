import Link from "next/link";
import { prisma } from "@/db/prisma";
import { createPart } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminPartsNewPage() {
  const categories = await prisma.partCategory.findMany({
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Neues Teil anlegen</h1>
          <div className="text-sm text-gray-600">DE/EN Titel, Lagerstand, Kategorie, Zustand.</div>
        </div>
        <Link className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50" href="/admin/parts">
          ← Zurück
        </Link>
      </header>

      <form action={createPart} className="space-y-4 max-w-4xl">
        <div className="rounded-2xl border p-4 space-y-3 bg-gray-800">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm font-medium">Slug (unique)</div>
              <input name="slug" className="border rounded-xl px-3 py-2 text-sm w-full" placeholder="z.B. k98k-kimme-1" />
              <div className="text-xs text-gray-500">Wenn leer: wird aus Titel DE/EN generiert.</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">SKU (optional)</div>
              <input name="sku" className="border rounded-xl px-3 py-2 text-sm w-full" placeholder="z.B. K98-REAR-SIGHT" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Kategorie</div>
              <select name="categoryId" className="border rounded-xl px-3 py-2 text-sm w-full" defaultValue="">
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
                <select name="condition" className="border rounded-xl px-3 py-2 text-sm w-full" defaultValue="UNKNOWN">
                  <option value="UNKNOWN">UNKNOWN</option>
                  <option value="NEW">NEW</option>
                  <option value="USED">USED</option>
                  <option value="NOS">NOS</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Authentizität</div>
                <select name="authenticity" className="border rounded-xl px-3 py-2 text-sm w-full" defaultValue="UNKNOWN">
                  <option value="UNKNOWN">UNKNOWN</option>
                  <option value="ORIGINAL">ORIGINAL</option>
                  <option value="REPRO">REPRO</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <div className="text-sm font-medium">StockStatus</div>
                <select name="stockStatus" className="border rounded-xl px-3 py-2 text-sm w-full" defaultValue="OUT_OF_STOCK">
                  <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                  <option value="IN_STOCK">IN_STOCK</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Quantity</div>
                <input name="quantity" type="number" className="border rounded-xl px-3 py-2 text-sm w-full" defaultValue={0} />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <div className="text-sm font-medium">Notes (intern)</div>
              <textarea name="notes" className="border rounded-xl px-3 py-2 text-sm w-full" rows={3} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-4 space-y-3 bg-gray-800">
          <div className="text-sm font-semibold">Übersetzungen</div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Deutsch (de)</div>
              <input name="title_de" className="border rounded-xl px-3 py-2 text-sm w-full" placeholder="Titel DE" />
              <textarea name="description_de" className="border rounded-xl px-3 py-2 text-sm w-full" rows={4} placeholder="Beschreibung DE" />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Englisch (en)</div>
              <input name="title_en" className="border rounded-xl px-3 py-2 text-sm w-full" placeholder="Title EN" />
              <textarea name="description_en" className="border rounded-xl px-3 py-2 text-sm w-full" rows={4} placeholder="Description EN" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50" type="submit">
            Speichern
          </button>
          <Link className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50" href="/admin/parts">
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  );
}
