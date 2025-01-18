const bcrypt = require("bcrypt");
const hashPassword = async (password) => {
  const saltRounds = 12; // Recommended cost factor as of 2023
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    // Handle hashing errors (e.g., logging the error)
    throw new Error("Password hashing failed");
  }
};

const comparePasswords = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePasswords,
};
