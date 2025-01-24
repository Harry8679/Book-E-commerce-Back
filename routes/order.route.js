const express = require('express');
const { createOrder, updateOrderPayment, getUserOrders, paymentStripe, getAllOrders } = require('../controllers/order.controller');
const { requireSignin, isAuth, userById } = require('../middlewares/auth.middleware');
const router = express.Router();

// Créer une commande (accessible uniquement aux utilisateurs authentifiés)
router.post('/create', requireSignin, isAuth, createOrder);

// Obtenir toutes les commandes (réservé aux administrateurs)
router.get('/all-orders', requireSignin, isAuth, isAdmin, getAllOrders);

// Mettre à jour le paiement d'une commande
router.put('/:orderId/pay', requireSignin, isAuth, updateOrderPayment);

// Obtenir toutes les commandes d'un utilisateur
router.get('/my-orders', requireSignin, isAuth, getUserOrders);

// Route pour les paiements Stripe
router.post('/payments/stripe', requireSignin, isAuth, paymentStripe);

// Middleware paramétrique pour `userId`
router.param('userId', userById);

module.exports = router;