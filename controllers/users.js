const { verifyToken } = require("../config/jwtconfig");

const getProfile = (req, res) => {
  const { token } = req.cookies;
  const isTokenValide = verifyToken(token);
  res.status(200).json(isTokenValide);
};

module.exports = { getProfile };
