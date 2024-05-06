const { Router } = require("express");
const { getProfile, createProject } = require("../controllers/users");
const { checkUserRole } = require("../middlewares/checkUserRole");
const {
  checkUserAuthenticated,
} = require("../middlewares/checkUserAuthenticated");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const usersRouter = Router();

// Pour accéder aux infos de profile on vérifie si le user est authentifié et si il a le rôle USER
usersRouter.get("/profile", checkUserAuthenticated, checkUserRole, getProfile);
usersRouter.post(
  "/create/project",
  checkUserAuthenticated,
  checkUserRole,
  uploadMiddleware.single("file"),
  createProject
);

module.exports = usersRouter;
