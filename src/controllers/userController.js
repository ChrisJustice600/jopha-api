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

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, username, role } = req.body;

  console.log(id);
  console.log(email, username, role);

  try {
    // Vérifiez si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mettez à jour les informations de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email,
        username,
        role,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifiez si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Supprimez l'utilisateur
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getAllUsers, updateUser, deleteUser };
