const { Router } = require("express");
const {
  getProfile,
  createProject,
  getAllUserProjects,
  findProjectWithId,
} = require("../controllers/users");
const { checkUserRole } = require("../middlewares/checkUserRole");
const {
  checkUserAuthenticated,
} = require("../middlewares/checkUserAuthenticated");
const path = require("path");
const multer = require("multer");
const upload = multer({
  dest: "uploads/", // Set your upload destination directory
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"]; // Allowed file types
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
usersRouter.get("/profile", checkUserAuthenticated, getProfile);
usersRouter.post("/create/project", upload.single("file"), createProject);
usersRouter.get("/v/project", getAllUserProjects);
usersRouter.get("/v/project/:id", findProjectWithId);

module.exports = usersRouter;
