/*
  Warnings:

  - You are about to drop the `ExpenseHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_historyId_fkey";

-- DropTable
DROP TABLE "ExpenseHistory";

-- CreateTable
CREATE TABLE "ExpenseReport" (
    "id" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "totalUSD" DOUBLE PRECISION NOT NULL,
    "totalCDF" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseReport_reportNumber_key" ON "ExpenseReport"("reportNumber");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "ExpenseReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
