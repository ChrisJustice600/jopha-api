-- AlterTable
ALTER TABLE "Colis" ADD COLUMN     "clientAvecCodeId" INTEGER;

-- CreateTable
CREATE TABLE "ClientAvecCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nomAgence" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientAvecCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientAvecCode_code_key" ON "ClientAvecCode"("code");

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_clientAvecCodeId_fkey" FOREIGN KEY ("clientAvecCodeId") REFERENCES "ClientAvecCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
