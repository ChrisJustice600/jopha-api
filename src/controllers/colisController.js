const { prisma, updateRecord } = require("../../database/prisma");

const createColis = async (req, res) => {
  const {
    code,
    nom_complet,
    tracking_code,
    poids_colis,
    telephone,
    transportType,
    airType,
    // clientAvecCode,
    itemType,
  } = req.body;

  try {
    // **Création du colis avec validations des champs optionnels**
    const colis = await prisma.colis.create({
      data: {
        code: code?.trim() || null,
        nom_complet: nom_complet.trim(),
        tracking_code: tracking_code.trim(),
        poids_colis: poids_colis || null, // Conversion en Decimal
        telephone: telephone.trim(),
        transportType: transportType || null,
        airType: airType || null,
        // clientAvecCodeId: clientId,
        itemType: itemType || null,
        status: "RECEIVED", // Ajout du statut par défaut
      },
    });

    // Réponse en cas de succès
    res.status(201).json({
      message: "Colis créé avec succès",
      colis,
    });
  } catch (error) {
    // **Gestion détaillée des erreurs Prisma et autres**
    if (error.code === "P2002") {
      // Erreur d'unicité Prisma
      return res.status(409).json({
        error: "Un colis avec le même tracking_code existe déjà.",
      });
    }

    // Erreur générale côté serveur
    console.error("Erreur lors de la création du colis:", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la création du colis.",
      details: error.message,
    });
  }
};

const updateColis = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  const data = req.body;
  try {
    const colis = await prisma.colis.findUnique({
      where: { id: parseInt(id) },
    });

    if (!colis) {
      return res.status(404).json({ error: "Colis non trouvé" });
    }

    const colisRecord = await updateRecord(id, {
      nom_complet: data.nom_complet,
      tracking_code: data.tracking_code,
      poids_colis: data.poids_colis,
      telephone: data.telephone,
      transportType: data.transportType,
      airType: data.airType,
      itemType: data.itemTypeType,
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

const removeParcelFromMasterPack = async (req, res) => {
  const { masterPackId, colisId } = req.params;
  console.log(masterPackId, colisId);

  try {
    // Vérification si le colis existe et est associé au MasterPack
    const colis = await prisma.colis.findUnique({
      where: { id: parseInt(colisId) },
    });

    if (!colis) {
      return res.status(404).json({ error: "Colis non trouvé" });
    }

    if (colis.masterPackId !== parseInt(masterPackId)) {
      return res.status(400).json({
        error: "Le colis n'est pas associé à ce MasterPack",
      });
    }

    // Suppression de l'association avec le MasterPack
    const updatedColis = await prisma.colis.update({
      where: { id: parseInt(colisId) },
      data: {
        masterPackId: null, // Suppression de l'association
      },
    });

    return res.status(200).json({
      message: "Colis dissocié du MasterPack avec succès",
      updatedColis,
    });
  } catch (error) {
    console.error("Erreur lors de la dissociation du colis :", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const updateParcelInMasterPack = async (req, res) => {
  const { masterPackId, colisId } = req.params;
  const { poids_colis, code } = req.body; // Exemples de champs modifiables
  console.log(masterPackId, colisId, req.body);

  try {
    // Vérification si le colis existe et est associé au MasterPack
    const colis = await prisma.colis.findUnique({
      where: { id: parseInt(colisId) },
    });

    if (!colis) {
      return res.status(404).json({ error: "Colis non trouvé" });
    }

    if (colis.masterPackId !== parseInt(masterPackId)) {
      return res.status(400).json({
        error: "Le colis n'est pas associé à ce MasterPack",
      });
    }

    // Mise à jour des données du colis
    const updatedColis = await prisma.colis.update({
      where: { id: parseInt(colisId) },
      data: {
        poids_colis,
        code,
      },
    });

    return res.status(200).json({
      message: "Colis mis à jour avec succès dans le MasterPack",
      updatedColis,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du colis :", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const addParcelInGroupage = async (req, res) => {
  const { code, colisData } = req.body;

  try {
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
  const { code } = req.params;

  try {
    // Trouver le groupage et inclure uniquement les masterPacks et leurs colis
    const groupage = await prisma.groupage.findUnique({
      where: { code },
      include: {
        masterPacks: {
          include: {
            colis: true, // Inclure les colis liés aux masterPacks
          },
        },
      },
    });

    if (!groupage) {
      return res.status(404).json({ error: "Groupage non trouvé" });
    }

    // Supprimer les MasterPacks vides qui ne sont pas le dernier
    const updatedMasterPacks = await Promise.all(
      groupage.masterPacks.map(async (masterPack, index) => {
        if (
          masterPack.colis.length === 0 &&
          index !== groupage.masterPacks.length - 1
        ) {
          // Supprimer ce MasterPack
          await prisma.masterPack.delete({
            where: { id: masterPack.id },
          });
          return null;
        }
        return masterPack;
      })
    );

    // Filtrer les MasterPacks supprimés
    const filteredMasterPacks = updatedMasterPacks.filter(Boolean);

    // Réordonner les numéros des MasterPacks
    await Promise.all(
      filteredMasterPacks.map(async (masterPack, index) => {
        const numero = `MP#${String(index + 1).padStart(2, "0")}`;
        if (masterPack.numero !== numero) {
          await prisma.masterPack.update({
            where: { id: masterPack.id },
            data: { numero },
          });
        }
      })
    );

    // Calculer le poids total des colis pour chaque MasterPack
    await Promise.all(
      filteredMasterPacks.map(async (masterPack) => {
        const totalPoidsColis = masterPack.colis.reduce((total, colis) => {
          const poids = parseFloat(colis.poids_colis) || 0;
          return total + poids;
        }, 0);

        await prisma.masterPack.update({
          where: { id: masterPack.id },
          data: { poids_colis: totalPoidsColis.toFixed(2) },
        });

        // Mettre à jour le poids localement pour la réponse
        masterPack.poids_colis = totalPoidsColis.toFixed(2);
      })
    );

    // Reconstruire les données des MasterPacks avec leurs colis
    const masterPacks = filteredMasterPacks.map((masterPack) => ({
      id: masterPack.id,
      numero: masterPack.numero,
      poids_colis: masterPack.poids_colis,
      colis: masterPack.colis.map((colis) => ({
        id: colis.id,
        code: colis.code,
        nom_complet: colis.nom_complet,
        status: colis.status,
        tracking_code: colis.tracking_code,
        telephone: colis.telephone,
        poids_colis: colis.poids_colis,
        transportType: colis.transportType,
        airType: colis.airType,
        itemType: colis.itemType,
        createdAt: colis.createdAt,
        updatedAt: colis.updatedAt,
      })),
    }));

    // Répondre avec les MasterPacks et leurs colis
    return res.status(200).json({
      success: true,
      masterPacks,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des master packs :", error);
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
  removeParcelFromMasterPack,
  updateParcelInMasterPack,
};
