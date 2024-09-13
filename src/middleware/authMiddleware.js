const { verifyToken } = require("../../config/jwtconfig");

checkUserAuthenticated = (req, res, next) => {
  const { token } = req.cookies;
  console.log(token);

  const isTokenValide = verifyToken(token);

  console.log(isTokenValide);

  if (isTokenValide) {
    return next();
  } else {
    res.status(401).json({ err: "Authentification refusé" });
  }
};

module.exports = checkUserAuthenticated;
