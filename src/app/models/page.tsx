import Link from "next/link";
import { prisma } from "@/db/prisma";

export default async function ModelsIndex() {
  const models = await prisma.firearmModel.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Modelle</h1>
      <ul className="list-disc pl-6">
        {models.map((m) => (
          <li key={m.slug}>
            <Link className="underline" href={`/models/${m.slug}`}>
              {m.name}
            </Link>
            <span className="text-xs text-gray-500"> ({m.slug})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
