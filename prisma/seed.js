const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const itemTypes = [
    "ORDINAIRE",
    "ELECTRONIQUE",
    "COSMETIQUE",
    "PHARMACEUTIQUE",
    "BIJOUX",
    "CABELLO",
    "TELEPHONE",
  ];
  const transportTypes = ["AERIEN", "MARITIME"];
  const airTransportTypes = ["REGULIER", "EXPRESS"];

  for (let i = 0; i < 100; i++) {
    const randomItemType = faker.helpers.arrayElement(itemTypes);
    const randomTransportType = faker.helpers.arrayElement(transportTypes);
    const randomAirTransportType =
      faker.helpers.arrayElement(airTransportTypes);

    await prisma.colis.create({
      data: {
        // code: faker.string.uuid(8), // Utilisation de faker.string.uuid() pour Faker.js moderne
        nom_complet: faker.person.fullName(),
        status: "RECEIVED",
        tracking_code: faker.string.alphanumeric(10), // Génère un code alphanumérique
        telephone: faker.phone.number("+243 ## ### ####"),
        poids_colis: faker.number
          .float({ min: 0.5, max: 30, precision: 0.01 })
          .toFixed(2),
        itemType: randomItemType,
        transportType: randomTransportType,
        airType:
          randomTransportType === "AERIEN" ? randomAirTransportType : null,
        createdAt: faker.date.between({
          from: "2025-01-01T00:00:00.000Z",
          to: "2025-02-12T23:59:59.999Z",
        }),
        updatedAt: new Date(),
      },
    });
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
