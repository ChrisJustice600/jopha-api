const { Status } = require("@prisma/client");
const { prisma, updateRecord } = require("../../database/prisma");

const createColis = async (req, res) => {
  const {
    code, // code du colis
    nom_complet,
    tracking_code,
    poids,
    telephone,
    transportType,
    airType,
    clientAvecCode,
  } = req.body;
  console.log(nom_complet);
  console.log(clientAvecCode);
  console.log(transportType);

  try {
    // Validation de base des champs requis
    // if (!nom_complet || !telephone || !transportType || !clientAvecCode) {
    //   return res.status(400).json({
    //     error:
    //       "Les champs nom_complet, telephone, transportType et clientAvecCode sont obligatoires.",
    //   });
    // }

    // Si le type de transport est Aérien, airType est également obligatoire
    if (transportType === "AERIEN" && !airType) {
      return res.status(400).json({
        error: "Le champ airType est obligatoire pour le transport aérien.",
      });
    }

    // if (!client) {
    //   return res.status(404).json({ error: "Client avec code non trouvé." });
    // }
    let clientId = null;

    // Si un clientAvecCode est fourni, essayer de récupérer le client
    if (clientAvecCode) {
      const client = await prisma.clientAvecCode.findUnique({
        where: { code: clientAvecCode },
      });

      if (!client) {
        return res.status(404).json({ error: "Client avec code non trouvé." });
      }

      clientId = client.id;
    }

    // Création du colis dans la base de données avec association au client
    const colis = await prisma.colis.create({
      data: {
        code,
        nom_complet,
        tracking_code,
        poids: poids ? parseInt(poids) : null, // Si le poids est fourni, le transformer en entier
        telephone,
        transportType,
        airType,
        clientAvecCodeId: clientId, // Associer le colis au client avec code
      },
    });
    4;

    res.status(201).json({ message: "Colis créé avec succès", colis });
  } catch (error) {
    console.error("Erreur lors de la création du colis :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const updateColis = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  const data = req.body;
  try {
    // Vérification de l'existence du colis
    const colis = await prisma.colis.findUnique({
      where: { id: parseInt(id) },
    });

    if (!colis) {
      return res.status(404).json({ error: "Colis non trouvé" });
    }

    // Appel à la fonction réutilisable pour mettre à jour le colis
    const colisRecord = await updateRecord(id, {
      nom_complet: data.nom_complet,
      tracking_code: data.tracking_code,
      poids: data.poids,
      telephone: data.telephone,
      transportType: data.transportType,
      airType: data.airType,
      Status: data.status,
    });
    res
      .status(200)
      .json({ message: "Colis a été modifié avec succès", colisRecord });
  } catch (error) {
    console.error("Erreur lors de la modification du colis :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const deleteColis = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérification de l'existence du colis
    const colis = await prisma.colis.findUnique({
      where: { id: parseInt(id) },
    });

    if (!colis) {
      return res.status(404).json({ error: "Colis non trouvé" });
    }

    // Suppression du colis
    await prisma.colis.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Colis supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du colis :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const addParcelInGroupage = async (req, res) => {
  const { code, colisData } = req.body;

  try {
    // Vérifier si le groupage existe
    const groupage = await prisma.groupage.findUnique({
      where: { code: code },
      include: { masterPacks: true },
    });

    if (!groupage) {
      return res.status(404).json({ error: "Groupage non trouvé" });
    }

    // Récupérer le dernier master pack ou en créer un si aucun n'existe
    let dernierMasterPack =
      groupage.masterPacks[groupage.masterPacks.length - 1];

    if (!dernierMasterPack) {
      // Si aucun master pack, créer le premier
      dernierMasterPack = await prisma.masterPack.create({
        data: {
          groupage: { connect: { id: groupage.id } }, // Associer au groupage
        },
      });
    }
    console.log(colisData);

    // Ajouter le colis à ce master pack
    const colis = await prisma.colis.update({
      where: { id: colisData.id },
      data: {
        nom_complet: colisData.nom_complet || "Nom par défaut", // Exemple de valeur par défaut
        telephone: colisData.telephone || "0000000000", // Exemple de valeur par défaut
        masterPack: { connect: { id: dernierMasterPack.id } }, // Associer au master pack
        groupage: { connect: { id: groupage.id } }, // Associer au groupage
        code: colisData.code || null, // Nullable
        status: "GROUPED", // Status par défaut ou valeur fournie
        poids: colisData.poids || null, // Nullable
        transportType: colisData.transportType || null, // Nullable
        airType: colisData.airType || null, // Nullable
      },
    });

    return res.status(201).json(colis);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors de l'ajout du colis" });
  }
};

const getParcelByGroupage = async (req, res) => {
  const { groupageId } = req.params;

  try {
    const groupage = await prisma.groupage.findUnique({
      where: { id: parseInt(groupageId) },
      include: {
        masterPacks: {
          include: {
            colis: true,
            colisMasterPacks: true,
          },
        },
      },
    });

    if (!groupage) {
      return res.status(404).json({ error: "Groupage non trouvé" });
    }

    // Extraire tous les colis et ColisMasterPacks de chaque master pack du groupage
    const parcels = groupage.masterPacks.flatMap((masterPack) => [
      ...masterPack.colis,
      ...masterPack.colisMasterPacks,
    ]);

    return res.status(200).json(parcels);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Erreur lors de la récupération des colis" });
  }
};

const getColisByMasterPack = async (req, res) => {
  const { masterPackId } = req.params;

  try {
    // Récupérer le master pack avec tous ses colis
    const masterPack = await prisma.masterPack.findUnique({
      where: { id: parseInt(masterPackId) },
      include: {
        colis: true,
      },
    });

    if (!masterPack) {
      return res.status(404).json({ error: "Master pack non trouvé" });
    }

    return res.status(200).json(masterPack.colis);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Erreur lors de la récupération des colis" });
  }
};

const getMasterPacksByGroupage = async (req, res) => {
  const { groupageId } = req.params;

  try {
    // Récupérer tous les master packs et colisMasterPacks d'un groupage
    const groupage = await prisma.groupage.findUnique({
      where: { id: parseInt(groupageId) },
      include: {
        masterPacks: true,
        colisMasterPacks: true,
      },
    });

    if (!groupage) {
      return res.status(404).json({ error: "Groupage non trouvé" });
    }

    // Combiner les masterPacks et colisMasterPacks
    const allMasterPacks = [
      ...groupage.masterPacks,
      ...groupage.colisMasterPacks.map((cms) => ({
        ...cms,
        isColisMasterPack: true,
      })),
    ];

    return res.status(200).json(allMasterPacks);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Erreur lors de la récupération des master packs" });
  }
};

const getFilteredColis = async (req, res) => {
  const { nom_complet, code, telephone, date, startDate, endDate } = req.query;

  try {
    let whereClause = {
      status: "RECEIVED",
    };

    if (nom_complet) {
      whereClause.nom_complet = { contains: nom_complet, mode: "insensitive" };
    }

    if (code) {
      whereClause.code = code;
    }

    if (telephone) {
      whereClause.telephone = telephone;
    }

    if (date) {
      const parsedDate = new Date(date);
      whereClause.createdAt = {
        gte: parsedDate,
        lt: new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const colis = await prisma.colis.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(colis);
  } catch (error) {
    console.error("Erreur lors de la récupération des colis filtrés :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

// ... existing code ...

const getParcelById = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérification que l'ID est fourni
    if (!id) {
      return res.status(400).json({ error: "L'ID du colis est requis" });
    }

    // Vérification de l'existence de l'ID dans la base de données
    const parcelExists = await prisma.colis.findUnique({
      where: { id: parseInt(id) },
      select: { id: true }, // Récupère uniquement l'ID pour vérifier l'existence
    });

    if (!parcelExists) {
      return res.status(404).json({ error: "Colis non trouvé" });
    }

    // Récupération du colis avec toutes les relations associées
    const parcel = await prisma.colis.findUnique({
      where: { id: parseInt(id) },
      include: {
        masterPack: true, // Inclut les informations du masterPack
        groupage: {
          // Inclut les informations du groupage
          include: {
            masterPacks: true, // Inclut les masterPacks associés au groupage
            notes: true, // Inclut les notes associées au groupage
          },
        },
        clientAvecCode: true, // Inclut les informations du clientAvecCode
        notes: true, // Inclut les notes asso ciées au colis
      },
    });

    // Vérification si le colis existe
    if (!parcel) {
      return res.status(404).json({ error: "Colis non trouvé" });
    }

    res.status(200).json({ parcel });
  } catch (error) {
    console.error("Erreur lors de la récupération du colis:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};
module.exports = {
  createColis,
  updateColis,
  deleteColis,
  addParcelInGroupage,
  getParcelByGroupage,
  getColisByMasterPack,
  getMasterPacksByGroupage,
  getFilteredColis,
  getParcelById,
};
