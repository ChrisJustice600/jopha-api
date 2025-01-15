const { generateToken } = require("../../config/jwtconfig");
const { prisma } = require("../../database/prisma");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log("username: ", username);
    console.log("email: ", email);
    console.log("password: ", password);
    console.log("Role: ", role);

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
    console.log("user", user);

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
    const { identifier, password } = req.body; // `identifier` peut être soit un email, soit un username

    // Vérifier si l'utilisateur existe avec l'email ou le username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier }, // Recherche par email
          { username: identifier }, // Recherche par username
        ],
      },
    });

    // Si l'utilisateur n'existe pas
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
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Retourner la réponse avec le token et les informations de l'utilisateur
    // res.status(200).json({
    //   user: {
    //     id: user.id,
    //     username: user.username,
    //     email: user.email,
    //     role: user.role,
    //   },
    //   token,
    // });

    // Envoi du token dans un cookie et des informations de l'utilisateur en réponse
    res.cookie("token", token, { httpOnly: true }).json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        token: token,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

module.exports = { register, signin };
