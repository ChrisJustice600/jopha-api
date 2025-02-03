// utils/billing.js
const { billingRates } = require("./billingRates");

/**
 * Calcule le coût total des colis, en appliquant une réduction globale uniquement pour les factures finales.
 * @param {Array} items - Les colis à facturer.
 * @param {number} discount - La réduction globale en pourcentage (0 à 100).
 * @param {boolean} isFinal - Indique si la facture est finale.
 * @returns {number} - Le coût total après application de la réduction (si applicable).
 */
function calculateTotalCost(items, discount = 0, isFinal = false) {
  // Calcul du coût total sans réduction
  const totalCostWithoutDiscount = items.reduce((total, item) => {
    try {
      const itemCost = calculateItemCost(item);
      return total + itemCost;
    } catch (error) {
      console.warn(
        `Erreur de calcul pour l'article ${item.code}: ${error.message}`
      );
      return total;
    }
  }, 0);

  // Appliquer la réduction uniquement pour les factures finales
  if (isFinal && discount > 0) {
    return totalCostWithoutDiscount * (1 - discount / 100);
  }

  return totalCostWithoutDiscount;
}

/**
 * Calcule le coût d'un colis en fonction de son type de transport.
 * @param {Object} item - Le colis à calculer.
 * @returns {number} - Le coût du colis.
 */
function calculateItemCost(item) {
  if (item.transportType === "AERIEN") {
    return calculateAirTransportCost(item);
  } else {
    return calculateMaritimeTransportCost(item);
  }
}

/**
 * Calcule le coût d'un colis transporté par voie aérienne.
 * @param {Object} item - Le colis à calculer.
 * @returns {number} - Le coût du colis.
 */
function calculateAirTransportCost(item) {
  const rates = billingRates.air[item.itemType];
  const weight = parseFloat(item.poids_colis);

  if (item.airType === "EXPRESS" && rates.express === null) {
    throw new Error(`${item.itemType} is not allowed in express transport`);
  }

  const rate =
    item.airType === "EXPRESS" ? rates.express ?? rates.regular : rates.regular;

  if (rates.billingType === "weight") {
    return weight * rate;
  } else {
    return rate;
  }
}

/**
 * Calcule le coût d'un colis transporté par voie maritime.
 * @param {Object} item - Le colis à calculer.
 * @returns {number} - Le coût du colis.
 */
function calculateMaritimeTransportCost(item) {
  if (!item.volume) {
    throw new Error("Volume is required for maritime transport");
  }

  const { ranges } = billingRates.maritime;
  const range = ranges.find(
    (r) => item.volume >= r.min && (!r.max || item.volume < r.max)
  );

  if (!range) {
    throw new Error("Invalid volume range");
  }

  return item.volume * range.rate;
}

module.exports = {
  calculateTotalCost,
  calculateItemCost,
};
