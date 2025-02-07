const { Router } = require("express");
const {
  createInvoice,
  invoiceHistory,
} = require("../controllers/invoiceController");

const invoiceRouter = Router();

invoiceRouter.post("/create-invoice", createInvoice);
invoiceRouter.get("/invoice-history", invoiceHistory);

// authRouter.post(`/signup/:adminRouteParams`, signup);
// authRouter.post("/signin", authController.signin);
// authRouter.post("/logout", logout);

module.exports = invoiceRouter;
