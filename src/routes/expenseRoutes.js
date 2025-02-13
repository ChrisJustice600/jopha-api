const { Router } = require("express");
const {
  createExpense,
  GetAllExpense,
  getDailyExpenseReport,
  getAllExpenseReports,
} = require("../controllers/expenseController");

const expenseRouter = Router();

expenseRouter.post("/create-expense", createExpense);
expenseRouter.get("/get-expense", GetAllExpense);
expenseRouter.get("/get-daily-expense-report", getDailyExpenseReport);
expenseRouter.get("/get-expense-report", getAllExpenseReports);

module.exports = expenseRouter;
