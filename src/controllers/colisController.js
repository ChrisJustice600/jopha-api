const { prisma, updateRecord } = require("../../database/prisma");

const createColis = async (req, res) => {
  const {
    code, // code du colis
    nom_complet,
    poids,
    telephone,
    transportType,
    airType,
    clientAvecCode, // code du client avec code
  } = req.body;

  try {
    // // Validation de base des champs requis
    // if (!nom_complet || !telephone || !transportType || !clientAvecCode) {
    //   return res.status(400).json({
    //     error:
    //       "Les champs nom_complet, telephone, transportType et clientAvecCode sont obligatoires.",
    //   });
    // }

    // // Si le type de transport est Aérien, airType est également obligatoire
    // if (transportType === "AERIEN" && !airType) {
    //   return res.status(400).json({
    //     error: "Le champ airType est obligatoire pour le transport aérien.",
    //   });
    // }

    // Vérifier si le client avec code existe
    // const client = await prisma.clientAvecCode.findUnique({
    //   where: { code: clientAvecCode },
    // });

    // if (!client) {
    //   return res.status(404).json({ error: "Client avec code non trouvé." });
    // }

    // Création du colis dans la base de données avec association au client
    const colis = await prisma.colis.create({
      data: {
        // code,
        nom_complet,
        // poids: poids ? parseInt(poids) : null, // Si le poids est fourni, le transformer en entier
        telephone,
        // transportType,
        // airType,
        // clientAvecCodeId: client.id, // Associer le colis au client avec code
      },
    });

    res.status(201).json({ message: "Colis créé avec succès", colis });
  } catch (error) {
    console.error("Erreur lors de la création du colis :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const updateColis = async (req, res) => {
  const { id } = req.params;

  const { nom_complet } = req.body;
  try {
    // Vérification de l'existence du colis
    const colis = await prisma.colis.findUnique({
      where: { id: parseInt(id) },
    });

    if (!colis) {
      return res.status(404).json({ error: "Colis non trouvé" });
    }

    // Appel à la fonction réutilisable pour mettre à jour le colis
    const colisRecord = await updateRecord(id, { nom_complet });
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

    // Ajouter le colis à ce master pack
    const colis = await prisma.colis.create({
      data: {
        ...colisData,
        masterPack: { connect: { id: dernierMasterPack.id } }, // Associer au master pack
        // groupage: { connect: { id: groupage.id } }, // Optionnel, au cas où tu souhaites lier directement aussi au groupage
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
    // Récupérer tous les colis d'un groupage via les master packs
    const groupage = await prisma.groupage.findUnique({
      where: { id: parseInt(groupageId) },
      include: {
        masterPacks: {
          include: {
            colis: true,
          },
        },
      },
    });

    if (!groupage) {
      return res.status(404).json({ error: "Groupage non trouvé" });
    }

    // Extraire tous les colis de chaque master pack du groupage
    const colis = groupage.masterPacks.flatMap(
      (masterPack) => masterPack.colis
    );

    return res.status(200).json(colis);
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
    // Récupérer tous les master packs d'un groupage
    const groupage = await prisma.groupage.findUnique({
      where: { id: parseInt(groupageId) },
      include: {
        masterPacks: true,
      },
    });

    if (!groupage) {
      return res.status(404).json({ error: "Groupage non trouvé" });
    }

    return res.status(200).json(groupage.masterPacks);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Erreur lors de la récupération des master packs" });
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
};
