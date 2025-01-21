const { Router } = require("express");
// const { getGroupageStatistics } = require("../controllers/statController");
const statController = require("../controllers/statController");

const statRouter = Router();

statRouter.get("/global/:groupageCode", statController.getGroupageStatistics);

module.exports = statRouter;
