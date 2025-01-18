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
    const masterPack = await prisma.masterPack.findFirst({
      where: {
        numero: numero,
        groupageId: groupage.id, // Vérifiez également que le MasterPack appartient au groupage
      },
    });

    if (!masterPack) {
      return res.status(404).json({
        error: "MasterPack non trouvé ou n'appartient pas au groupage",
      });
    }

    // Utiliser une transaction pour mettre à jour le MasterPack et les colis associés
    const [updatedMasterPack, updatedColis] = await prisma.$transaction([
      // Mettre à jour le statut du MasterPack
      prisma.masterPack.update({
        where: { id: masterPack.id },
        data: { status },
      }),

      // Mettre à jour le statut de tous les colis associés au MasterPack
      prisma.colis.updateMany({
        where: { masterPackId: masterPack.id },
        data: { status },
      }),
    ]);

    return res.status(200).json({
      message:
        "Statut du MasterPack et des colis associés mis à jour avec succès",
      updatedMasterPack,
      updatedColis,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du statut du MasterPack et des colis :",
      error
    );
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

module.exports = {
  updateMasterPackStatus,
};
