const bcrypt = require("bcrypt");

const salt = bcrypt.genSaltSync(10);

const generateCrypt = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  return passwordHash;
};

module.exports = {
  generateCrypt,
};
