import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-gray-600">Stammdaten & Inhalte pflegen</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Link className="rounded-2xl border p-4 hover:bg-gray-50" href="/admin/categories">
          <div className="font-medium">Kategorien</div>
          <div className="text-sm text-gray-600">DE/EN Titel & Beschreibung</div>
        </Link>

        <Link className="rounded-2xl border p-4 hover:bg-gray-50" href="/admin/manufacturers">
          <div className="font-medium">Manufacturer</div>
          <div className="text-sm text-gray-600">Anlegen, ändern, löschen</div>
        </Link>

        <Link className="rounded-2xl border p-4 hover:bg-gray-50" href="/admin/models">
          <div className="font-medium">Modelle</div>
          <div className="text-sm text-gray-600">Anlegen, ändern, löschen</div>
        </Link>

        <Link className="rounded-2xl border p-4 hover:bg-gray-50" href="/admin/parts">
          <div className="font-medium">Parts</div>
          <div className="text-sm text-gray-600">DE/EN, Lagerstand, Bilder</div>
        </Link>

        <Link className="rounded-2xl border p-4 hover:bg-gray-50" href="/admin/diagrams">
          <div className="font-medium">Diagramme</div>
          <div className="text-sm text-gray-600">Hotspot Editor</div>
        </Link>
      </div>

      <div className="text-xs text-gray-500">
        Tipp: Falls eine Seite noch nicht gebaut ist (404), bauen wir sie als Nächstes.
      </div>
    </div>
  );
}
