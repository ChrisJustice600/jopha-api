const { Router } = require("express");
const colisController = require("../../src/controllers/colisController");
const checkUserAuthenticated = require("../../src/middleware/authMiddleware");

const authRouter = Router();
authRouter.use(checkUserAuthenticated);

authRouter.post("/register", colisController.createColis);
authRouter.put("/update/:id", colisController.updateColis);
authRouter.delete("/delete/:id", colisController.deleteColis);
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

module.exports = authRouter;
