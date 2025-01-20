const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getGroupageStatistics(req, res) {
  const { groupageCode } = req.params;

  try {
    // Récupérer le groupage par son code
    const groupage = await prisma.groupage.findUnique({
      where: { code: groupageCode },
      include: {
        masterPacks: {
          include: {
            colis: true,
          },
        },
        colis: {
          include: {
            clientAvecCode: true,
          },
        },
      },
    });

    if (!groupage) {
      return res.status(404).json({ message: "Groupage not found" });
    }

    // Calculer le nombre de masterPacks dans ce groupage
    const numberOfMasterPacks = groupage.masterPacks.length;

    // Calculer le nombre total de colis dans ce groupage
    const numberOfColis = groupage.colis.length;

    // Calculer le nombre de colis par statut global
    const globalColisStatusCount = {
      GROUPED: 0,
      IN_TRANSIT: 0,
      ARRIVED: 0,
      DELIVERED: 0,
    };

    // Calculer le poids total des colis
    let totalWeight = 0;

    // Calculer le nombre de colis par type de transport
    const transportTypeCount = {
      AERIEN: 0,
      MARITIME: 0,
    };

    // Calculer le nombre de colis par type d'article
    const itemTypeCount = {
      ORDINAIRE: 0,
      ELECTRONIQUE: 0,
      COSMETIQUE: 0,
      PHARMACEUTIQUE: 0,
      BIJOUX: 0,
      CABELLO: 0,
      TELEPHONE: 0,
    };

    // Calculer le nombre de colis par client avec code
    const clientColisCount = {};

    groupage.colis.forEach((colis) => {
      // Statut global des colis
      if (colis.status in globalColisStatusCount) {
        globalColisStatusCount[colis.status]++;
      }

      // Poids total des colis
      totalWeight += parseFloat(colis.poids_colis) || 0;

      // Type de transport
      if (colis.transportType in transportTypeCount) {
        transportTypeCount[colis.transportType]++;
      }

      // Type d'article
      if (colis.itemType in itemTypeCount) {
        itemTypeCount[colis.itemType]++;
      }

      // Colis par client avec code
      if (colis.clientAvecCode) {
        const clientCode = colis.clientAvecCode.code;
        if (!clientColisCount[clientCode]) {
          clientColisCount[clientCode] = 0;
        }
        clientColisCount[clientCode]++;
      }
    });

    // Calculer le nombre de colis par statut pour chaque masterPack
    const masterPacksStatistics = groupage.masterPacks.map((masterPack) => {
      const colisStatusCount = {
        GROUPED: 0,
        IN_TRANSIT: 0,
        ARRIVED: 0,
        DELIVERED: 0,
      };

      masterPack.colis.forEach((colis) => {
        if (colis.status in colisStatusCount) {
          colisStatusCount[colis.status]++;
        }
      });

      return {
        masterPackId: masterPack.id,
        masterPackNumber: masterPack.numero,
        colisStatusCount,
      };
    });

    // Retourner les statistiques complètes
    res.json({
      groupageCode: groupage.code,
      numberOfMasterPacks,
      numberOfColis,
      globalColisStatusCount,
      totalWeight: totalWeight.toFixed(2), // Poids total avec 2 décimales
      transportTypeCount,
      itemTypeCount,
      clientColisCount,
      masterPacksStatistics,
      createdAt: groupage.createdAt,
      updatedAt: groupage.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching groupage statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getGroupageStatistics,
};
