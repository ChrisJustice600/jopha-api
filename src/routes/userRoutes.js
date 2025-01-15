const { Router } = require("express");
const userController = require("../controllers/userController");

const userRouter = Router();

userRouter.get("/getAll", userController.getAllUsers);

// authRouter.post(`/signup/:adminRouteParams`, signup);

// authRouter.post("/signin", authController.signin);
// authRouter.post("/logout", logout);

module.exports = userRouter;
