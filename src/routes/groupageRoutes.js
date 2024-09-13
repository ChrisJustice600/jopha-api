const { Router } = require("express");
const { createGroupage } = require("../../src/controllers/groupageController");
const checkUserAuthenticated = require("../../src/middleware/authMiddleware");

const authRouter = Router();

authRouter.post("/create", checkUserAuthenticated, createGroupage);

module.exports = authRouter;
