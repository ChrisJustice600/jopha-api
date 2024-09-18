const { Router } = require("express");
const { createClientAvecCode } = require("../controllers/clientCodeController");

const authRouter = Router();

authRouter.post("/registerClient", createClientAvecCode);

module.exports = authRouter;
