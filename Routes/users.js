const { Router } = require("express");
const { getProfile } = require("../controllers/users");
const { checkUserRole } = require("../middlewares/checkUserRole");
const {
  checkUserAuthenticated,
} = require("../middlewares/checkUserAuthenticated");
const usersRouter = Router();

// Pour accéder aux infos de profile on vérifie si le user est authentifié et si il a le rôle USER
usersRouter.get("/profile", checkUserAuthenticated, checkUserRole, getProfile);

module.exports = usersRouter;
