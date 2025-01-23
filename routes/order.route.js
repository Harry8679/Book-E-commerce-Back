const express = require('express');
const { createOrder, updateOrderPayment, getUserOrders } = require('../controllers/order.controller');
const { requireSignin, isAuth, userById } = require('../middlewares/auth.middleware');
const router = express.Router();

// Créer une commande
router.post('/create/:userId', requireSignin, isAuth, createOrder);

// Mettre à jour le paiement d'une commande
router.put('/:orderId/pay/:userId', requireSignin, isAuth, updateOrderPayment);

// Obtenir toutes les commandes d'un utilisateur
router.get('/my-orders/:userId', requireSignin, isAuth, getUserOrders);

// Middleware paramétrique pour `userId`
router.param('userId', userById);

module.exports = router;
