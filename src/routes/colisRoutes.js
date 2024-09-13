const { Router } = require("express");
const {
  createColis,
  updateColis,
} = require("../../src/controllers/colisController");
const checkUserAuthenticated = require("../../src/middleware/authMiddleware");

const authRouter = Router();

authRouter.post("/register", checkUserAuthenticated, createColis);
authRouter.post("/update/:id", checkUserAuthenticated, updateColis);

module.exports = authRouter;
