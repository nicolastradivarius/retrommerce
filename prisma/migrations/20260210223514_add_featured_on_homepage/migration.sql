-- AlterTable
ALTER TABLE "products" ADD COLUMN     "featuredOnHomepage" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "products_featuredOnHomepage_idx" ON "products"("featuredOnHomepage");
