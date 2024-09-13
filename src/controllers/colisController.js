// const { prisma } = require("../../database/prisma");

// const createColis = async (req, res) => {
//   const { nom_complet, masterPackId, telephone } = req.body;

//   // res.json(req.body);

//   const colis = await prisma.colis.create({
//     data: { nom_complet, masterPackId, telephone },
//   });

//   res.status(201).json(colis);
// };

// module.exports = { createColis };

const { prisma, updateRecord } = require("../../database/prisma");

const createColis = async (req, res) => {
  const { code, nom_complet, poids, telephone, transportType, airType } =
    req.body;
  try {
    // // Validation de base des champs requis
    // if (!nom_complet || !telephone || !transportType) {
    //   return res
    //     .status(400)
    //     .json({
    //       error:
    //         "Les champs nom_complet, telephone et transportType sont obligatoires.",
    //     });
    // }

    // // Si le type de transport est Aérien, airType est également obligatoire
    // if (transportType === "AERIEN" && !airType) {
    //   return res
    //     .status(400)
    //     .json({
    //       error: "Le champ airType est obligatoire pour le transport aérien.",
    //     });
    // }

    // Création du colis dans la base de données
    const colis = await prisma.colis.create({
      data: {
        nom_complet,
        poids: poids ? parseInt(poids) : null, // Si le poids est fourni, le transformer en entier
        telephone,
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
    // Appel à la fonction réutilisable pour mettre à jour le colis
    const colis = await updateRecord(id, { nom_complet });
    res.status(200).json({ message: "Colis a été modifié avec succès", colis });
  } catch (error) {
    console.error("Erreur lors de la modification du colis :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

module.exports = { createColis, updateColis };
