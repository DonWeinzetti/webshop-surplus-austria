"use client";

import { useMemo, useState } from "react";

type Hotspot = {
  id: string;
  label: string;
  shapeType: "POLYGON" | "RECT" | "CIRCLE";
  pointsJson: any; // Prisma Json
  linkType: "PART" | "SET" | "CATEGORY" | "FILTER";
  part?: { slug: string } | null;
  partSet?: { slug: string } | null;
  category?: { slug: string } | null;
  filterJson?: any;
};

type Props = {
  imageUrl: string;
  widthPx: number;
  heightPx: number;
  hotspots: Hotspot[];
};

function polygonToPoints(pointsJson: any): string {
  if (!Array.isArray(pointsJson)) return "";
  return pointsJson
    .map((p) => (Array.isArray(p) && p.length >= 2 ? `${p[0]},${p[1]}` : ""))
    .filter(Boolean)
    .join(" ");
}

function hotspotHref(h: Hotspot): string | null {
  if (h.linkType === "PART" && h.part?.slug) return `/parts/${h.part.slug}`;
  if (h.linkType === "SET" && h.partSet?.slug) return `/sets/${h.partSet.slug}`;
  // Ich würde CATEGORY lieber auf /parts?cat=... routen, aber lasse es wie du es hattest:
  if (h.linkType === "CATEGORY" && h.category?.slug) return `/categories/${h.category.slug}`;
  // FILTER später
  return null;
}

export default function DiagramViewer({
  imageUrl,
  widthPx,
  heightPx,
  hotspots,
}: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const hotspotShapes = useMemo(
    () =>
      hotspots
        .map((h) => ({
          ...h,
          points: polygonToPoints(h.pointsJson),
          href: hotspotHref(h),
        }))
        // Polygon ohne Punkte filtern (sonst SVG-Errors)
        .filter((h) => h.shapeType !== "POLYGON" || (h.points && h.points.length > 0)),
    [hotspots]
  );

  return (
    <div className="w-full max-w-5xl">
      <div className="relative w-full">
        <img
          src={imageUrl}
          alt="Explosionszeichnung"
          className="w-full h-auto rounded-2xl border"
        />

        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${widthPx} ${heightPx}`}
          preserveAspectRatio="none"
        >
          {hotspotShapes.map((h) => {
            const isHover = hoverId === h.id;

            // MVP: nur Polygon zeichnen (RECT/CIRCLE später)
            const shape =
              h.shapeType === "POLYGON" ? (
                <polygon
                  points={h.points}
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={2}
                  className={
                    isHover
                      ? "fill-red-700/30 stroke-red-700"
                      : "fill-red-700/15 stroke-red-700/70"
                  }
                />
              ) : null;

            if (!shape) return null;

            return (
              <g
                key={h.id}
                onMouseEnter={(e) => {
                  setHoverId(h.id);
                  setTooltip({
                    text: h.label ?? "Hotspot",
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
                onMouseMove={(e) => {
                  setTooltip((prev) =>
                    prev ? { ...prev, x: e.clientX, y: e.clientY } : prev
                  );
                }}
                onMouseLeave={() => {
                  setHoverId(null);
                  setTooltip(null);
                }}
              >
                {h.href ? (
                  // SVG-Link: in den meisten Browsern ok; wenn du Probleme siehst, wechseln wir auf onClick + router.push
                  <a href={h.href} aria-label={h.label}>
                    {shape}
                  </a>
                ) : (
                  shape
                )}
              </g>
            );
          })}
        </svg>

        {tooltip ? (
          <div
            className="fixed z-50 pointer-events-none rounded-lg border bg-white px-3 py-2 text-xs shadow"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            {tooltip.text}
          </div>
        ) : null}
      </div>

      <div className="mt-3 text-sm">
        {hoverId ? (
          <span className="rounded-full border px-3 py-1">
            {hotspots.find((h) => h.id === hoverId)?.label}
          </span>
        ) : (
          <span className="text-gray-500">
            Hotspot anklicken → Teil öffnet sich
          </span>
        )}
      </div>
    </div>
  );
}
