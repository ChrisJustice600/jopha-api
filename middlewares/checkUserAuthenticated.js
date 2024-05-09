const { verifyToken } = require("../config/jwtconfig");

checkUserAuthenticated = (req, res, next) => {
  const { token } = req.cookies;
  const isTokenValide = verifyToken(token);
  console.log(isTokenValide);
  if (isTokenValide) {
    return next();
  } else {
    res.status(403).json({ err: "Authentification refusé" });
  }
};

module.exports = {
  checkUserAuthenticated,
};
