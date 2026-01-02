-- CreateEnum
CREATE TYPE "PartCondition" AS ENUM ('NEW', 'USED', 'NOS', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PartAuthenticity" AS ENUM ('ORIGINAL', 'REPRO', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "FitmentConfidence" AS ENUM ('CONFIRMED', 'PROBABLE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "HotspotShapeType" AS ENUM ('POLYGON', 'RECT', 'CIRCLE');

-- CreateEnum
CREATE TYPE "HotspotLinkType" AS ENUM ('PART', 'SET', 'CATEGORY', 'FILTER');

-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "country" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirearmModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FirearmModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirearmVariant" (
    "id" TEXT NOT NULL,
    "firearmModelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "manufacturerId" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FirearmVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "sku" TEXT,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT,
    "condition" "PartCondition" NOT NULL DEFAULT 'UNKNOWN',
    "authenticity" "PartAuthenticity" NOT NULL DEFAULT 'UNKNOWN',
    "stockStatus" "StockStatus" NOT NULL DEFAULT 'OUT_OF_STOCK',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartTranslation" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartImage" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "originalPath" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartFitment" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "firearmModelId" TEXT NOT NULL,
    "firearmVariantId" TEXT,
    "manufacturerId" TEXT,
    "confidence" "FitmentConfidence" NOT NULL DEFAULT 'UNKNOWN',
    "notes" TEXT,
    "source" TEXT,
    "incompatibleWith" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartFitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartSet" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "stockStatus" "StockStatus" NOT NULL DEFAULT 'OUT_OF_STOCK',
    "priceCents" INTEGER,
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartSetTranslation" (
    "id" TEXT NOT NULL,
    "partSetId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartSetTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartSetImage" (
    "id" TEXT NOT NULL,
    "partSetId" TEXT NOT NULL,
    "originalPath" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartSetImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartSetItem" (
    "id" TEXT NOT NULL,
    "partSetId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,

    CONSTRAINT "PartSetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirearmDiagram" (
    "id" TEXT NOT NULL,
    "firearmModelId" TEXT NOT NULL,
    "firearmVariantId" TEXT,
    "title" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "widthPx" INTEGER,
    "heightPx" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FirearmDiagram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagramHotspot" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "shapeType" "HotspotShapeType" NOT NULL DEFAULT 'POLYGON',
    "pointsJson" JSONB NOT NULL,
    "linkType" "HotspotLinkType" NOT NULL DEFAULT 'FILTER',
    "partId" TEXT,
    "partSetId" TEXT,
    "categoryId" TEXT,
    "filterJson" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagramHotspot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_code_key" ON "Manufacturer"("code");

-- CreateIndex
CREATE INDEX "Manufacturer_name_idx" ON "Manufacturer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FirearmModel_slug_key" ON "FirearmModel"("slug");

-- CreateIndex
CREATE INDEX "FirearmModel_name_idx" ON "FirearmModel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FirearmVariant_slug_key" ON "FirearmVariant"("slug");

-- CreateIndex
CREATE INDEX "FirearmVariant_firearmModelId_idx" ON "FirearmVariant"("firearmModelId");

-- CreateIndex
CREATE INDEX "FirearmVariant_manufacturerId_idx" ON "FirearmVariant"("manufacturerId");

-- CreateIndex
CREATE INDEX "FirearmVariant_name_idx" ON "FirearmVariant"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PartCategory_slug_key" ON "PartCategory"("slug");

-- CreateIndex
CREATE INDEX "PartCategory_name_idx" ON "PartCategory"("name");

-- CreateIndex
CREATE INDEX "PartCategory_parentId_idx" ON "PartCategory"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Part_sku_key" ON "Part"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Part_slug_key" ON "Part"("slug");

-- CreateIndex
CREATE INDEX "Part_categoryId_idx" ON "Part"("categoryId");

-- CreateIndex
CREATE INDEX "Part_slug_idx" ON "Part"("slug");

-- CreateIndex
CREATE INDEX "PartTranslation_locale_idx" ON "PartTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "PartTranslation_partId_locale_key" ON "PartTranslation"("partId", "locale");

-- CreateIndex
CREATE INDEX "PartImage_partId_idx" ON "PartImage"("partId");

-- CreateIndex
CREATE INDEX "PartFitment_partId_idx" ON "PartFitment"("partId");

-- CreateIndex
CREATE INDEX "PartFitment_firearmModelId_idx" ON "PartFitment"("firearmModelId");

-- CreateIndex
CREATE INDEX "PartFitment_firearmVariantId_idx" ON "PartFitment"("firearmVariantId");

-- CreateIndex
CREATE INDEX "PartFitment_manufacturerId_idx" ON "PartFitment"("manufacturerId");

-- CreateIndex
CREATE UNIQUE INDEX "PartFitment_partId_firearmModelId_firearmVariantId_manufact_key" ON "PartFitment"("partId", "firearmModelId", "firearmVariantId", "manufacturerId");

-- CreateIndex
CREATE UNIQUE INDEX "PartSet_slug_key" ON "PartSet"("slug");

-- CreateIndex
CREATE INDEX "PartSet_slug_idx" ON "PartSet"("slug");

-- CreateIndex
CREATE INDEX "PartSetTranslation_locale_idx" ON "PartSetTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "PartSetTranslation_partSetId_locale_key" ON "PartSetTranslation"("partSetId", "locale");

-- CreateIndex
CREATE INDEX "PartSetImage_partSetId_idx" ON "PartSetImage"("partSetId");

-- CreateIndex
CREATE INDEX "PartSetItem_partSetId_idx" ON "PartSetItem"("partSetId");

-- CreateIndex
CREATE INDEX "PartSetItem_partId_idx" ON "PartSetItem"("partId");

-- CreateIndex
CREATE UNIQUE INDEX "PartSetItem_partSetId_partId_key" ON "PartSetItem"("partSetId", "partId");

-- CreateIndex
CREATE INDEX "FirearmDiagram_firearmModelId_idx" ON "FirearmDiagram"("firearmModelId");

-- CreateIndex
CREATE INDEX "FirearmDiagram_firearmVariantId_idx" ON "FirearmDiagram"("firearmVariantId");

-- CreateIndex
CREATE INDEX "DiagramHotspot_diagramId_idx" ON "DiagramHotspot"("diagramId");

-- CreateIndex
CREATE INDEX "DiagramHotspot_partId_idx" ON "DiagramHotspot"("partId");

-- CreateIndex
CREATE INDEX "DiagramHotspot_partSetId_idx" ON "DiagramHotspot"("partSetId");

-- CreateIndex
CREATE INDEX "DiagramHotspot_categoryId_idx" ON "DiagramHotspot"("categoryId");

-- AddForeignKey
ALTER TABLE "FirearmVariant" ADD CONSTRAINT "FirearmVariant_firearmModelId_fkey" FOREIGN KEY ("firearmModelId") REFERENCES "FirearmModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirearmVariant" ADD CONSTRAINT "FirearmVariant_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartCategory" ADD CONSTRAINT "PartCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PartCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PartCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartTranslation" ADD CONSTRAINT "PartTranslation_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartImage" ADD CONSTRAINT "PartImage_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartFitment" ADD CONSTRAINT "PartFitment_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartFitment" ADD CONSTRAINT "PartFitment_firearmModelId_fkey" FOREIGN KEY ("firearmModelId") REFERENCES "FirearmModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartFitment" ADD CONSTRAINT "PartFitment_firearmVariantId_fkey" FOREIGN KEY ("firearmVariantId") REFERENCES "FirearmVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartFitment" ADD CONSTRAINT "PartFitment_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartSetTranslation" ADD CONSTRAINT "PartSetTranslation_partSetId_fkey" FOREIGN KEY ("partSetId") REFERENCES "PartSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartSetImage" ADD CONSTRAINT "PartSetImage_partSetId_fkey" FOREIGN KEY ("partSetId") REFERENCES "PartSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartSetItem" ADD CONSTRAINT "PartSetItem_partSetId_fkey" FOREIGN KEY ("partSetId") REFERENCES "PartSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartSetItem" ADD CONSTRAINT "PartSetItem_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirearmDiagram" ADD CONSTRAINT "FirearmDiagram_firearmModelId_fkey" FOREIGN KEY ("firearmModelId") REFERENCES "FirearmModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirearmDiagram" ADD CONSTRAINT "FirearmDiagram_firearmVariantId_fkey" FOREIGN KEY ("firearmVariantId") REFERENCES "FirearmVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagramHotspot" ADD CONSTRAINT "DiagramHotspot_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "FirearmDiagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagramHotspot" ADD CONSTRAINT "DiagramHotspot_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagramHotspot" ADD CONSTRAINT "DiagramHotspot_partSetId_fkey" FOREIGN KEY ("partSetId") REFERENCES "PartSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagramHotspot" ADD CONSTRAINT "DiagramHotspot_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PartCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
