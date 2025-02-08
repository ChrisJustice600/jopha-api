const { Router } = require("express");
const {
  createExpense,
  GetAllExpense,
} = require("../controllers/expenseController");

const expenseRouter = Router();

expenseRouter.post("/create-expense", createExpense);
expenseRouter.get("/get-expense", GetAllExpense);

module.exports = expenseRouter;
