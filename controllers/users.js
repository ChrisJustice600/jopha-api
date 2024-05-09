const { verifyToken } = require("../config/jwtconfig");
const fs = require("fs");

const getProfile = (req, res) => {
  const { token } = req.cookies;
  const isTokenValide = verifyToken(token);
  res.status(200).json(isTokenValide);
};

const createProject = async (req, res) => {
  // const { originalname, path } = req.file;
  // const parts = originalname.split(".");
  // const ext = parts[parts.length - 1];
  // const newPath = path + "." + ext;
  // fs.renameSync(path, newPath);

  console.log(req.body.titre);
  console.log(req.body.objectif);
  console.log(req.body.categorie);
  console.log(req.body.content);
  try {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    console.log(newPath);
    // Optional: Perform file operations or store newPath in database
    // fs.renameSync(path, newPath); // This line can be used to rename the file

    console.log("Uploaded file:", { originalname, newPath }); // Log details for debugging
    res.json({ message: "File uploaded successfully" }); // Or send appropriate response
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
};

module.exports = { getProfile, createProject };
