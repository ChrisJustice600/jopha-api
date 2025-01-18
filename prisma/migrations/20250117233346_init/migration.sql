-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('RECEIVED', 'GROUPED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('AERIEN', 'MARITIME');

-- CreateEnum
CREATE TYPE "AirTransport" AS ENUM ('REGULIER', 'EXPRESS');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('ORDINAIRE', 'ELECTRONIQUE', 'COSMETIQUE', 'PHARMACEUTIQUE', 'BIJOUX', 'CABELLO', 'TELEPHONE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetTokenExp" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "device" TEXT,
    "deviceModel" TEXT,
    "deviceBrand" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "UserLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groupage" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "poids_colis" TEXT,
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
    "poids_colis" TEXT,
    "groupageId" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'GROUPED',

    CONSTRAINT "MasterPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colis" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "nom_complet" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'RECEIVED',
    "tracking_code" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "poids_colis" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "masterPackId" INTEGER,
    "groupageId" INTEGER,
    "transportType" "TransportType",
    "airType" "AirTransport",
    "itemType" "ItemType",
    "clientAvecCodeId" INTEGER,

    CONSTRAINT "Colis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientAvecCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
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

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

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
CREATE INDEX "MasterPack_id_idx" ON "MasterPack"("id");

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
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLog" ADD CONSTRAINT "UserLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterPack" ADD CONSTRAINT "MasterPack_groupageId_fkey" FOREIGN KEY ("groupageId") REFERENCES "Groupage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_clientAvecCodeId_fkey" FOREIGN KEY ("clientAvecCodeId") REFERENCES "ClientAvecCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_groupageId_fkey" FOREIGN KEY ("groupageId") REFERENCES "Groupage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_masterPackId_fkey" FOREIGN KEY ("masterPackId") REFERENCES "MasterPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_colisId_fkey" FOREIGN KEY ("colisId") REFERENCES "Colis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_groupageId_fkey" FOREIGN KEY ("groupageId") REFERENCES "Groupage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
