const { verifyToken } = require("../config/jwtconfig");
const fs = require("fs");
const { createRecord, prisma } = require("../database/prisma");
const cloudinary = require("../config/cloudinary");

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

async function findProjectWithId(req, res) {
  try {
    const id = parseInt(req.params.id);
    console.log(id);
    // Recherche du projet par ID avec l'utilisateur associé inclus
    const projectid = await prisma.project.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    // console.log(projectid);
    res.status(200).json(projectid);
  } catch (error) {
    console.error("Error finding project with user:", error);
    throw error;
  }
}

const createProject = async (req, res) => {
  const { token } = req.cookies;

  try {
    const { path } = req.file;
    const result = await cloudinary.uploader.upload(path);
    const url = result.secure_url;
    console.log(result.secure_url);

    const { token } = req.cookies;
    const isTokenValide = verifyToken(token);
    const { titre, objectif, categorie, content } = req.body;

    try {
      const userProject = await prisma.project.create({
        data: {
          titre,
          description: content,
          photo: url,
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

module.exports = {
  getProfile,
  createProject,
  getAllUserProjects,
  findProjectWithId,
};
