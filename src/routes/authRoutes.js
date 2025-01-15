const { Router } = require("express");
const authController = require("../controllers/authController");

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/signin", authController.signin);

// authRouter.post(`/signup/:adminRouteParams`, signup);

// authRouter.post("/signin", authController.signin);
// authRouter.post("/logout", logout);

module.exports = authRouter;
