const { Router } = require("express");
const authController = require("../controllers/authController");

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/signin", authController.signin);
authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
// authRouter.post(`/signup/:adminRouteParams`, signup);

// authRouter.post("/signin", authController.signin);
// authRouter.post("/logout", logout);

module.exports = authRouter;
