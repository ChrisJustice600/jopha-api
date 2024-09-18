-- CreateIndex
CREATE INDEX "ClientAvecCode_createdAt_idx" ON "ClientAvecCode"("createdAt");

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
CREATE INDEX "MasterPack_groupageId_idx" ON "MasterPack"("groupageId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
