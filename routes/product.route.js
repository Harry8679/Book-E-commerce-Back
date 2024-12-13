const express = require('express');
const { requireSignin, isAuth, isAdmin, userById } = require('../middlewares/auth.middleware');
const { create, productById, getAllProducts } = require('../controllers/product.controller');
const router = express.Router();

router.post('/create/:userId', requireSignin, isAuth, isAdmin, create);
router.get('/', getAllProducts);

// Middleware paramétrique pour userId
router.param('userId', userById);
router.param('productId', productById);

module.exports = router;
