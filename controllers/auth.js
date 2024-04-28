const { comparePassword } = require("../config/bcryptConfig");
const { generateToken } = require("../config/jwtconfig");
const { prisma, findUserByEmail } = require("../database/prisma");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // const emailRegex = new RegExp(
    //   /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    // );

    // if (!emailRegex.test(email)) {
    //   return res.json({ errorEmail: "email error" });
    // }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: passwordHash,
        role: "USER",
      },
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.rel && error.rel.includes("Email")) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

async function signin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" }); // Handle invalid credentials
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" }); // Handle invalid credentials
    }

    const token = generateToken(user);
    res.cookie("token", token).json({
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error });
  }
}

module.exports = { register, signin };
