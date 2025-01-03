const { Router } = require("express");
const {
  createGroupage,
  getAllGroupagesWithDetails,
  deleteGroupage,
} = require("../controllers/groupageController");
const { checkUserAuthenticated } = require("../middleware/authMiddleware");

const authRouter = Router();

// authRouter.use(checkUserAuthenticated);

authRouter.post("/create", createGroupage);
authRouter.get("/all", getAllGroupagesWithDetails); // Nouvelle route pour récupérer tous les groupages
authRouter.delete("/delete/:id", deleteGroupage); // Nouvelle route pour récupérer tous les groupages

module.exports = authRouter;
