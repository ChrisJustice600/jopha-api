const { verifyToken } = require("../../config/jwtconfig");

const checkUserAuthenticated = (req, res, next) => {
  // console.log("Cookies:", req.cookies);
  // console.log("Headers:", req.headers);

  try {
    // Récupérer le token depuis l'en-tête Authorization (format 'Bearer <token>')
    const { token } = req.cookies; // Récupérer le cookie contenant le token
    if (!token) {
      return res.status(401).json({ loggedIn: false });
    }
    if (!token) {
      return res
        .status(401)
        .json({ error: "Token manquant dans l'en-tête Authorization." });
    }

    // Décoder et vérifier le token
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return res.status(401).json({ error: "Access denied. Token invalide." });
    }

    // Ajouter les informations de l'utilisateur décodé à req.user
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Erreur lors de la vérification du token :", error.message);
    return res
      .status(500)
      .json({ error: "Erreur d'authentification serveur." });
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
