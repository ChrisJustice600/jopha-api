const { Router } = require("express");
const colisController = require("../controllers/colisController");
const {
  //checkUserAuthenticated,
  checkUserRole,
} = require("../middleware/authMiddleware");

const authRouter = Router();

// authRouter.use(checkUserAuthenticated);

const adminOnly = checkUserRole(["ADMIN"]); // ça marche
const userAndAdmin = checkUserRole(["USER", "ADMIN"]); // ça marche

authRouter.post("/register", colisController.createColis);
authRouter.get("/getParcelById/:id", colisController.getParcelById);
authRouter.delete("/deleteMasterPack", colisController.deleteMasterPack);
// authRouter.post(
//   "/registercolisMasterPack",
//   userAndAdmin,
//   colisController.createColisMasterPack
// );
authRouter.put("/update/:id", colisController.updateColis);
authRouter.delete("/delete/:id", colisController.deleteColis);
authRouter.delete(
  "/removeParcelFromMasterpack/:masterPackId/:colisId",
  colisController.removeParcelFromMasterPack
);
authRouter.put(
  "/updateParcelInMasterPack/:masterPackId/:colisId",
  colisController.updateParcelInMasterPack
);
authRouter.post(
  "/createNewMasterPackInGroupage",
  colisController.createNewMasterPackInGroupage
);
authRouter.post("/addParcelInGroupage/", colisController.addParcelInGroupage);
authRouter.post(
  "/addParcelToSpecificMasterPack/",
  colisController.addParcelToSpecificMasterPack
);

// GET PARCEL/COLIS BY GROUPAGE
authRouter.post("/getParcelByGroupage/", colisController.getParcelByGroupage);

// GET PARCEL BY MASTERPACK
authRouter.post(
  "/getColisByMasterPack /",
  colisController.getColisByMasterPack
);

// GET PARCEL BY MASTERPACK
authRouter.get(
  "/getMasterPacksByGroupage/:code",
  colisController.getMasterPacksByGroupage
);

authRouter.get("/filtered", colisController.getFilteredColis);

authRouter.get("/getColisByStatus", colisController.getColisByStatus);

authRouter.get("/advanced-search", colisController.getAdvancedFilteredColis);

module.exports = authRouter;
