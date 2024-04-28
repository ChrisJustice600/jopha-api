const { generateToken } = require("../config/jwtconfig");

const generateTokenHauth = async (req, res, next) => {
  const { email } = req.body;
  const user = await findUserByEmail(email);

  const token = generateToken(user);
  res.status(200).json({ token });

};

module.exports = generateTokenHauth;
