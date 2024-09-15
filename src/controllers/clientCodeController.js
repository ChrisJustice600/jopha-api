const { prisma } = require("../../database/prisma");

const createClientAvecCode = async (req, res) => {
  const { code, nomAgence } = req.body;

  try {
    // Validation des champs obligatoires
    if (!code || !nomAgence) {
      return res.status(400).json({
        error: "Les champs code et nom_sous_agence sont obligatoires.",
      });
    }

    // Vérifier si un client avec ce code existe déjà
    const clientExiste = await prisma.clientAvecCode.findUnique({
      where: { code },
    });

    if (clientExiste) {
      return res
        .status(409)
        .json({ error: "Un client avec ce code existe déjà." });
    }

    // Création du client avec code
    const client = await prisma.clientAvecCode.create({
      data: {
        code,
        nomAgence,
      },
    });

    res
      .status(201)
      .json({ message: "Client avec code créé avec succès", client });
  } catch (error) {
    console.error("Erreur lors de la création du client avec code :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

module.exports = { createClientAvecCode };
