const { prisma } = require("../../database/prisma");

const createGroupage = async (req, res) => {
  const { code, poids_colis, transportType, airType } = req.body; // Destructure data from request body

  try {
    // Create a new groupage using Prisma
    const groupage = await prisma.groupage.create({
      data: {
        code, // Mandatory field
        poids_colis, // Optional field
        transportType, // Optional field
        airType: airType || null, // Optional field
        status: "GROUPED", // Default value as per the schema
      },
    });
    res.status(201).json(groupage); // Send back the created groupage object
  } catch (error) {
    // Check if the error is a unique constraint violation
    if (error.code === "P2002" && error.meta?.target?.includes("code")) {
      res.status(400).json({
        error:
          "Un groupage avec ce code existe déjà. Veuillez utiliser un autre code.",
      });
    } else {
      // Handle other errors
      res.status(500).json({
        error: "Une erreur est survenue lors de la création du groupage.",
      });
    }
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
