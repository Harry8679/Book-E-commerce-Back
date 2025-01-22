const express = require('express');
const { createOrder, updateOrderPayment, getUserOrders } = require('../controllers/order.controller');
const { isAuthenticated } = require('../middleware/auth.middleware'); // Middleware d'authentification

const router = express.Router();

// Créer une commande
router.post('/create', isAuthenticated, createOrder);

// Mettre à jour le paiement d'une commande
router.put('/:orderId/pay', isAuthenticated, updateOrderPayment);

// Obtenir toutes les commandes de l'utilisateur
router.get('/my-orders', isAuthenticated, getUserOrders);

module.exports = router;
