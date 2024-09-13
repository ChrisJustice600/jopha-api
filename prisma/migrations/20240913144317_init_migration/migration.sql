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

    CONSTRAINT "MasterPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colis" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "nom_complet" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'RECEIVED',
    "poids" INTEGER,
    "telephone" TEXT NOT NULL,
    "masterPackId" INTEGER NOT NULL,
    "transportType" "TransportType",
    "airType" "AirTransport",

    CONSTRAINT "Colis_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Groupage_code_key" ON "Groupage"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Colis_code_key" ON "Colis"("code");

-- AddForeignKey
ALTER TABLE "MasterPack" ADD CONSTRAINT "MasterPack_groupageId_fkey" FOREIGN KEY ("groupageId") REFERENCES "Groupage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_masterPackId_fkey" FOREIGN KEY ("masterPackId") REFERENCES "MasterPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_colisId_fkey" FOREIGN KEY ("colisId") REFERENCES "Colis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_groupageId_fkey" FOREIGN KEY ("groupageId") REFERENCES "Groupage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
