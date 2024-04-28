const { verifyToken } = require("../config/jwtconfig");

checkRoleAdmin = (req, res, next) => {
  if (req?.user?.role !== "Admin") {
    res.status(403).json({
      message: "Accès refusé",
    });
    return;
  }
  next();
};

checkUserRole = (req, res, next) => {
  const { token } = req.cookies;
  const isTokenValide = verifyToken(token);
  // res.json(isTokenValide.role);
  console.log(isTokenValide.role);
  if (isTokenValide.role === "USER") {
    return next();
  } else {
    res.status(403).json({ err: "Accès refusé" });
  }
};

module.exports = {
  checkRoleAdmin,
  checkUserRole,
};
