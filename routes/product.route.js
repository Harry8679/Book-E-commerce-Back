const express = require('express');
const { requireSignin, isAuth, isAdmin, userById } = require('../middlewares/auth.middleware');
const { create, productById, getAllProducts } = require('../controllers/product.controller');
const router = express.Router();

router.post('/create/:userId', requireSignin, isAuth, isAdmin, create);
router.get('/:productId', (req, res) => {
  // Retourne les informations du produit
  req.product.photo = undefined; // Évite d'envoyer les données d'image trop volumineuses
  res.json(req.product);
});

router.get('/', getAllProducts);

// Middleware paramétrique pour userId
router.param('userId', userById);
router.param('productId', productById);

module.exports = router;
