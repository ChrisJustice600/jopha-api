const { Router } = require("express");
const userController = require("../controllers/userController");

const userRouter = Router();

userRouter.get("/getAll", userController.getAllUsers);
userRouter.put("/update/:id", userController.updateUser);
userRouter.delete("/delete/:id", userController.deleteUser);

// authRouter.post(`/signup/:adminRouteParams`, signup);

// authRouter.post("/signin", authController.signin);
// authRouter.post("/logout", logout);

module.exports = userRouter;
