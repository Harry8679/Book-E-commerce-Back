const express = require('express');
const { createOrder, updateOrderPayment, getUserOrders } = require('../controllers/order.controller');
const { requireSignin, isAuth, isAdmin, userById } = require('../middlewares/auth.middleware');
const { orderById } = require('../middlewares/order.middleware'); // Middleware pour obtenir une commande par ID
const router = express.Router();

// Créer une commande (accessible uniquement aux utilisateurs authentifiés)
router.post('/create/:userId', requireSignin, isAuth, createOrder);

// Mettre à jour le paiement d'une commande (accessible uniquement aux utilisateurs authentifiés)
router.put('/:orderId/pay/:userId', requireSignin, isAuth, updateOrderPayment);

// Obtenir toutes les commandes d'un utilisateur (accessible uniquement aux utilisateurs authentifiés)
router.get('/my-orders/:userId', requireSignin, isAuth, getUserOrders);

// Middleware paramétrique pour `userId`
router.param('userId', userById);

// Middleware paramétrique pour `orderId`
router.param('orderId', orderById);

module.exports = router;
