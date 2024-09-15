const { Router } = require("express");
const {
  createClientAvecCode,
} = require("../../src/controllers/clientCodeController");

const authRouter = Router();

authRouter.post("/registerClient", createClientAvecCode);

module.exports = authRouter;
