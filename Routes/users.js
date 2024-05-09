const { Router } = require("express");
const { getProfile, createProject } = require("../controllers/users");
const { checkUserRole } = require("../middlewares/checkUserRole");
const {
  checkUserAuthenticated,
} = require("../middlewares/checkUserAuthenticated");
const path = require("path");

const multer = require("multer");
const upload = multer({
  dest: "uploads/", // Set your upload destination directory
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png"]; // Allowed file types
    const extname = path.extname(file.originalname);
    if (allowedExtensions.includes(extname)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
});

const usersRouter = Router();

// Pour accéder aux infos de profile on vérifie si le user est authentifié et si il a le rôle USER
usersRouter.get("/profile", checkUserAuthenticated, checkUserRole, getProfile);
usersRouter.post(
  "/create/project",
  // checkUserAuthenticated,
  // checkUserRole,
  upload.single("file"),
  createProject
);

module.exports = usersRouter;
