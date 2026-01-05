import Link from "next/link";
import { prisma } from "@/db/prisma";

export default async function DiagramsIndex() {
  const diagrams = await prisma.firearmDiagram.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      firearmModel: { select: { name: true } },
    },
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Diagramme</h1>
      <ul className="space-y-2">
        {diagrams.map((d) => (
          <li key={d.id} className="rounded-xl border p-3">
            <Link className="underline" href={`/diagrams/${d.id}`}>
              {d.title}
            </Link>
            <div className="text-xs text-gray-500">
              {d.firearmModel.name} · {d.id}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
