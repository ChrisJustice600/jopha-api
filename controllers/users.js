const { verifyToken } = require("../config/jwtconfig");
const fs = require("fs");
const { createRecord, prisma } = require("../database/prisma");

const getProfile = (req, res) => {
  const { token } = req.cookies;
  const isTokenValide = verifyToken(token);
  res.status(200).json(isTokenValide);
};
const getAllUserProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({
      error:
        "Une erreur est survenue lors de la récupération des utilisateurs associés aux projets.",
    });
  }
};

const createProject = async (req, res) => {
  const { token } = req.cookies;

  try {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    console.log(newPath);

    const { token } = req.cookies;
    const isTokenValide = verifyToken(token);
    const { titre, objectif, categorie, content } = req.body;

    try {
      const userProject = await prisma.project.create({
        data: {
          titre,
          description: content,
          photo: newPath,
          objectif,
          categorie,
          userId: isTokenValide.id,
        },
      });
      res.status(200).json(userProject);
    } catch (error) {
      console.error(`Error creating record in ${modelName}:`, error);
      return null;
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
};

module.exports = { getProfile, createProject, getAllUserProjects };
