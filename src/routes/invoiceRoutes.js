const { Router } = require("express");
const {
  createInvoice,
  invoiceHistory,
} = require("../controllers/invoiceController");

const invoiceRouter = Router();

invoiceRouter.post("/create-invoice", createInvoice);
invoiceRouter.get("/invoice-history", invoiceHistory);

module.exports = invoiceRouter;
