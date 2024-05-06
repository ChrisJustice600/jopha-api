const { verifyToken } = require("../config/jwtconfig");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });

const getProfile = (req, res) => {
  const { token } = req.cookies;
  const isTokenValide = verifyToken(token);
  res.status(200).json(isTokenValide);
};

const createProject = async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);

  const { titreProjet, description, objectif, objectifFinance, statutProjet } =
    req.body;
    
  const { token } = req.cookies;
  const isTokenValide = verifyToken(token);
  const userId = isTokenValide.id;
  const newProject = await prisma.project.create({
    data: {
      titreProjet,
      description,
      photo: newPath,
      objectif,
      objectifFinance,
      statutProjet,
      userId: { connect: { id: userId } },
    },
  });

  res.status(200).json(newProject);
};

module.exports = { getProfile, createProject };
