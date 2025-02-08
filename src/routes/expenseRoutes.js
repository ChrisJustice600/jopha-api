const { Router } = require("express");
const { createExpense } = require("../controllers/expenseController");

const expenseRouter = Router();

expenseRouter.post("/create-expense", createExpense);

module.exports = expenseRouter;
