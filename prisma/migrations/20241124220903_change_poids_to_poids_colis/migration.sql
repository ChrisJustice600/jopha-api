/*
  Warnings:

  - You are about to drop the column `poids` on the `Colis` table. All the data in the column will be lost.
  - Added the required column `poids_colis` to the `Colis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Colis" DROP COLUMN "poids",
ADD COLUMN     "poids_colis" TEXT NOT NULL;
