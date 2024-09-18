const express = require("express");
const authRoutes = require("./authRoutes");
const colisRoutes = require("./colisRoutes");
const groupageRoutes = require("./groupageRoutes");
const clientCodeRoutes = require("./clientCodeRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/colis", colisRoutes);
router.use("/groupages", groupageRoutes);
router.use("/client", clientCodeRoutes);

module.exports = router;
