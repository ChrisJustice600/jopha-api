// controllers/invoiceController.ts
const {
  calculateTotalCost,
  calculateItemCost,
} = require("../../config/billing");
const { prisma } = require("../../database/prisma");
const { billingRates } = require("../../config/billingRates");

const createInvoice = async (req, res) => {
  try {
    const { items, clientInfo, isProforma } = req.body;

    // Extraire les IDs des objets dans `items`
    const colisIds = items.map((item) => item.id);
    console.log(colisIds);

    const discount = items[0].discount;
    // const { isProforma, clientInfo, colisIds, discount } = req.body;
    // console.log(discount);

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
    console.log("validation colis: ", colis);

    if (colis.length !== colisIds.length) {
      return res
        .status(404)
        .json({ error: "Un ou plusieurs colis introuvables." });
    }

    // // Vérification des statuts des colis
    // if (isProforma) {
    //   const invalidStatus = colis.some(
    //     (c) => c.status === "ARRIVED" || c.status === "DELIVERED"
    //   );
    //   if (invalidStatus) {
    //     return res.status(400).json({
    //       error: "Les colis ARRIVED/DELIVERED ne peuvent pas être en proforma.",
    //     });
    //   }
    // } else {
    //   const invalidStatus = colis.some((c) => c.status !== "ARRIVED");
    //   if (invalidStatus) {
    //     return res.status(400).json({
    //       error: "Tous les colis doivent être ARRIVED pour une facture finale.",
    //     });
    //   }
    // }

    // Calcul du montant total sans réduction
    const totalAmountWithoutDiscount = calculateTotalCost(colis);
    console.log("total:", totalAmountWithoutDiscount);

    // Application de la réduction uniquement pour les factures finales
    const totalAmount = isProforma
      ? totalAmountWithoutDiscount
      : totalAmountWithoutDiscount * (1 - (discount || 0) / 100);

    // Création transactionnelle de la facture
    const invoice = await prisma.$transaction(async (tx) => {
      // Création de la facture
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: `FACT-JOPHA-${Date.now()}`,
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
    console.log("Retour facture: ", invoice);

    // Réponse avec les données nécessaires pour la génération du PDF
    res.status(201).json({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      isProforma: invoice.isProforma,
      totalAmount: invoice.totalAmount,
      discount: invoice.discount,
      clientInfo: {
        fullName: invoice.client.fullName,
        address: invoice.client.address,
        phone: invoice.client.phone,
        email: invoice.client.email,
      },
      items: invoice.items.map((item) => {
        const colis = item.colis;
        let billingRate = null;

        if (colis.transportType === "AERIEN") {
          const rates = billingRates.air[colis.itemType];
          billingRate = {
            rateType: rates.billingType,
            unitPrice:
              colis.airType === "EXPRESS" ? rates.express : rates.regular,
            total: calculateItemCost(colis),
          };
        } else {
          const volume = colis.volume;
          const range = billingRates.maritime.ranges.find(
            (r) => volume >= r.min && (!r.max || volume < r.max)
          );
          billingRate = {
            rateType: "volume",
            unitPrice: range.rate,
            total: calculateItemCost(colis),
          };
        }

        return {
          ...colis,
          appliedStatus: item.appliedStatus,
          billing: billingRate,
        };
      }),
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

const invoiceHistory = async (req, res) => {
  try {
    // Récupérer toutes les factures avec leurs éléments associés
    const invoices = await prisma.invoice.findMany({
      include: {
        items: {
          include: {
            colis: true, // Inclure les détails du colis
          },
        },
        client: true, // Inclure les détails du client
        history: true, // Inclure l'historique des modifications
      },
      orderBy: {
        createdAt: "desc", // Trier par date de création décroissante
      },
    });

    console.log("invoiceshis:", invoices);

    // Formater la réponse pour correspondre au format de createInvoice
    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      isProforma: invoice.isProforma,
      totalAmount: invoice.totalAmount,
      discount: invoice.discount,
      clientInfo: {
        fullName: invoice.client.fullName,
        address: invoice.client.address,
        phone: invoice.client.phone,
        email: invoice.client.email,
      },
      items: invoice.items.map((item) => {
        const colis = item.colis;
        let billingRate = null;

        if (colis.transportType === "AERIEN") {
          const rates = billingRates.air[colis.itemType];
          billingRate = {
            rateType: rates.billingType,
            unitPrice:
              colis.airType === "EXPRESS" ? rates.express : rates.regular,
            total: calculateItemCost(colis),
          };
        } else if (colis.volume != null) {
          const volume = colis.volume;
          const range = billingRates.maritime.ranges.find(
            (r) => volume >= r.min && (!r.max || volume < r.max)
          );
          if (range) {
            billingRate = {
              rateType: "volume",
              unitPrice: range.rate,
              total: calculateItemCost(colis),
            };
          }
        }

        return {
          ...colis,
          appliedStatus: item.appliedStatus,
          billing: billingRate,
        };
      }),
      createdAt: invoice.createdAt,
      history: invoice.history,
    }));

    // Retourner la réponse formatée
    res.status(200).json(formattedInvoices);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'historique des factures :",
      error
    );
    res.status(500).json({
      error: `Échec de la récupération de l'historique des factures : ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`,
    });
  }
};

module.exports = {
  createInvoice,
  invoiceHistory,
};
