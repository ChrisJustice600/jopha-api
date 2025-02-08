const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const colisRoutes = require("./colisRoutes");
const groupageRoutes = require("./groupageRoutes");
const clientCodeRoutes = require("./clientCodeRoutes");
const masterPackRoutes = require("./masterPackRoutes");
const statRoutes = require("./statRoutes");
const invoiceRoutes = require("./invoiceRoutes");
const expenseRoutes = require("./expenseRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/colis", colisRoutes);
router.use("/mp", masterPackRoutes);
router.use("/groupages", groupageRoutes);
router.use("/statistics", statRoutes);
router.use("/client", clientCodeRoutes);
router.use("/invoice", invoiceRoutes);
router.use("/expense", expenseRoutes);

module.exports = router;
