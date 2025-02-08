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

  // // Validation de la devise (doit être une valeur valide de l'énumération Currency)
  // if (!Object.values(prisma.Currency).includes(currency)) {
  //   return res.status(400).json({ error: "Devise non valide." });
  // }

  // // Validation de la catégorie (doit être une valeur valide de l'énumération ExpenseCategory)
  // if (!Object.values(prisma.ExpenseCategory).includes(category)) {
  //   return res.status(400).json({ error: "Catégorie de dépense non valide." });
  // }

  try {
    // Créer la dépense dans la base de données
    const expense = await prisma.expense.create({
      data: {
        date: new Date(date), // Convertir la date en objet Date
        description,
        amount,
        currency,
        category,
      },
    });

    // Répondre avec la dépense créée
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

    // Récupérer les dépenses du jour
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Calcul des totaux
    const totalUSD = expenses
      .filter((e) => e.currency === "USD")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCDF = expenses
      .filter((e) => e.currency === "CDF")
      .reduce((sum, e) => sum + e.amount, 0);

    // Génération du numéro de rapport unique
    const reportNumber = `RAPPORT-${Date.now().toString().slice(-6)}`;

    // Créer un nouvel historique de dépense
    await prisma.expenseHistory.create({
      data: {
        reportNumber,
        totalUSD,
        totalCDF,
        expenses: {
          connect: expenses.map((expense) => ({ id: expense.id })),
        },
      },
    });

    // Réponse JSON avec rapport et dépenses associées
    return res.json({
      date: today.toISOString(),
      reportNumber,
      totalUSD,
      totalCDF,
      expenses,
    });
  } catch (error) {
    console.error("Erreur lors de la génération du rapport :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  createExpense,
  GetAllExpense,
  getDailyExpenseReport,
};
