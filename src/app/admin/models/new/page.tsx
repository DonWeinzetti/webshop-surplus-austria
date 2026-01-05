import Link from "next/link";
import { createModel } from "../actions";

export const dynamic = "force-dynamic";

export default function ModelNewPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Neues Modell</h1>
        <Link className="text-sm underline underline-offset-2" href="/admin/models">
          ← zurück
        </Link>
      </div>

      <form action={createModel} className="space-y-4 max-w-2xl">
        <div className="rounded-2xl border p-4 space-y-3">
          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Name</div>
            <input name="name" className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="Karabiner 98k" required />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Slug</div>
            <input name="slug" className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="k98k" required />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Beschreibung (optional)</div>
            <textarea name="description" className="w-full border rounded-xl px-3 py-2 text-sm" rows={4} />
          </label>
        </div>

        <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">Anlegen</button>
      </form>
    </div>
  );
}
