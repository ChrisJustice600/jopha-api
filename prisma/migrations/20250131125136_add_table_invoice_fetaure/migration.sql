/*
  Warnings:

  - A unique constraint covering the columns `[tracking_code]` on the table `Colis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[deliveredInvoiceItemId]` on the table `Colis` will be added. If there are existing duplicate values, this will fail.
  - Made the column `code` on table `Colis` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Colis" ADD COLUMN     "deliveredInvoiceItemId" TEXT,
ADD COLUMN     "volume" DOUBLE PRECISION,
ALTER COLUMN "code" SET NOT NULL;

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isProforma" BOOLEAN NOT NULL DEFAULT false,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "colisId" INTEGER NOT NULL,
    "discount" INTEGER DEFAULT 0,
    "appliedStatus" "Status" NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceHistory" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "details" TEXT,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_phone_key" ON "Client"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_date_idx" ON "Invoice"("date");

-- CreateIndex
CREATE INDEX "InvoiceItem_appliedStatus_idx" ON "InvoiceItem"("appliedStatus");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceItem_invoiceId_colisId_key" ON "InvoiceItem"("invoiceId", "colisId");

-- CreateIndex
CREATE UNIQUE INDEX "Colis_tracking_code_key" ON "Colis"("tracking_code");

-- CreateIndex
CREATE UNIQUE INDEX "Colis_deliveredInvoiceItemId_key" ON "Colis"("deliveredInvoiceItemId");

-- CreateIndex
CREATE INDEX "Colis_tracking_code_idx" ON "Colis"("tracking_code");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_colisId_fkey" FOREIGN KEY ("colisId") REFERENCES "Colis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceHistory" ADD CONSTRAINT "InvoiceHistory_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
