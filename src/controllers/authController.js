// const { comparePassword } = require("../config/bcryptConfig");
// const { generateToken } = require("../config/jwtconfig");
const { prisma } = require("../../database/prisma");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Regex pour valider le format de l'email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // Vérification du format de l'email
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Adresse email invalide" });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role: "USER",
      },
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);

    if (error.rel && error.rel.includes("Email")) {
      res.status(400).json({ error: "Cet email existe déjà" });
    } else {
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }
};

module.exports = { register };
