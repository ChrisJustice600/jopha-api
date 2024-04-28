const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// const findUserByEmail = async (email) => {
//   const user = await prisma.user.findFirst({
//     where: {
//       email,
//     },
//   });
//   const users = user.email;
//   // const passOk = compareCrypt(password, user.password);
//   if (users) {
//     return res.json({ users });
//   }
// };

async function findUserByEmail(email) {
  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
}

const findUserById = async (id) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
};

module.exports = {
  prisma,
  findUserByEmail,
  findUserById,
};
