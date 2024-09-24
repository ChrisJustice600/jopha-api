-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('RECEIVED', 'GROUPED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('AERIEN', 'MARITIME');

-- CreateEnum
CREATE TYPE "AirTransport" AS ENUM ('REGULIER', 'EXPRESS');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groupage" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'GROUPED',
    "transportType" "TransportType",
    "airType" "AirTransport",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Groupage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterPack" (
    "id" SERIAL NOT NULL,
    "numero" TEXT,
    "poids" INTEGER,
    "groupageId" INTEGER NOT NULL,
    "isColisMasterPack" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MasterPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColisMasterPack" (
    "id" SERIAL NOT NULL,
    "masterPackId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "nom_complet" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'RECEIVED',
    "telephone" TEXT NOT NULL,
    "transportType" "TransportType",
    "airType" "AirTransport",
    "clientAvecCodeId" INTEGER,

    CONSTRAINT "ColisMasterPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colis" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "nom_complet" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'RECEIVED',
    "tracking_code" TEXT NOT NULL,
    "poids" INTEGER,
    "telephone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "masterPackId" INTEGER,
    "groupageId" INTEGER,
    "transportType" "TransportType",
    "airType" "AirTransport",
    "clientAvecCodeId" INTEGER,

    CONSTRAINT "Colis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientAvecCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nomAgence" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientAvecCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "contenu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "colisId" INTEGER,
    "groupageId" INTEGER,
    "colisMasterPackId" INTEGER,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Groupage_code_key" ON "Groupage"("code");

-- CreateIndex
CREATE INDEX "Groupage_code_idx" ON "Groupage"("code");

-- CreateIndex
CREATE INDEX "Groupage_status_idx" ON "Groupage"("status");

-- CreateIndex
CREATE INDEX "Groupage_transportType_idx" ON "Groupage"("transportType");

-- CreateIndex
CREATE INDEX "Groupage_airType_idx" ON "Groupage"("airType");

-- CreateIndex
CREATE INDEX "Groupage_createdAt_idx" ON "Groupage"("createdAt");

-- CreateIndex
CREATE INDEX "MasterPack_numero_idx" ON "MasterPack"("numero");

-- CreateIndex
CREATE INDEX "MasterPack_isColisMasterPack_idx" ON "MasterPack"("isColisMasterPack");

-- CreateIndex
CREATE UNIQUE INDEX "ColisMasterPack_masterPackId_key" ON "ColisMasterPack"("masterPackId");

-- CreateIndex
CREATE UNIQUE INDEX "ColisMasterPack_code_key" ON "ColisMasterPack"("code");

-- CreateIndex
CREATE INDEX "ColisMasterPack_code_idx" ON "ColisMasterPack"("code");

-- CreateIndex
CREATE INDEX "ColisMasterPack_nom_complet_idx" ON "ColisMasterPack"("nom_complet");

-- CreateIndex
CREATE INDEX "ColisMasterPack_status_idx" ON "ColisMasterPack"("status");

-- CreateIndex
CREATE INDEX "ColisMasterPack_transportType_idx" ON "ColisMasterPack"("transportType");

-- CreateIndex
CREATE INDEX "ColisMasterPack_airType_idx" ON "ColisMasterPack"("airType");

-- CreateIndex
CREATE UNIQUE INDEX "Colis_code_key" ON "Colis"("code");

-- CreateIndex
CREATE INDEX "Colis_nom_complet_idx" ON "Colis"("nom_complet");

-- CreateIndex
CREATE INDEX "Colis_status_idx" ON "Colis"("status");

-- CreateIndex
CREATE INDEX "Colis_transportType_idx" ON "Colis"("transportType");

-- CreateIndex
CREATE INDEX "Colis_airType_idx" ON "Colis"("airType");

-- CreateIndex
CREATE INDEX "Colis_createdAt_idx" ON "Colis"("createdAt");

-- CreateIndex
CREATE INDEX "Colis_updatedAt_idx" ON "Colis"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAvecCode_code_key" ON "ClientAvecCode"("code");

-- CreateIndex
CREATE INDEX "ClientAvecCode_createdAt_idx" ON "ClientAvecCode"("createdAt");

-- AddForeignKey
ALTER TABLE "MasterPack" ADD CONSTRAINT "MasterPack_groupageId_fkey" FOREIGN KEY ("groupageId") REFERENCES "Groupage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColisMasterPack" ADD CONSTRAINT "ColisMasterPack_masterPackId_fkey" FOREIGN KEY ("masterPackId") REFERENCES "MasterPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColisMasterPack" ADD CONSTRAINT "ColisMasterPack_clientAvecCodeId_fkey" FOREIGN KEY ("clientAvecCodeId") REFERENCES "ClientAvecCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_masterPackId_fkey" FOREIGN KEY ("masterPackId") REFERENCES "MasterPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_groupageId_fkey" FOREIGN KEY ("groupageId") REFERENCES "Groupage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_clientAvecCodeId_fkey" FOREIGN KEY ("clientAvecCodeId") REFERENCES "ClientAvecCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_colisId_fkey" FOREIGN KEY ("colisId") REFERENCES "Colis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_groupageId_fkey" FOREIGN KEY ("groupageId") REFERENCES "Groupage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_colisMasterPackId_fkey" FOREIGN KEY ("colisMasterPackId") REFERENCES "ColisMasterPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
