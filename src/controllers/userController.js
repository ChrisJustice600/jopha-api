// src/controllers/userController.js
const { prisma } = require("../../database/prisma");

/**
 * Récupère tous les utilisateurs.
 * @param {Object} req - La requête HTTP.
 * @param {Object} res - La réponse HTTP.
 */
const getAllUsers = async (req, res) => {
  try {
    // Récupérer tous les utilisateurs depuis la base de données
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Retourner la liste des utilisateurs
    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

module.exports = { getAllUsers };
