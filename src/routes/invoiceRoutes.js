const { Router } = require("express");
const { createInvoice } = require("../controllers/invoiceController");

const invoiceRouter = Router();

invoiceRouter.post("/create-invoice", createInvoice);

// authRouter.post(`/signup/:adminRouteParams`, signup);
// authRouter.post("/signin", authController.signin);
// authRouter.post("/logout", logout);

module.exports = invoiceRouter;
