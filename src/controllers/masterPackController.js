const { prisma } = require("../../database/prisma");

const updateMasterPackStatus = async (req, res) => {
  const { numero, status, groupageCode } = req.body;

  try {
    // Vérifier si le groupage existe
    const groupage = await prisma.groupage.findUnique({
      where: { code: groupageCode },
    });

    if (!groupage) {
      return res.status(404).json({ error: "Groupage non trouvé" });
    }

    // Vérifier si le MasterPack existe et appartient au groupage
    const masterPack = await prisma.masterPack.findUnique({
      where: { numero },
    });

    if (!masterPack || masterPack.groupageId !== groupage.id) {
      return res.status(404).json({
        error: "MasterPack non trouvé ou n'appartient pas au groupage",
      });
    }

    // Mettre à jour le statut du MasterPack
    const updatedMasterPack = await prisma.masterPack.update({
      where: { numero },
      data: { status },
    });

    return res.status(200).json({
      message: "Statut du MasterPack mis à jour avec succès",
      updatedMasterPack,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du statut du MasterPack :",
      error
    );
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

module.exports = {
  updateMasterPackStatus,
};
