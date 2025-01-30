const express = require('express');
const { createOrder, updateOrderPayment, getUserOrders, paymentStripe, getAllOrders, getOrderById, getLastOrder, createPaypalOrder, capturePaypalOrder } = require('../controllers/order.controller');
const { requireSignin, isAuth, userById, isAdmin } = require('../middlewares/auth.middleware');
const router = express.Router();

// Créer une commande (accessible uniquement aux utilisateurs authentifiés)
router.post('/create', requireSignin, isAuth, createOrder);

// Obtenir toutes les commandes (réservé aux administrateurs)
router.get('/all-orders', requireSignin, isAuth, isAdmin, getAllOrders);

// Mettre à jour le paiement d'une commande
router.put('/:orderId/pay', requireSignin, isAuth, updateOrderPayment);

// Obtenir toutes les commandes d'un utilisateur
router.get('/my-orders', requireSignin, getUserOrders);
// router.get('/my-orders', requireSignin, isAuth, getUserOrders);

router.get('/user-orders', requireSignin, getUserOrders);

// Route pour obtenir la dernière commande d'un utilisateur connecté
router.get('/last-order', requireSignin, isAuth, getLastOrder);

// Route pour les paiements Stripe
router.post('/payments/stripe', requireSignin, paymentStripe);

// Route pour le paiement via Paypal
// router.post('/create-paypal-order', requireSignin, createPaypalOrder);
router.post('/create-paypal-order', createPaypalOrder);

// router.post('/capture-paypal-order', requireSignin, capturePaypalOrder);
router.post('/capture-paypal-order', capturePaypalOrder);

// Obtenir une commande par son ID
router.get('/:orderId', requireSignin, isAuth, isAdmin, getOrderById);


// Obtenir les commandes de l'utilisateur connecté
// router.get('/my-orders', requireSignin, isAuth, getUserOrders);

// Middleware paramétrique pour `userId`
router.param('userId', userById);

module.exports = router;