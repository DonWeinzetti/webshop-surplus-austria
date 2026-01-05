import Link from "next/link";
import { createManufacturer } from "../actions";

export const dynamic = "force-dynamic";

export default function ManufacturerNewPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Neuer Manufacturer</h1>
        <Link className="text-sm underline underline-offset-2" href="/admin/manufacturers">
          ← zurück
        </Link>
      </div>

      <form action={createManufacturer} className="space-y-4 max-w-xl">
        <div className="rounded-2xl border p-4 space-y-3">
          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Name</div>
            <input name="name" className="w-full border rounded-xl px-3 py-2 text-sm" required />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Code (kurz, z. B. MAUSER)</div>
            <input name="code" className="w-full border rounded-xl px-3 py-2 text-sm" required />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Country (optional)</div>
            <input name="country" className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="DE" />
          </label>

          <label className="block space-y-1">
            <div className="text-xs text-gray-600">Notes (optional)</div>
            <textarea name="notes" className="w-full border rounded-xl px-3 py-2 text-sm" rows={3} />
          </label>
        </div>

        <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">Anlegen</button>
      </form>
    </div>
  );
}
