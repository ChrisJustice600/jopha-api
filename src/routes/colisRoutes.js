const { Router } = require("express");
const {
  createColis,
  updateColis,
  deleteColis,
  addParcelInGroupage,
  getParcelByGroupage,
  getColisByMasterPack,
  getMasterPacksByGroupage,
} = require("../../src/controllers/colisController");
const checkUserAuthenticated = require("../../src/middleware/authMiddleware");

const authRouter = Router();

authRouter.post("/register", checkUserAuthenticated, createColis);
authRouter.post("/update/:id", checkUserAuthenticated, updateColis);
authRouter.post("/delete/:id", checkUserAuthenticated, deleteColis);
authRouter.post(
  "/addParcelInGroupage/",
  checkUserAuthenticated,
  addParcelInGroupage
);

// GET PARCEL/COLIS BY GROUPAGE
authRouter.post(
  "/getParcelByGroupage/",
  checkUserAuthenticated,
  getParcelByGroupage
);

// GET PARCEL BY MASTERPACK
authRouter.post(
  "/getColisByMasterPack /",
  checkUserAuthenticated,
  getColisByMasterPack
);

// GET PARCEL BY MASTERPACK
authRouter.post(
  "/getMasterPacksByGroupage  /",
  checkUserAuthenticated,
  getMasterPacksByGroupage
);

module.exports = authRouter;
