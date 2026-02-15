-- AlterTable
ALTER TABLE "products" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "products_userId_idx" ON "products"("userId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
