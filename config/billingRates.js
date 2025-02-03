const billingRates = {
  air: {
    ORDINAIRE: {
      regular: 15,
      express: 20,
      billingType: "weight",
    },
    ELECTRONIQUE: {
      regular: 35,
      express: null, // Not allowed in express
      billingType: "weight",
    },
    COSMETIQUE: {
      regular: 25,
      express: 25,
      billingType: "weight",
    },
    PHARMACEUTIQUE: {
      regular: 25,
      express: 25,
      billingType: "weight",
    },
    BIJOUX: {
      regular: 35,
      express: 35,
      billingType: "piece",
    },
    CABELLO: {
      regular: 25,
      express: 25,
      billingType: "weight",
    },
    TELEPHONE: {
      regular: 35,
      express: 35,
      billingType: "weight",
    },
    ALIMENTAIRE: {
      // Ajout du type manquant
      regular: 25,
      express: 25,
      billingType: "weight",
    },
  },
  maritime: {
    ranges: [
      { min: 1, max: 5, rate: 600 },
      { min: 5, max: 15, rate: 550 },
      { min: 15, max: null, rate: 500 },
    ],
  },
};

module.exports = { billingRates };
