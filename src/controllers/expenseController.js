const { prisma } = require("../../database/prisma");

const createExpense = async (req, res) => {
  const { date, description, amount, currency, category } = req.body;

  // Validation des champs obligatoires
  if (!date || !description || !amount || !currency || !category) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  // Validation du montant (doit être un nombre positif)
  if (typeof amount !== "number" || amount <= 0) {
    return res
      .status(400)
      .json({ error: "Le montant doit être un nombre positif." });
  }

  try {
    // Créer la dépense dans la base de données
    const expense = await prisma.expense.create({
      data: {
        date: new Date(date),
        description,
        amount,
        currency,
        category,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error("Erreur lors de la création de la dépense :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la création de la dépense.",
    });
  }
};

const GetAllExpense = async (req, res) => {
  try {
    const { date, description } = req.query;

    // Obtenir la date du jour si aucun filtre de date n'est fourni
    const filterDate = date ? new Date(date) : new Date();
    filterDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Construire les filtres dynamiquement
    const filters = {
      date: {
        gte: filterDate,
        lt: nextDay,
      },
    };

    if (description) {
      filters.description = {
        contains: description,
        mode: "insensitive", // Permet la recherche insensible à la casse
      };
    }

    // Récupérer les dépenses avec les filtres appliqués
    const expenses = await prisma.expense.findMany({
      where: filters,
      orderBy: {
        date: "desc",
      },
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Erreur lors de la récupération des dépenses :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la récupération des dépenses.",
    });
  }
};

const getDailyExpenseReport = async (req, res) => {
  try {
    // Récupérer la date du jour (minuit - 23:59)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Vérifier si un rapport existe déjà pour aujourd'hui
    const existingReport = await prisma.expenseReport.findFirst({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        expenses: true,
      },
    });

    // Récupérer les dépenses du jour
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Vérifier s'il y a des dépenses
    if (expenses.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucune dépense trouvée pour aujourd'hui." });
    }

    // Calcul des totaux
    const totalUSD = expenses
      .filter((e) => e.currency === "USD")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCDF = expenses
      .filter((e) => e.currency === "CDF")
      .reduce((sum, e) => sum + e.amount, 0);

    let report;

    if (existingReport) {
      // Mettre à jour le rapport existant
      report = await prisma.expenseReport.update({
        where: {
          id: existingReport.id,
        },
        data: {
          totalUSD,
          totalCDF,
          expenses: {
            set: expenses.map((expense) => ({ id: expense.id })),
          },
        },
        include: {
          expenses: true,
        },
      });
    } else {
      // Créer un nouveau rapport
      const reportNumber = `RAPPORT-${Date.now().toString().slice(-6)}`;
      report = await prisma.expenseReport.create({
        data: {
          reportNumber,
          totalUSD,
          totalCDF,
          expenses: {
            connect: expenses.map((expense) => ({ id: expense.id })),
          },
        },
        include: {
          expenses: true,
        },
      });
    }

    // Réponse JSON avec rapport et dépenses associées
    return res.json({
      reportNumber: report.reportNumber,
      totalUSD: report.totalUSD,
      totalCDF: report.totalCDF,
      date: report.createdAt,
      expenses: report.expenses,
      isUpdate: !!existingReport,
    });
  } catch (error) {
    console.error("Erreur lors de la génération du rapport :", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

const getAllExpenseReports = async (req, res) => {
  try {
    // Récupérer tous les rapports de dépenses avec leurs dépenses associées
    const expenseReports = await prisma.expenseReport.findMany({
      include: {
        expenses: true, // Inclure les dépenses associées
      },
    });

    // Formater les données selon le type `reportData`
    const formattedReports = expenseReports.map((report) => ({
      reportNumber: report.reportNumber,
      totalUSD: report.totalUSD,
      totalCDF: report.totalCDF,
      expenses: report.expenses,
    }));

    // Retourner les rapports formatés
    return res.status(200).json(formattedReports);
  } catch (error) {
    console.error("Erreur lors de la récupération des rapports :", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = {
  createExpense,
  GetAllExpense,
  getDailyExpenseReport,
  getAllExpenseReports,
};
