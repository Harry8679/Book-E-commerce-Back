const express = require('express');
const { requireSignin, isAuth, isAdmin, userById } = require('../middlewares/auth.middleware');
const { create, productById, getAllProducts, getProductById, deleteProduct, updateProduct, list, listRelated } = require('../controllers/product.controller');
const { listCategories } = require('../controllers/category.controller');
const router = express.Router();

router.post('/create/:userId', requireSignin, isAuth, isAdmin, create);
router.get('/:productId', getProductById);
// router.delete('/:productId/:userId', deleteProduct);
router.delete('/:productId/:userId', requireSignin, isAuth, isAdmin, deleteProduct);
router.put('/:productId/:userId', requireSignin, isAuth, isAdmin, updateProduct);
// router.get('/', getAllProducts);
router.get('/', list);
router.get('/related/:productId', listRelated);
router.get('/categories', listCategories);

// Middleware paramétrique pour userId
router.param('userId', userById);
router.param('productId', productById);

module.exports = router;
