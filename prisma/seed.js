const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Démarrage du seed...");

  const groupagesData = [
    {
      code: "0829",
      poids_colis: "150",
      status: "GROUPED",
      transportType: "AERIEN",
      airType: "REGULIER",
      masterPacks: [
        {
          numero: "MP#01",
          poids_colis: "50",
          colis: [
            {
              code: "COL0001",
              nom_complet: "Jean Dupont",
              status: "RECEIVED",
              tracking_code: "TRK0001",
              telephone: "0601020304",
              poids_colis: "10",
              transportType: "AERIEN",
              airType: "EXPRESS",
              createdAt: new Date("2024-01-05T10:30:00Z"),
              updatedAt: new Date("2024-01-10T15:00:00Z"),
            },
          ],
        },
        {
          numero: "MP#02",
          poids_colis: "60",
          colis: [
            {
              code: "COL0003",
              nom_complet: "Paul Morel",
              status: "DELIVERED",
              tracking_code: "TRK0003",
              telephone: "0623040506",
              poids_colis: "20",
              transportType: "MARITIME",
              airType: "REGULIER",
              createdAt: new Date("2024-01-15T09:00:00Z"),
              updatedAt: new Date("2024-01-20T16:30:00Z"),
            },
          ],
        },
        {
          numero: "MP#03",
          poids_colis: "60",
          colis: [
            {
              code: "COL00012",
              nom_complet: "Paul Morel",
              status: "DELIVERED",
              tracking_code: "TRK0003",
              telephone: "0623040506",
              poids_colis: "20",
              transportType: "MARITIME",
              airType: "REGULIER",
              createdAt: new Date("2024-01-15T09:00:00Z"),
              updatedAt: new Date("2024-01-20T16:30:00Z"),
            },
          ],
        },
      ],
    },
    {
      code: "0923",
      poids_colis: "150",
      status: "GROUPED",
      transportType: "AERIEN",
      airType: "REGULIER",
      masterPacks: [
        {
          numero: "MP#01",
          poids_colis: "50",
          colis: [
            {
              code: "CO",
              nom_complet: "Jean Dupont",
              status: "RECEIVED",
              tracking_code: "TRK0001",
              telephone: "0601020304",
              poids_colis: "10",
              transportType: "AERIEN",
              airType: "EXPRESS",
              createdAt: new Date("2024-01-05T10:30:00Z"),
              updatedAt: new Date("2024-01-10T15:00:00Z"),
            },
          ],
        },
        {
          numero: "MP#082",
          poids_colis: "60",
          colis: [
            {
              code: "COL3002",
              nom_complet: "Paul Morel",
              status: "DELIVERED",
              tracking_code: "TRK0003",
              telephone: "0623040506",
              poids_colis: "20",
              transportType: "MARITIME",
              airType: "REGULIER",
              createdAt: new Date("2024-01-15T09:00:00Z"),
              updatedAt: new Date("2024-01-20T16:30:00Z"),
            },
          ],
        },
        {
          numero: "MP#043",
          poids_colis: "60",
          colis: [
            {
              code: "COL0412",
              nom_complet: "Paul Morel",
              status: "DELIVERED",
              tracking_code: "TRK0003",
              telephone: "0623040506",
              poids_colis: "20",
              transportType: "MARITIME",
              airType: "REGULIER",
              createdAt: new Date("2024-01-15T09:00:00Z"),
              updatedAt: new Date("2024-01-20T16:30:00Z"),
            },
          ],
        },
      ],
    },
  ];

  for (const groupage of groupagesData) {
    const existingGroupage = await prisma.groupage.findUnique({
      where: { code: groupage.code },
    });

    if (existingGroupage) {
      // Vérifier si le code est déjà utilisé
      const groupageWithSameCode = await prisma.groupage.findUnique({
        where: { code: groupage.code },
      });

      if (
        groupageWithSameCode &&
        groupageWithSameCode.id !== existingGroupage.id
      ) {
        console.error(
          `Le code ${groupage.code} est déjà utilisé par un autre groupage.`
        );
        continue; // Ignorer la mise à jour
      }

      // Mise à jour si l'entrée existe
      await prisma.masterPack.deleteMany({
        where: { groupageId: existingGroupage.id },
      }); // Supprime les relations existantes

      await prisma.groupage.update({
        where: { code: groupage.code },
        data: {
          poids_colis: groupage.poids_colis,
          status: groupage.status,
          transportType: groupage.transportType,
          airType: groupage.airType,
          masterPacks: {
            create: groupage.masterPacks.map((pack) => ({
              numero: pack.numero,
              poids_colis: pack.poids_colis,
              colis: {
                create: pack.colis,
              },
            })),
          },
        },
      });
      console.log(`Groupage mis à jour : ${groupage.code}`);
    } else {
      // Création si l'entrée n'existe pas
      await prisma.groupage.create({
        data: {
          code: groupage.code,
          poids_colis: groupage.poids_colis,
          status: groupage.status,
          transportType: groupage.transportType,
          airType: groupage.airType,
          masterPacks: {
            create: groupage.masterPacks.map((pack) => ({
              numero: pack.numero,
              poids_colis: pack.poids_colis,
              colis: {
                create: pack.colis,
              },
            })),
          },
        },
      });
      console.log(`Groupage créé : ${groupage.code}`);
    }
  }

  console.log("Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
