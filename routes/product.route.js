const express = require('express');
const { requireSignin, isAuth, isAdmin, userById } = require('../middlewares/auth.middleware');
const { create, productById, getAllProducts } = require('../controllers/product.controller');
const router = express.Router();

router.post('/create/:userId', requireSignin, isAuth, isAdmin, create);
router.get('/:productId', (req, res) => {
  try {
    // Évite d'envoyer les données d'image volumineuses
    req.product.photo = undefined;

    // Retourne les informations du produit
    res.json(req.product);
  } catch (err) {
    console.error('Error retrieving product:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});


router.get('/', getAllProducts);

// Middleware paramétrique pour userId
router.param('userId', userById);
router.param('productId', productById);

module.exports = router;
