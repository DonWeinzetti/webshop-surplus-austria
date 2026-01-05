import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

type Body = {
  label: string;
  points: number[][];
  sortOrder?: number;

  linkType: "PART" | "SET" | "CATEGORY" | "FILTER";
  partId?: string | null;
  partSetId?: string | null;
  categoryId?: string | null;
  filterJson?: any;
};

export async function POST(
  req: Request,
  context: { params: Promise<{ id?: string }> | { id?: string } }
) {
  const p =
    typeof (context.params as any)?.then === "function"
      ? await (context.params as Promise<{ id?: string }>)
      : (context.params as { id?: string });

  const diagramId = p?.id;
  if (!diagramId) {
    return NextResponse.json({ error: "Missing diagram id" }, { status: 400 });
  }

  const body = (await req.json()) as Body;

  if (!body?.label?.trim()) {
    return NextResponse.json({ error: "Missing label" }, { status: 400 });
  }
  if (!Array.isArray(body.points) || body.points.length < 3) {
    return NextResponse.json(
      { error: "Polygon needs >= 3 points" },
      { status: 400 }
    );
  }

  // LinkType-spezifische Validierung
  if (body.linkType === "PART" && !body.partId) {
    return NextResponse.json({ error: "Missing partId" }, { status: 400 });
  }
  if (body.linkType === "SET" && !body.partSetId) {
    return NextResponse.json({ error: "Missing partSetId" }, { status: 400 });
  }
  if (body.linkType === "CATEGORY" && !body.categoryId) {
    return NextResponse.json({ error: "Missing categoryId" }, { status: 400 });
  }
  if (body.linkType === "FILTER" && !body.filterJson) {
    return NextResponse.json({ error: "Missing filterJson" }, { status: 400 });
  }

  const created = await prisma.diagramHotspot.create({
    data: {
      diagramId,
      label: body.label.trim(),
      shapeType: "POLYGON",
      pointsJson: body.points,
      linkType: body.linkType,

      partId: body.linkType === "PART" ? body.partId! : null,
      partSetId: body.linkType === "SET" ? body.partSetId! : null,
      categoryId: body.linkType === "CATEGORY" ? body.categoryId! : null,
      filterJson: body.linkType === "FILTER" ? body.filterJson : null,

      sortOrder: body.sortOrder ?? 0,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: created.id });
}
