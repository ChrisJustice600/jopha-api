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
  if (req?.user?.role !== "User") {
    res.status(403).json({
      message: "Accès refusé",
    });
    return;
  }
  next();
};

module.exports = {
  checkRoleAdmin,
  checkUserRole,
};
