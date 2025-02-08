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

  // Validation de la devise (doit être une valeur valide de l'énumération Currency)
  if (!Object.values(prisma.Currency).includes(currency)) {
    return res.status(400).json({ error: "Devise non valide." });
  }

  // Validation de la catégorie (doit être une valeur valide de l'énumération ExpenseCategory)
  if (!Object.values(prisma.ExpenseCategory).includes(category)) {
    return res.status(400).json({ error: "Catégorie de dépense non valide." });
  }

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

module.exports = {
  createExpense,
};
