const { verifyToken } = require("../../config/jwtconfig");

const checkUserAuthenticated = (req, res, next) => {
  // const { token } = req.cookies;
  const token = req.headers.authorization?.split(" ")[1]; // Récupérer le token depuis les en-têtes

  if (!token) {
    return res.status(401).json({ error: "Authentification requise" });
  }

  try {
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return res.status(401).json({ error: "Token invalide" });
    }
    req.user = decodedToken; // Le token décodé contient les informations de l'utilisateur
    next();
  } catch (error) {
    return res.status(401).json({ error: "Erreur d'authentification" });
  }
};

const checkUserRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: "Accès non autorisé" });
    }
  };
};

module.exports = { checkUserAuthenticated, checkUserRole };
