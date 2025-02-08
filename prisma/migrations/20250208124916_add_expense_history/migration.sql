-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "historyId" TEXT;

-- CreateTable
CREATE TABLE "ExpenseHistory" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportNumber" TEXT NOT NULL,
    "totalUSD" DOUBLE PRECISION NOT NULL,
    "totalCDF" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseHistory_reportNumber_key" ON "ExpenseHistory"("reportNumber");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "ExpenseHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
