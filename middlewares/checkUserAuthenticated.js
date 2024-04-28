const { verifyToken } = require("../config/jwtconfig");

checkUserAuthenticated = (req, res, next) => {
  const { token } = req.cookies;
  const user = verifyToken(token);
  if (user) {
    req.user = user;
    return next();
  } else {
    res.status(403).json({ err: "Connectez-vous" });
  }
};

module.exports = checkUserAuthenticated;
