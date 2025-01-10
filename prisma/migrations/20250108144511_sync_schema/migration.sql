/*
  Warnings:

  - A unique constraint covering the columns `[numero]` on the table `MasterPack` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MasterPack_numero_key" ON "MasterPack"("numero");
