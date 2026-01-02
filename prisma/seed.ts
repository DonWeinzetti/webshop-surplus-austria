import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Hersteller (Beispiel)
  const mauser = await prisma.manufacturer.upsert({
    where: { code: "MAUSER" },
    update: {},
    create: { name: "Mauser", code: "MAUSER", country: "DE" },
  });

  // Modell: K98k
  const k98 = await prisma.firearmModel.upsert({
    where: { slug: "k98k" },
    update: {},
    create: {
      name: "Karabiner 98k",
      slug: "k98k",
      description: "WW2 Karabiner (Beispiel-Stammdatensatz für den Shop).",
    },
  });

  // Variante (Beispiel)
  const k98_variant = await prisma.firearmVariant.upsert({
    where: { slug: "k98k-mauser-early" },
    update: {},
    create: {
      firearmModelId: k98.id,
      name: "Early production (Beispiel)",
      slug: "k98k-mauser-early",
      yearFrom: 1939,
      yearTo: 1941,
      manufacturerId: mauser.id,
    },
  });

  // Kategorien
  const sights = await prisma.partCategory.upsert({
    where: { slug: "visier" },
    update: {},
    create: { name: "Visier", slug: "visier" },
  });

  // Part (sprachneutral)
  const rearSight = await prisma.part.upsert({
    where: { slug: "k98k-kimme-example" },
    update: { categoryId: sights.id },
    create: {
      slug: "k98k-kimme-example",
      sku: "K98-REAR-SIGHT-001",
      categoryId: sights.id,
      stockStatus: "IN_STOCK",
      quantity: 2,
      condition: "USED",
      authenticity: "ORIGINAL",
      notes: "Beispielteil",
    },
  });

  // Übersetzungen
  await prisma.partTranslation.upsert({
    where: { partId_locale: { partId: rearSight.id, locale: "de" } },
    update: {},
    create: {
      partId: rearSight.id,
      locale: "de",
      title: "Kimme (Beispiel)",
      description: "K98k Kimme – Beispielbeschreibung (DE).",
    },
  });

  await prisma.partTranslation.upsert({
    where: { partId_locale: { partId: rearSight.id, locale: "en" } },
    update: {},
    create: {
      partId: rearSight.id,
      locale: "en",
      title: "Rear sight (example)",
      description: "K98k rear sight – example description (EN).",
    },
  });

  // Fitment
  await prisma.partFitment.upsert({
    where: {
      partId_firearmModelId_firearmVariantId_manufacturerId: {
        partId: rearSight.id,
        firearmModelId: k98.id,
        firearmVariantId: k98_variant.id,
        manufacturerId: mauser.id,
      },
    },
    update: {},
    create: {
      partId: rearSight.id,
      firearmModelId: k98.id,
      firearmVariantId: k98_variant.id,
      manufacturerId: mauser.id,
      confidence: "PROBABLE",
      notes: "Beispiel-Fitment",
      source: "Seed",
    },
  });

  // Set (Beispiel)
  const set = await prisma.partSet.upsert({
    where: { slug: "k98k-visier-set-example" },
    update: {},
    create: {
      slug: "k98k-visier-set-example",
      stockStatus: "IN_STOCK",
    },
  });

  await prisma.partSetTranslation.upsert({
    where: { partSetId_locale: { partSetId: set.id, locale: "de" } },
    update: {},
    create: {
      partSetId: set.id,
      locale: "de",
      title: "Visier-Set (Beispiel)",
      description: "Set aus Visierteilen (Beispiel).",
    },
  });

  await prisma.partSetItem.upsert({
    where: { partSetId_partId: { partSetId: set.id, partId: rearSight.id } },
    update: { quantity: 1 },
    create: { partSetId: set.id, partId: rearSight.id, quantity: 1 },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
