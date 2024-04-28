const { Router } = require("express");
const { signin, register } = require("../controllers/auth");

const authRouter = Router();

authRouter.post("/register", register);

// authRouter.post(`/signup/:adminRouteParams`, signup);

authRouter.post("/signin", signin);

module.exports = authRouter;
