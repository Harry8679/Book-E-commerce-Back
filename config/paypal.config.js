require('dotenv').config();
const paypal = require('@paypal/checkout-server-sdk');

// Configuration de l'environnement PayPal (sandbox ou live)
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;
