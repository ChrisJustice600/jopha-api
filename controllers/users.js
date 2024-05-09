const { verifyToken } = require("../config/jwtconfig");
const fs = require("fs");
const { createRecord, prisma } = require("../database/prisma");

const getProfile = (req, res) => {
  const { token } = req.cookies;
  const isTokenValide = verifyToken(token);
  res.status(200).json(isTokenValide);
};

const createProject = async (req, res) => {
  const { token } = req.cookies;

  try {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    console.log(newPath);
    // Optional: Perform file operations or store newPath in database
    // fs.renameSync(path, newPath); // This line can be used to rename the file
    const { token } = req.cookies;
    const isTokenValide = verifyToken(token);
    const { titre, objectif, categorie, content } = req.body;

    const user = await prisma.project.create({
      data: {
        titre,
        description: content,
        photo: newPath,
        objectif,
        categorie,
        userId: isTokenValide.id,
      },
    });
    console.log(user);
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
};

module.exports = { getProfile, createProject };
