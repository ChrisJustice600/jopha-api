const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  console.log("Début de la génération de données...");

  // **Générer des utilisateurs**
  console.log("Génération des utilisateurs...");
  const users = [];
  const emails = new Set();

  for (let i = 0; i < 200; i++) {
    let email;
    do {
      email = faker.internet.email();
    } while (emails.has(email));
    emails.add(email);

    users.push({
      email,
      password: faker.internet.password(),
      username: faker.internet.userName(),
      role: faker.helpers.arrayElement(["USER", "ADMIN"]),
    });
  }

  await prisma.user.createMany({ data: users });

  // **Générer des groupages**
  console.log("Génération des groupages...");
  const groupages = [];
  for (let i = 0; i < 20; i++) {
    groupages.push({
      code: faker.string.alphanumeric(10),
      poids_colis: faker.number.int({ min: 1, max: 100 }).toString(),
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

  await prisma.groupage.createMany({ data: groupages });

  const allGroupageIds = await prisma.groupage.findMany({
    select: { id: true },
  });

  // **Générer des clients avec code**
  console.log("Génération des clients avec code...");
  const clientsAvecCode = [];
  for (let i = 0; i < 7; i++) {
    clientsAvecCode.push({
      code: faker.string.alphanumeric(10),
    });
  }

  await prisma.clientAvecCode.createMany({ data: clientsAvecCode });

  const allClientAvecCodeIds = await prisma.clientAvecCode.findMany({
    select: { id: true },
  });

  // **Générer des master packs**
  console.log("Génération des master packs...");
  const masterPacks = [];
  for (let i = 0; i < 200; i++) {
    masterPacks.push({
      numero: faker.string.alphanumeric(10),
      poids_colis: faker.number.int({ min: 1, max: 100 }).toString(),
      groupageId: faker.helpers.arrayElement(allGroupageIds).id,
    });
  }

  await prisma.masterPack.createMany({ data: masterPacks });

  const allMasterPackIds = await prisma.masterPack.findMany({
    select: { id: true },
  });

  // **Générer des colis**
  console.log("Génération des colis...");
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
      poids_colis: faker.number.int({ min: 1, max: 100 }).toString(),
      telephone: faker.phone.number(),
      groupageId: faker.datatype.boolean()
        ? faker.helpers.arrayElement(allGroupageIds).id
        : null,
      masterPackId: faker.datatype.boolean()
        ? faker.helpers.arrayElement(allMasterPackIds).id
        : null,
      transportType: faker.helpers.arrayElement(["AERIEN", "MARITIME"]),
      airType: faker.helpers.arrayElement(["REGULIER", "EXPRESS"]),
      clientAvecCodeId: faker.datatype.boolean()
        ? faker.helpers.arrayElement(allClientAvecCodeIds).id
        : null,
    });
  }

  await prisma.colis.createMany({ data: colis });

  const allColisIds = await prisma.colis.findMany({ select: { id: true } });

  // **Générer des notes**
  console.log("Génération des notes...");
  const notes = [];
  const allUserIds = await prisma.user.findMany({ select: { id: true } });

  for (let i = 0; i < 200; i++) {
    notes.push({
      contenu: faker.lorem.sentence(),
      userId: faker.helpers.arrayElement(allUserIds).id,
      colisId: faker.datatype.boolean()
        ? faker.helpers.arrayElement(allColisIds).id
        : null,
      groupageId: faker.datatype.boolean()
        ? faker.helpers.arrayElement(allGroupageIds).id
        : null,
    });
  }

  for (let i = 0; i < notes.length; i += 100) {
    const batch = notes.slice(i, i + 100);
    await prisma.note.createMany({ data: batch });
  }

  console.log("Données générées avec succès !");
}

main()
  .catch((e) => {
    console.error("Erreur lors de la génération des données :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
