-- CreateTable
CREATE TABLE "PartCategoryTranslation" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartCategoryTranslation_locale_idx" ON "PartCategoryTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "PartCategoryTranslation_categoryId_locale_key" ON "PartCategoryTranslation"("categoryId", "locale");

-- AddForeignKey
ALTER TABLE "PartCategoryTranslation" ADD CONSTRAINT "PartCategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PartCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
