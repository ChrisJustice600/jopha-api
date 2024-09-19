const { prisma } = require("../../database/prisma");

const createGroupage = async (req, res) => {
  const { code } = req.body;
  console.log(code);

  try {
    const groupage = await prisma.groupage.create({
      data: { code },
    });
    res.status(201).json(groupage);
  } catch (error) {
    res.status(400).json({ error: "Erreur lors de la création du groupage." });
  }
};

const getAllGroupagesWithDetails = async (req, res) => {
  const { status } = req.query;

  try {
    const groupages = await prisma.groupage.findMany({
      where: {
        status: status || undefined,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        masterPacks: {
          include: {
            colis: true,
          },
        },
      },
    });
    res.status(200).json(groupages);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Erreur lors de la récupération des groupages." });
  }
};

module.exports = { createGroupage, getAllGroupagesWithDetails };
