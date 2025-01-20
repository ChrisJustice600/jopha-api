const { Router } = require("express");
const { getGroupageStatistics } = require("../controllers/statController");

const statRouter = Router();

statRouter.post("/global", getGroupageStatistics);

module.exports = statRouter;
