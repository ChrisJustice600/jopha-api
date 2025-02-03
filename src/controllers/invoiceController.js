// controllers/invoiceController.ts
const { calculateTotalCost } = require("../../config/billing");

const createInvoice = async (req, res) => {
  try {
    const { isProforma, clientInfo, colisIds, discount } = req.body;

    // Validation des données
    if (!clientInfo || !colisIds?.length) {
      return res
        .status(400)
        .json({ error: "Les informations client et colis sont requises." });
    }

    // Validation de la réduction
    if (discount && (discount < 0 || discount > 100)) {
      return res.status(400).json({
        error: "La réduction doit être un pourcentage entre 0 et 100.",
      });
    }

    // La réduction ne s'applique qu'aux factures finales
    if (isProforma && discount) {
      return res.status(400).json({
        error:
          "La réduction ne peut pas être appliquée à une facture proforma.",
      });
    }

    // Gestion du client (création ou récupération)
    const client = await prisma.client.upsert({
      where: { phone: clientInfo.phone },
      update: clientInfo,
      create: clientInfo,
    });

    // Récupération des colis avec validation
    const colis = await prisma.colis.findMany({
      where: { id: { in: colisIds } },
    });

    if (colis.length !== colisIds.length) {
      return res
        .status(404)
        .json({ error: "Un ou plusieurs colis introuvables." });
    }

    // Vérification des statuts des colis
    if (isProforma) {
      const invalidStatus = colis.some(
        (c) => c.status === "ARRIVED" || c.status === "DELIVERED"
      );
      if (invalidStatus) {
        return res.status(400).json({
          error: "Les colis ARRIVED/DELIVERED ne peuvent pas être en proforma.",
        });
      }
    } else {
      const invalidStatus = colis.some((c) => c.status !== "ARRIVED");
      if (invalidStatus) {
        return res.status(400).json({
          error: "Tous les colis doivent être ARRIVED pour une facture finale.",
        });
      }
    }

    // Calcul du montant total sans réduction
    const totalAmountWithoutDiscount = calculateTotalCost(colis);

    // Application de la réduction uniquement pour les factures finales
    const totalAmount = isProforma
      ? totalAmountWithoutDiscount
      : totalAmountWithoutDiscount * (1 - (discount || 0) / 100);

    // Création transactionnelle de la facture
    const invoice = await prisma.$transaction(async (tx) => {
      // Création de la facture
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: `INV-${Date.now()}`,
          isProforma,
          totalAmount,
          discount: isProforma ? null : discount || 0, // Enregistrer la réduction uniquement pour les factures finales
          clientId: client.id,
          items: {
            create: colis.map((colis) => ({
              colisId: colis.id,
              appliedStatus: colis.status,
              isFinal: !isProforma,
            })),
          },
          history: {
            create: {
              actionType: "CREATED",
              changedBy: "system",
              details: `Facture ${isProforma ? "proforma" : "finale"} créée.`,
            },
          },
        },
        include: {
          items: {
            include: {
              colis: true, // Inclure les détails du colis
            },
          },
          client: true,
        },
      });

      // Mise à jour des colis pour les factures finales
      if (!isProforma) {
        await Promise.all(
          colis.map(async (colis) => {
            const invoiceItem = invoice.items.find(
              (i) => i.colisId === colis.id
            );

            await tx.colis.update({
              where: { id: colis.id },
              data: {
                status: "DELIVERED",
                deliveredInvoiceItemId: invoiceItem?.id,
              },
            });
          })
        );
      }

      return invoice;
    });

    // Réponse avec les données nécessaires pour la génération du PDF
    res.status(201).json({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      isProforma: invoice.isProforma,
      totalAmount: invoice.totalAmount,
      discount: invoice.discount, // Inclure la réduction dans la réponse
      clientInfo: {
        fullName: invoice.client.fullName,
        address: invoice.client.address,
        phone: invoice.client.phone,
        email: invoice.client.email,
      },
      items: invoice.items.map((item) => ({
        ...item.colis, // Inclure tous les détails du colis
        appliedStatus: item.appliedStatus,
      })),
      createdAt: invoice.createdAt,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la facture :", error);
    res.status(500).json({
      error: `Échec de la création de la facture : ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`,
    });
  }
};

module.exports = {
  createInvoice,
};
