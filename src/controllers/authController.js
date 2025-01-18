const { hashPassword } = require("../../config/bcryptConfig");
const { generateToken, verifyToken } = require("../../config/jwtconfig");
const {
  sendAccountCreatedEmail,
  sendResetEmail,
  sendPasswordChangedEmail,
} = require("../../config/nodeMailer");
const { prisma } = require("../../database/prisma");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // // Regex pour valider le format de l'email
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // // Validation de base
    // if (!email || !password || !username) {
    //   return res.status(400).json({ error: "Champs obligatoires manquants" });
    // }

    // // Vérification du format de l'email
    // if (!emailRegex.test(email)) {
    //   return res.status(400).json({ error: "Adresse email invalide" });
    // }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // Hacher le mot de passe
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Créer l'utilisateur dans la base de données
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: passwordHash,
        role,
      },
    });
    // console.log("user", user);

    try {
      await sendAccountCreatedEmail(email, password);
      console.log("E-mail de bienvenue envoyé avec succès chez " + email);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail de bienvenue :", error);
    }

    // Retourner la réponse avec le token et les informations de l'utilisateur
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const signin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Vérifier si l'utilisateur existe avec l'email ou le username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Identifiant ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ error: "Identifiant ou mot de passe incorrect" });
    }

    // Générer un token JWT
    const token = generateToken(user);

    // Envoyer le cookie avec des options sécurisées
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS en production
        sameSite: "strict",
        maxAge: 3600000, // 1 heure
      })
      .json({
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

// Fonction principale
async function forgotPassword(req, res) {
  const { email } = req.body;
  console.log(email);

  // Vérification des paramètres requis
  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }

  try {
    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    // Génération du token JWT pour la réinitialisation
    const token = generateToken(user);

    // Mise à jour du token et de son expiration dans la base de données
    const testuser = await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExp: new Date(Date.now() + 3600000), // Expiration dans 1 heure
      },
    });
    console.log(testuser);

    // Création du lien de réinitialisation
    const resetLink = `${process.env.FRONTEND_URL_PRODUCTION}/auth/reset-password?token=${token}`;

    // Envoi de l'e-mail
    await sendResetEmail(email, resetLink);

    // Réponse au client
    res.status(200).json({
      message: "Email de réinitialisation envoyé avec succès.",
      email,
    });
  } catch (err) {
    console.error("Erreur dans la fonction forgotPassword : ", err.message);

    // Réponse en cas d'erreur interne
    res.status(500).json({
      error: "Une erreur est survenue lors du traitement de la demande.",
    });
  }
}

async function resetPassword(req, res) {
  const { token, password } = req.body;
  console.log(token);
  console.log(password);

  // Validate request body
  if (!token || !password) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Find user by id and resetToken
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    console.log(user);

    // Check if user exists and token is valid
    if (!user) {
      return res
        .status(400)
        .json({ error: "Token invalide ou utilisateur introuvable." });
    }

    if (user.resetToken !== token) {
      return res.status(400).json({ error: "Token invalide." });
    }

    if (user.resetTokenExp < new Date()) {
      return res.status(400).json({ error: "Token expiré." });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);
    // console.log("auth:", user);

    // Update user password and reset token fields
    const userInfoUpdated = await prisma.user.update({
      where: { id: user.id },
      data: {
        password,
        resetToken: null,
        resetTokenExp: null,
      },
    });
    console.log(userInfoUpdated);
    // Envoyer un e-mail de confirmation
    // console.log(user.email);

    await sendPasswordChangedEmail(user.email);

    // Send success response
    res.status(200).json({
      message: "Mot de passe mis à jour avec succès.",
      userInfoUpdated,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Token invalide ou expiré." });
    }
    console.error("Erreur lors du reset du mot de passe:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
}

module.exports = { register, signin, resetPassword, forgotPassword };
