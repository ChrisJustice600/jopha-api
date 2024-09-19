const { Router } = require("express");
const {
  createGroupage,
  getAllGroupages,
} = require("../../src/controllers/groupageController");
const {
  checkUserAuthenticated,
} = require("../../src/middleware/authMiddleware");

const authRouter = Router();

authRouter.use(checkUserAuthenticated);

authRouter.post("/create", createGroupage);
authRouter.get("/all", getAllGroupages); // Nouvelle route pour récupérer tous les groupages

module.exports = authRouter;
