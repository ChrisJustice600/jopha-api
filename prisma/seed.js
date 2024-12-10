const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  // Générer 2000 utilisateurs
  const users = [];
  const emails = new Set();
  for (let i = 0; i < 2; i++) {
    let email;
    let username;
    do {
      email = faker.internet.email();
      username = faker.internet.userName();
    } while (emails.has(email));
    emails.add(email);

    users.push({
      email,
      password: faker.internet.password(),
      username,
      role: faker.helpers.arrayElement(["USER", "ADMIN"]),
    });
  }

  await prisma.user.createMany({
    data: users,
  });

  // Générer 20 groupages
  const groupages = [];
  for (let i = 0; i < 20; i++) {
    groupages.push({
      code: faker.string.alphanumeric(10),
      poids_colis: faker.number.int({ min: 1, max: 100 }).toString(), // Ajout de poids_colis
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

  // Générer 7 clients avec code
  const clientsAvecCode = [];
  for (let i = 0; i < 7; i++) {
    clientsAvecCode.push({
      code: faker.string.alphanumeric(10),
    });
  }

  await prisma.clientAvecCode.createMany({
    data: clientsAvecCode,
  });

  // Récupérer tous les IDs des groupages créés
  const allGroupageIds = await prisma.groupage.findMany({
    select: { id: true },
  });

  // Générer 200 master packs
  const masterPacks = [];
  for (let i = 0; i < 200; i++) {
    masterPacks.push({
      numero: faker.string.alphanumeric(10),
      poids_colis: faker.number.int({ min: 1, max: 100 }).toString(), // Ajout de poids_colis
      groupageId: faker.helpers.arrayElement(allGroupageIds).id, // Assurez-vous que les IDs de groupage existent
    });
  }

  await prisma.masterPack.createMany({
    data: masterPacks,
  });

  // Récupérer tous les IDs des MasterPacks créés
  const allMasterPackIds = await prisma.masterPack.findMany({
    select: { id: true },
  });

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
      poids_colis: faker.number.int({ min: 1, max: 100 }).toString(), // Ajout de poids_colis
      telephone: faker.phone.number(),
      groupageId: faker.helpers.arrayElement(allGroupageIds).id, // Assurez-vous que les IDs de groupage existent
      masterPackId: faker.helpers.arrayElement(allMasterPackIds).id, // Assurez-vous que les IDs de masterPack existent
      transportType: faker.helpers.arrayElement(["AERIEN", "MARITIME"]),
      airType: faker.helpers.arrayElement(["REGULIER", "EXPRESS"]),
      clientAvecCodeId: faker.number.int({ min: 1, max: 7 }), // Assurez-vous que les IDs de clientAvecCode existent
    });
  }

  await prisma.colis.createMany({
    data: colis,
  });

  // Générer 200 notes
  const notes = [];
  const userCount = await prisma.user.count();
  const colisCount = await prisma.colis.count();
  const groupageCount = await prisma.groupage.count();

  for (let i = 0; i < 200; i++) {
    notes.push({
      contenu: faker.lorem.sentence(),
      userId: faker.number.int({ min: 1, max: userCount }),
      colisId: faker.datatype.boolean()
        ? faker.number.int({ min: 1, max: colisCount })
        : null,
      groupageId: faker.datatype.boolean()
        ? faker.number.int({ min: 1, max: groupageCount })
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
