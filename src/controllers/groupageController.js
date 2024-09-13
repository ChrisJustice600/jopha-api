const { prisma } = require("../../database/prisma");

const createGroupage = async (req, res) => {
  const { code } = req.body;
  try {
    const groupage = await prisma.groupage.create({
      data: { code },
    });
    res.status(201).json(groupage);
  } catch (error) {
    res.status(400).json({ error: "Erreur lors de la création du groupage." });
  }
};

module.exports = { createGroupage };
