const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = {
    username: user.firstname,
    email: user.email,
    id: user.id,
    role: user.role,
  };

  // Generate token with secret key and expiration time (48 hours)
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: Date.now() + 48 * 60 * 60 * 1000,
  });
};

const verifyToken = (token) => {
  try {
    // Verify token using secret key
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
