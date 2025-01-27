const { Router } = require("express");
const authController = require("../controllers/authController");
const { checkUserAuthenticated } = require("../middleware/authMiddleware");

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/signin", authController.signin);
authRouter.get("/verify", checkUserAuthenticated, authController.verify);
authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
// authRouter.post(`/signup/:adminRouteParams`, signup);

// authRouter.post("/signin", authController.signin);
// authRouter.post("/logout", logout);

module.exports = authRouter;
