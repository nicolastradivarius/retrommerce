/*
  Warnings:

  - You are about to drop the column `icon` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `condition` on the `products` table. All the data in the column will be lost.
  - Made the column `originalPrice` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "icon";

-- Update NULL originalPrice values to match price before making column required
UPDATE "products" SET "originalPrice" = "price" WHERE "originalPrice" IS NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "condition",
ALTER COLUMN "originalPrice" SET NOT NULL;

-- DropEnum
DROP TYPE "Condition";
