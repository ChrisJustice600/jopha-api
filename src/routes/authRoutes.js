const { Router } = require("express");
const authController = require("../../src/controllers/authController");

const authRouter = Router();

authRouter.post("/register", authController.register);

// authRouter.post(`/signup/:adminRouteParams`, signup);

authRouter.post("/signin", authController.signin);
// authRouter.post("/logout", logout);

module.exports = authRouter;
