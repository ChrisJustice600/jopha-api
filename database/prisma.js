const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

async function createRecord(data) {
  try {
    const createdRecord = await prisma.project.create({
      data,
    });
    return createdRecord;
  } catch (error) {
    console.error(`Error creating record in ${modelName}:`, error);
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
