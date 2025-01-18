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
  console.log(req.body);

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
        status: "RECEIVED", // Mise à jour du status
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

  console.log(colisId);
  console.log(masterPackId);

  const {
    code,
    nom_complet,
    status,
    tracking_code,
    telephone,
    poids_colis,
    transportType,
    airType,
    itemType,
    clientAvecCodeId,
  } = req.body; // Tous les champs modifiables

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
    const status = "IN_TRANSIT";
    // Mise à jour des données du colis
    const updatedColis = await prisma.colis.update({
      where: { id: parseInt(colisId) },
      data: {
        code,
        nom_complet,
        status,
        tracking_code,
        telephone,
        poids_colis,
        transportType,
        airType,
        itemType,
        clientAvecCodeId,
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
  const { code, colisData, masterPackNumber } = req.body; // Récupérer masterPackNumber
  console.log("code:", code);
  console.log("colisData:", colisData);
  console.log("masterPackNumber:", masterPackNumber); // Log du numéro de master pack

  try {
    // Récupérer le groupage et ses master packs associés
    const groupage = await prisma.groupage.findUnique({
      where: { code: code },
      include: { masterPacks: true, colis: true }, // Inclure les colis associés
    });

    if (!groupage) {
      return res.status(404).json({ error: "Groupage non trouvé" });
    }

    let masterPack;

    if (groupage.masterPacks.length === 1) {
      // Cas où il y a un seul master pack : utiliser ce master pack
      masterPack = groupage.masterPacks[0];
      console.log("Un seul master pack trouvé :", masterPack.numero);
    } else if (groupage.masterPacks.length > 1) {
      // Cas où il y a plusieurs master packs : utiliser le masterPackNumber passé dans le body
      if (!masterPackNumber) {
        return res
          .status(400)
          .json({ error: "Numéro de master pack requis pour ce groupage." });
      }

      // Trouver le master pack correspondant au numéro fourni
      masterPack = groupage.masterPacks.find(
        (mp) => mp.numero === masterPackNumber
      );

      if (!masterPack) {
        return res.status(404).json({
          error: `Master pack avec le numéro ${masterPackNumber} non trouvé.`,
        });
      }

      console.log("Master pack sélectionné :", masterPack.numero);
    } else {
      // Cas où aucun master pack n'est associé
      return res
        .status(400)
        .json({ error: "Aucun master pack trouvé pour ce groupage." });
    }

    // Générer un code à 4 chiffres unique pour le colis
    const generateUniqueCode = () => {
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString(); // Génère un code à 4 chiffres
      const isUnique = !groupage.colis.some((colis) =>
        colis.code?.endsWith(randomCode)
      );
      return isUnique ? randomCode : generateUniqueCode(); // Vérifie l'unicité et recommence si nécessaire
    };

    const uniqueCode = generateUniqueCode();
    const colisCode = `${code}-${uniqueCode}`; // Combiner le code du groupage et le code unique

    // Ajouter le colis au master pack trouvé
    const colis = await prisma.colis.update({
      where: { id: colisData.id },
      data: {
        nom_complet: colisData.nom_complet || "Nom par défaut",
        telephone: colisData.telephone || "0000000000",
        masterPack: { connect: { id: masterPack.id } }, // Associer au master pack trouvé
        groupage: { connect: { id: groupage.id } }, // Associer au groupage
        code: colisCode, // Utiliser le code généré
        status: "GROUPED",
        poids_colis: colisData.poids_colis || null,
        transportType: colisData.transportType || null,
        airType: colisData.airType || null,
      },
    });

    return res.status(201).json(colis);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors de l'ajout du colis" });
  }
};
const addParcelToSpecificMasterPack = async (req, res) => {
  const { masterPackNumero, colisData } = req.body;
  console.log("masterPackNumero:", masterPackNumero);
  console.log("colisData:", colisData);

  try {
    // Récupérer le MasterPack spécifique par son numéro
    const masterPack = await prisma.masterPack.findUnique({
      where: { numero: masterPackNumero },
      include: { groupage: true }, // Inclure le groupage associé
    });

    if (!masterPack) {
      return res.status(404).json({ error: "MasterPack non trouvé" });
    }

    // Vérifier si le MasterPack appartient à un groupage
    if (!masterPack.groupage) {
      return res
        .status(400)
        .json({ error: "Ce MasterPack n'appartient à aucun groupage." });
    }

    // Générer un code à 4 chiffres unique pour le colis
    const generateUniqueCode = () => {
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString(); // Génère un code à 4 chiffres
      const isUnique = !masterPack.colis.some((colis) =>
        colis.code?.endsWith(randomCode)
      );
      return isUnique ? randomCode : generateUniqueCode(); // Vérifie l'unicité et recommence si nécessaire
    };

    const uniqueCode = generateUniqueCode();
    const colisCode = `${masterPack.groupage.code}-${uniqueCode}`; // Combiner le code du groupage et le code unique

    // Ajouter le colis au MasterPack spécifique
    const colis = await prisma.colis.update({
      where: { id: colisData.id },
      data: {
        nom_complet: colisData.nom_complet || "Nom par défaut",
        telephone: colisData.telephone || "0000000000",
        masterPack: { connect: { id: masterPack.id } }, // Associer au MasterPack spécifique
        groupage: { connect: { id: masterPack.groupage.id } }, // Associer au groupage
        code: colisCode, // Utiliser le code généré
        status: "GROUPED",
        poids_colis: colisData.poids_colis || null,
        transportType: colisData.transportType || null,
        airType: colisData.airType || null,
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

const deleteMasterPack = async (req, res) => {
  const { code, numero } = req.body;

  try {
    // Trouver le Groupage par son code
    const groupage = await prisma.groupage.findUnique({
      where: { code: code },
      include: { masterPacks: true },
    });

    if (!groupage) {
      return res.status(404).json({
        success: false,
        message: "Groupage non trouvé.",
      });
    }

    // Trouver le MasterPack dans le Groupage par son numéro
    const masterPack = groupage.masterPacks.find((mp) => mp.numero === numero);

    if (!masterPack) {
      return res.status(404).json({
        success: false,
        message: "MasterPack non trouvé dans ce Groupage.",
      });
    }

    // Supprimer le MasterPack
    await prisma.masterPack.delete({
      where: { id: masterPack.id }, // Utiliser l'ID pour supprimer
    });

    // Récupérer tous les MasterPacks restants associés au Groupage
    const remainingMasterPacks = await prisma.masterPack.findMany({
      where: { groupageId: groupage.id }, // Utiliser groupageId pour filtrer
    });

    // Vérifier si les numéros sont séquentiels
    let needsReorganization = false;
    for (let i = 0; i < remainingMasterPacks.length; i++) {
      const expectedNumber = `MP#${String(i + 1).padStart(2, "0")}`;
      if (remainingMasterPacks[i].numero !== expectedNumber) {
        needsReorganization = true;
        break;
      }
    }

    // Réorganiser les numéros si nécessaire
    if (needsReorganization) {
      for (let i = 0; i < remainingMasterPacks.length; i++) {
        const newNumber = `MP#${String(i + 1).padStart(2, "0")}`;
        await prisma.masterPack.update({
          where: { id: remainingMasterPacks[i].id },
          data: { numero: newNumber },
        });
      }
    }

    // Répondre avec un succès
    res.status(200).json({
      success: true,
      message: `MasterPack avec le numéro ${numero} dans le Groupage ${code} a été supprimé avec succès.`,
      reorganized: needsReorganization,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du MasterPack:", error);

    // Répondre avec une erreur
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la suppression du MasterPack.",
    });
  }
};

const getMasterPacksByGroupage = async (req, res) => {
  const { code } = req.params;

  try {
    // Trouver le groupage et inclure les masterPacks avec leurs colis
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

    // Calculer et mettre à jour le poids total des colis pour chaque MasterPack
    const updatedMasterPacks = await Promise.all(
      groupage.masterPacks.map(async (masterPack) => {
        const totalPoidsColis = masterPack.colis.reduce((total, colis) => {
          const poids = parseFloat(colis.poids_colis) || 0; // Convertir le poids en nombre ou utiliser 0 par défaut
          return total + poids;
        }, 0);

        // Mettre à jour le poids dans la base de données
        const updatedMasterPack = await prisma.masterPack.update({
          where: { id: masterPack.id },
          data: { poids_colis: totalPoidsColis.toFixed(2) },
        });

        // Ajouter les colis pour la réponse
        return { ...updatedMasterPack, colis: masterPack.colis };
      })
    );

    // Trier les masterPacks en décroissant selon la partie numérique de leur numéro
    const sortedMasterPacks = updatedMasterPacks.sort((a, b) => {
      const numeroA = parseInt(a.numero.replace(/\D/g, ""), 10) || 0;
      const numeroB = parseInt(b.numero.replace(/\D/g, ""), 10) || 0;
      return numeroB - numeroA; // Décroissant
    });

    // Répondre avec les MasterPacks triés
    return res.status(200).json({
      success: true,
      masterPacks: sortedMasterPacks,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des master packs :", error);
    return res
      .status(500)
      .json({ error: "Erreur lors de la récupération des master packs" });
  }
};

const createNewMasterPackInGroupage = async (req, res) => {
  const { code } = req.body;

  try {
    // Trouver le groupage avec le code donné
    const groupage = await prisma.groupage.findUnique({
      where: { code }, // Recherche par code
    });

    // Vérifier si le groupage existe
    if (!groupage) {
      return res.status(404).json({
        error: `Aucun groupage trouvé avec le code ${code}.`,
      });
    }

    // Récupérer les MasterPacks existants dans le groupage, triés par numéro
    const masterPacks = await prisma.masterPack.findMany({
      where: { groupageId: groupage.id }, // Utiliser l'ID du groupage trouvé
      orderBy: { numero: "asc" }, // Trier par numéro
      include: { colis: true }, // Inclure les colis associés aux MasterPacks
    });

    // Vérifier si des MasterPacks existent dans le groupage
    if (masterPacks.length === 0) {
      return res.status(400).json({
        error:
          "Impossible de créer un MasterPack car aucun MasterPack n'existe dans ce groupage.",
      });
    }

    // Extraire le dernier MasterPack
    const lastMasterPack = masterPacks[masterPacks.length - 1];

    // Vérifier si le dernier MasterPack contient au moins un colis
    if (lastMasterPack.colis.length === 0) {
      return res.status(400).json({
        error:
          "Impossible de créer un nouveau MasterPack car le dernier MasterPack n'a aucun colis associé.",
      });
    }

    // Générer le numéro suivant
    const lastNumero = lastMasterPack.numero;
    const lastNumeroNumber = parseInt(lastNumero.replace("MP#", ""), 10); // Extraire le numéro
    const nextNumeroNumber = lastNumeroNumber + 1; // Incrémenter
    const nextNumero = `MP#${String(nextNumeroNumber).padStart(2, "0")}`; // Formatage : MP#01, MP#02, etc.

    // Créer le nouveau MasterPack avec le numéro généré
    const newMasterPack = await prisma.masterPack.create({
      data: {
        numero: nextNumero,
        poids_colis: "0", // Valeur par défaut ou à définir selon tes besoins
        groupageId: groupage.id, // Utiliser l'ID du groupage trouvé
        status: "GROUPED",
      },
    });

    return res.status(201).json({
      success: true,
      masterPack: newMasterPack,
    });
  } catch (error) {
    console.error("Erreur lors de la création du master pack :", error);
    return res.status(500).json({
      error: "Erreur lors de la création du master pack",
    });
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
  createNewMasterPackInGroupage,
  addParcelToSpecificMasterPack,
  deleteMasterPack,
};
