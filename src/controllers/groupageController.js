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
  const { status, code, startDate, endDate, period } = req.query;

  try {
    const now = new Date();
    let filterDates = {};

    // Handle predefined periods
    if (period === "currentWeek") {
      const startOfWeek = new Date(
        now.setDate(now.getDate() - now.getDay() + 1)
      );
      const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
      filterDates = {
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      };
    } else if (period === "currentMonth") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filterDates = {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    } else if (period === "currentYear") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      filterDates = {
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      };
    }

    // Handle custom date range
    if (startDate && endDate) {
      filterDates = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    }

    // Default to last 3 months
    if (!period && !startDate && !endDate) {
      const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
      filterDates = {
        createdAt: {
          gte: threeMonthsAgo,
        },
      };
    }

    // Build the query
    const whereClause = {
      status: status || undefined,
      code: code || undefined,
      ...filterDates,
    };

    // Fetch data
    const groupages = await prisma.groupage.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
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
    console.error("Error fetching groupages:", error);
    res
      .status(400)
      .json({ error: "Erreur lors de la récupération des groupages." });
  }
};

module.exports = { createGroupage, getAllGroupagesWithDetails };
