const { Router } = require("express");
const { signin, register, logout } = require("../controllers/auth");

const authRouter = Router();

authRouter.post("/register", register);

// authRouter.post(`/signup/:adminRouteParams`, signup);

authRouter.post("/signin", signin);
authRouter.post("/logout", logout);

module.exports = authRouter;
