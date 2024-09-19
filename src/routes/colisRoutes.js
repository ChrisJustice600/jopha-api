const { Router } = require("express");
const colisController = require("../../src/controllers/colisController");
const {
  checkUserAuthenticated,
  checkUserRole,
} = require("../../src/middleware/authMiddleware");

const authRouter = Router();

// authRouter.use(checkUserAuthenticated);

const adminOnly = checkUserRole(["ADMIN"]); // ça marche
const userAndAdmin = checkUserRole(["USER", "ADMIN"]); // ça marche

authRouter.post("/register", userAndAdmin, colisController.createColis);
authRouter.put("/update/:id", userAndAdmin, colisController.updateColis);
authRouter.delete("/delete/:id", adminOnly, colisController.deleteColis);
authRouter.post("/addParcelInGroupage/", colisController.addParcelInGroupage);

// GET PARCEL/COLIS BY GROUPAGE
authRouter.post("/getParcelByGroupage/", colisController.getParcelByGroupage);

// GET PARCEL BY MASTERPACK
authRouter.post(
  "/getColisByMasterPack /",
  colisController.getColisByMasterPack
);

// GET PARCEL BY MASTERPACK
authRouter.post(
  "/getMasterPacksByGroupage  /",
  colisController.getMasterPacksByGroupage
);

authRouter.get("/filtered", colisController.getFilteredColis);

module.exports = authRouter;
