const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  // Générer 2000 utilisateurs
  const users = [];
  const emails = new Set();
  for (let i = 0; i < 2; i++) {
    let email;
    do {
      email = faker.internet.email();
    } while (emails.has(email));
    emails.add(email);

    users.push({
      email,
      password: faker.internet.password(),
      role: faker.helpers.arrayElement(["USER", "ADMIN"]),
    });
  }

  await prisma.user.createMany({
    data: users,
  });

  // Générer 2000 groupages
  const groupages = [];
  for (let i = 0; i < 2000; i++) {
    groupages.push({
      code: faker.string.alphanumeric(10),
      status: faker.helpers.arrayElement([
        "RECEIVED",
        "GROUPED",
        "IN_TRANSIT",
        "ARRIVED",
        "DELIVERED",
      ]),
      transportType: faker.helpers.arrayElement(["AERIEN", "MARITIME"]),
      airType: faker.helpers.arrayElement(["REGULIER", "EXPRESS"]),
    });
  }

  await prisma.groupage.createMany({
    data: groupages,
  });

  // Générer 2000 clients avec code
  const clientsAvecCode = [];
  for (let i = 0; i < 2000; i++) {
    clientsAvecCode.push({
      code: faker.string.alphanumeric(10),
      nomAgence: faker.company.name(),
    });
  }

  await prisma.clientAvecCode.createMany({
    data: clientsAvecCode,
  });

  // Générer 2000 master packs
  const masterPacks = [];
  for (let i = 0; i < 2000; i++) {
    masterPacks.push({
      numero: faker.string.alphanumeric(10),
      poids: faker.number.int({ min: 1, max: 100 }),
      groupageId: faker.number.int({ min: 1, max: 2000 }), // Assurez-vous que les IDs de groupage existent
      isColisMasterPack: true, // Tous les MasterPacks seront des ColisMasterPacks
    });
  }

  await prisma.masterPack.createMany({
    data: masterPacks,
  });

  // Récupérer tous les IDs des MasterPacks créés
  const allMasterPackIds = await prisma.masterPack.findMany({
    select: { id: true },
    where: { isColisMasterPack: true },
  });

  // Générer 2000 colis master packs
  const colisMasterPacks = [];
  for (let i = 0; i < allMasterPackIds.length; i++) {
    colisMasterPacks.push({
      code: faker.string.alphanumeric(10),
      nom_complet: faker.person.fullName(),
      status: faker.helpers.arrayElement([
        "RECEIVED",
        "GROUPED",
        "IN_TRANSIT",
        "ARRIVED",
        "DELIVERED",
      ]),
      telephone: faker.phone.number(),
      transportType: faker.helpers.arrayElement(["AERIEN", "MARITIME"]),
      airType: faker.helpers.arrayElement(["REGULIER", "EXPRESS"]),
      clientAvecCodeId: faker.number.int({ min: 1, max: 2000 }),
      masterPackId: allMasterPackIds[i].id, // Utilisez .id pour obtenir l'entier
    });
  }

  // Insérer les ColisMasterPacks par lots pour éviter les problèmes de taille de requête
  for (let i = 0; i < colisMasterPacks.length; i += 100) {
    const batch = colisMasterPacks.slice(i, i + 100);
    await prisma.colisMasterPack.createMany({
      data: batch,
    });
  }

  // Générer 2000 colis
  const colis = [];
  for (let i = 0; i < 2000; i++) {
    colis.push({
      code: faker.string.alphanumeric(10),
      nom_complet: faker.person.fullName(),
      status: faker.helpers.arrayElement([
        "RECEIVED",
        "GROUPED",
        "IN_TRANSIT",
        "ARRIVED",
        "DELIVERED",
      ]),
      tracking_code: faker.string.alphanumeric(10),
      poids: faker.number.int({ min: 1, max: 100 }),
      telephone: faker.phone.number(),
      groupageId: faker.number.int({ min: 1, max: 2000 }), // Assurez-vous que les IDs de groupage existent
      masterPackId: faker.number.int({ min: 1, max: 2000 }), // Assurez-vous que les IDs de masterPack existent
      transportType: faker.helpers.arrayElement(["AERIEN", "MARITIME"]),
      airType: faker.helpers.arrayElement(["REGULIER", "EXPRESS"]),
      clientAvecCodeId: faker.number.int({ min: 1, max: 2000 }), // Assurez-vous que les IDs de clientAvecCode existent
    });
  }

  await prisma.colis.createMany({
    data: colis,
  });

  // Générer 2000 notes
  const notes = [];
  const userCount = await prisma.user.count();
  const colisCount = await prisma.colis.count();
  const groupageCount = await prisma.groupage.count();
  const colisMasterPackCount = await prisma.colisMasterPack.count();

  for (let i = 0; i < 2000; i++) {
    notes.push({
      contenu: faker.lorem.sentence(),
      userId: faker.number.int({ min: 1, max: userCount }),
      colisId: faker.datatype.boolean()
        ? faker.number.int({ min: 1, max: colisCount })
        : null,
      groupageId: faker.datatype.boolean()
        ? faker.number.int({ min: 1, max: groupageCount })
        : null,
      colisMasterPackId: faker.datatype.boolean()
        ? faker.number.int({ min: 1, max: colisMasterPackCount })
        : null,
    });
  }

  for (let i = 0; i < notes.length; i += 100) {
    const batch = notes.slice(i, i + 100);
    await prisma.note.createMany({
      data: batch,
    });
  }

  console.log("Données générées avec succès");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
