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

/**
 * Met à jour un colis dans la base de données.
 * @param {number} id - L'identifiant du colis à mettre à jour.
 * @param {Object} data - Les données à mettre à jour.
 * @returns {Promise<Object>} - Le colis mis à jour.
 */
const updateRecord = async (id, data) => {
  try {
    const colis = await prisma.colis.update({
      where: {
        id: Number(id), // Assurez-vous que l'ID est un nombre
      },
      data,
    });
    return colis;
  } catch (error) {
    throw new Error(
      "Erreur lors de la modification du colis : " + error.message
    );
  }
};

module.exports = {
  prisma,
  updateRecord,
  createRecord,
  findUserByEmail,
  findUserById,
};
