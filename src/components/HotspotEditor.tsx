"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Option = { id: string; slug: string; label: string };

type Props = {
  diagramId: string;
  imageUrl: string;
  widthPx: number;
  heightPx: number;

  // für FILTER Defaults
  defaultModelSlug: string | null;

  partOptions?: Option[];
  setOptions?: Option[];
  categoryOptions?: Option[];
};

type LinkType = "PART" | "SET" | "CATEGORY" | "FILTER";

function toDiagramCoords(
  e: React.MouseEvent,
  svg: SVGSVGElement,
  widthPx: number,
  heightPx: number
) {
  const rect = svg.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * widthPx;
  const y = ((e.clientY - rect.top) / rect.height) * heightPx;
  return [Math.round(x), Math.round(y)] as [number, number];
}

export default function HotspotEditor({
  diagramId,
  imageUrl,
  widthPx,
  heightPx,
  defaultModelSlug,
  partOptions = [],
  setOptions = [],
  categoryOptions = [],
}: Props) {
  // --- Stabil: lokale Aliase (nie undefined)
  const parts = partOptions;
  const sets = setOptions;
  const categories = categoryOptions;

  // --- Hotspot Zeichnen
  const [label, setLabel] = useState("Hotspot");
  const [points, setPoints] = useState<number[][]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [linkType, setLinkType] = useState<LinkType>("PART");

  // IDs (initial safe)
  const [partId, setPartId] = useState<string>(() => parts[0]?.id ?? "");
  const [setId, setSetId] = useState<string>(() => sets[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState<string>(() => categories[0]?.id ?? "");

  // Wenn Options nachladen/wechseln, selektiere Default falls leer
  useEffect(() => {
    if (!partId && parts.length > 0) setPartId(parts[0]!.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts.length]);

  useEffect(() => {
    if (!setId && sets.length > 0) setSetId(sets[0]!.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sets.length]);

  useEffect(() => {
    if (!categoryId && categories.length > 0) setCategoryId(categories[0]!.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  // --- FILTER-Builder (Whitelist passend zu deiner /parts Seite)
  const [fCategorySlug, setFCategorySlug] = useState("");
  const [fInStock, setFInStock] = useState(true);
  const [fModelSlug, setFModelSlug] = useState(defaultModelSlug ?? "");
  const [fVariantSlug, setFVariantSlug] = useState("");

  const svgRef = useRef<SVGSVGElement | null>(null);

  const pointsAttr = useMemo(
    () => points.map((p) => `${p[0]},${p[1]}`).join(" "),
    [points]
  );

  const addPoint = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const [x, y] = toDiagramCoords(e, svgRef.current, widthPx, heightPx);
    setPoints((prev) => [...prev, [x, y]]);
    setMsg(null);
  };

  const undo = () => setPoints((prev) => prev.slice(0, -1));
  const reset = () => setPoints([]);

  const buildFilterJson = () => {
    const json: any = {};

    if (fCategorySlug.trim()) json.categorySlug = fCategorySlug.trim();
    json.inStock = Boolean(fInStock);

    if (fModelSlug.trim()) json.modelSlug = fModelSlug.trim();
    if (fVariantSlug.trim()) json.variantSlug = fVariantSlug.trim();

    return json;
  };

  const save = async () => {
    if (points.length < 3) {
      setMsg("Polygon braucht mindestens 3 Punkte.");
      return;
    }

    // LinkType spezifische Checks (Client)
    if (linkType === "PART" && !partId) {
      setMsg("Bitte ein Teil auswählen (oder zuerst Teile anlegen).");
      return;
    }
    if (linkType === "SET" && !setId) {
      setMsg("Bitte ein Teileset auswählen (oder zuerst Sets anlegen).");
      return;
    }
    if (linkType === "CATEGORY" && !categoryId) {
      setMsg("Bitte eine Kategorie auswählen (oder zuerst Kategorien anlegen).");
      return;
    }

    const payload: any = {
      label,
      points,
      sortOrder: 10,
      linkType,
    };

    if (linkType === "PART") payload.partId = partId;
    if (linkType === "SET") payload.partSetId = setId;
    if (linkType === "CATEGORY") payload.categoryId = categoryId;
    if (linkType === "FILTER") payload.filterJson = buildFilterJson();

    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/diagrams/${diagramId}/hotspots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");

      setMsg(`Gespeichert ✅ Hotspot-ID: ${data.id}`);
      reset();
    } catch (e: any) {
      setMsg(`Fehler: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const disablePart = parts.length === 0;
  const disableSet = sets.length === 0;
  const disableCategory = categories.length === 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">Label</div>
          <input
            className="border rounded-xl px-3 py-2 text-sm w-64"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium">LinkType</div>
          <select
            className="border rounded-xl px-3 py-2 text-sm"
            value={linkType}
            onChange={(e) => setLinkType(e.target.value as LinkType)}
          >
            <option value="PART">PART</option>
            <option value="SET">SET</option>
            <option value="CATEGORY">CATEGORY</option>
            <option value="FILTER">FILTER</option>
          </select>
        </div>

        {/* PART */}
        {linkType === "PART" ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">Teil</div>
            {disablePart ? (
              <div className="text-xs text-red-600">Keine Teile geladen.</div>
            ) : null}
            <select
              className="border rounded-xl px-3 py-2 text-sm w-80"
              value={partId}
              onChange={(e) => setPartId(e.target.value)}
              disabled={disablePart}
            >
              {parts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* SET */}
        {linkType === "SET" ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">Teileset</div>
            {disableSet ? (
              <div className="text-xs text-red-600">Keine Sets geladen.</div>
            ) : null}
            <select
              className="border rounded-xl px-3 py-2 text-sm w-80"
              value={setId}
              onChange={(e) => setSetId(e.target.value)}
              disabled={disableSet}
            >
              {sets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* CATEGORY */}
        {linkType === "CATEGORY" ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">Kategorie</div>
            {disableCategory ? (
              <div className="text-xs text-red-600">Keine Kategorien geladen.</div>
            ) : null}
            <select
              className="border rounded-xl px-3 py-2 text-sm w-80"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={disableCategory}
            >
              {categories.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label} ({o.slug})
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {/* FILTER Builder */}
      {linkType === "FILTER" ? (
        <div className="rounded-2xl border p-4 space-y-3 bg-white">
          <div className="text-sm font-medium">FILTER-Definition</div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-xs text-gray-600">categorySlug (optional)</div>
              <input
                className="border rounded-xl px-3 py-2 text-sm"
                value={fCategorySlug}
                onChange={(e) => setFCategorySlug(e.target.value)}
                placeholder="z. B. receiver-parts"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-600">inStock</div>
              <select
                className="border rounded-xl px-3 py-2 text-sm"
                value={fInStock ? "1" : "0"}
                onChange={(e) => setFInStock(e.target.value === "1")}
              >
                <option value="1">true</option>
                <option value="0">false</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-600">modelSlug (optional)</div>
              <input
                className="border rounded-xl px-3 py-2 text-sm"
                value={fModelSlug}
                onChange={(e) => setFModelSlug(e.target.value)}
                placeholder="z. B. k98k"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-600">variantSlug (optional)</div>
              <input
                className="border rounded-xl px-3 py-2 text-sm"
                value={fVariantSlug}
                onChange={(e) => setFVariantSlug(e.target.value)}
                placeholder="z. B. k98k-byf-44"
              />
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Wird gespeichert als JSON und vom DiagramViewer zu{" "}
            <span className="font-mono">/parts?f=...</span> umgewandelt.
          </div>

          <pre className="text-xs bg-gray-50 border rounded-xl p-3 overflow-auto">
            {JSON.stringify(buildFilterJson(), null, 2)}
          </pre>
        </div>
      ) : null}

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="border rounded-xl px-3 py-2 text-sm"
          onClick={undo}
          disabled={points.length === 0}
        >
          Undo
        </button>
        <button
          className="border rounded-xl px-3 py-2 text-sm"
          onClick={reset}
          disabled={points.length === 0}
        >
          Reset
        </button>
        <button
          className="border rounded-xl px-3 py-2 text-sm"
          onClick={save}
          disabled={saving || points.length < 3}
        >
          {saving ? "Saving..." : "Save Hotspot"}
        </button>

        <div className="text-sm text-gray-600">
          Punkte: <span className="font-mono">{points.length}</span>
        </div>
      </div>

      {msg ? <div className="text-sm">{msg}</div> : null}

      {/* Canvas */}
      <div className="relative w-full max-w-5xl">
        <img
          src={imageUrl}
          alt="Diagramm"
          className="w-full h-auto rounded-2xl border"
        />

        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          viewBox={`0 0 ${widthPx} ${heightPx}`}
          preserveAspectRatio="none"
          onClick={addPoint}
        >
          {points.length >= 2 ? (
            <polyline
              points={pointsAttr}
              fill="none"
              stroke="#dc2626"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          {points.length >= 3 ? (
            <polygon
              points={pointsAttr}
              fill="rgba(220,38,38,0.25)"
              stroke="#dc2626"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={6} fill="#dc2626" />
              <text
                x={p[0] + 8}
                y={p[1] - 8}
                fontSize={14}
                fill="#dc2626"
                className="font-semibold"
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="text-xs text-gray-500">
        Klick ins Bild = Punkt setzen. Mindestens 3 Punkte → Save.
      </div>
    </div>
  );
}
