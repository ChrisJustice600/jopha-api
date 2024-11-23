/*
  Warnings:

  - You are about to drop the column `itemType` on the `Colis` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Colis_itemType_idx";

-- AlterTable
ALTER TABLE "Colis" DROP COLUMN "itemType";

-- DropEnum
DROP TYPE "ItemType";
