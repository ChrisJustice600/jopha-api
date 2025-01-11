const express = require("express");
const { updateMasterPackStatus } = require("../controllers/masterPackController");
const router = express.Router();

router.put("/updateMasterPackStatus", updateMasterPackStatus);

module.exports = router; 