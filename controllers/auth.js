const { prisma } = require("../database/prisma");

const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    password = bcrypt.hashSync(password, 10);
    const role = "User";
    const users = await prisma.user.create({
      data: { username, email, password, role },
    });
    res.status(201).json({ users });
  } catch (error) {
    res.status(500).json({ error });
  }
};

async function signin(req, res) {}

module.exports = { register, signin };
