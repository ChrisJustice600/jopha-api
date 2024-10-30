// const { comparePassword } = require("../../bcryptConfigconfig/bcryptConfig");
const { generateToken } = require("../../config/jwtconfig");
const { prisma, findUserByEmail } = require("../../database/prisma");
const bcrypt = require("bcrypt");
const config = require("../../config/environment");

const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        username,
        role: "USER",
      },
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

async function signin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" }); // Handle invalid credentials
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" }); // Handle invalid credentials
    }

    const token = generateToken(user);
    console.log();

    res.cookie("token", token).json({
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error });
  }
}
module.exports = { register, signin };

