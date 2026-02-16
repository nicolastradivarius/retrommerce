/*
  Warnings:

  - You are about to drop the column `comment` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `reviews` table. All the data in the column will be lost.
  - Added the required column `content` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "reviews_productId_userId_key";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "comment",
DROP COLUMN "rating",
DROP COLUMN "title",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "reviews_parentId_idx" ON "reviews"("parentId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
