const express = require('express');
const { requireSignin, isAuth, isAdmin, userById } = require('../middlewares/auth.middleware');
const { create, productById, getAllProducts, getProductById, deleteProduct, updateProduct, list, listRelated, listCategories, listBySearch, getPicture, getAllProductsWithPagination } = require('../controllers/product.controller');
const router = express.Router();

router.post('/create/:userId', requireSignin, isAuth, isAdmin, create);
router.get('/categories', listCategories);
router.get('/all', getAllProducts);
// router.get('/all-paginator', getAllProductsWithPagination);
router.get('/all/paginated', getAllProductsWithPagination);
router.get('/:productId', getProductById);
// router.delete('/:productId/:userId', deleteProduct);
router.delete('/:productId/:userId', requireSignin, isAuth, isAdmin, deleteProduct);
router.put('/:productId/:userId', requireSignin, isAuth, isAdmin, updateProduct);
// router.get('/', getAllProducts);
router.get('/', list);
// router.get('/all-products', list);
router.get('/related/:productId', listRelated);
router.post("/by/search", listBySearch);

router.get('/photo/:productId', getPicture);

/*
async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select('photo');
    if (!product || !product.photo || !product.photo.data) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.set('Content-Type', product.photo.contentType);
    return res.send(product.photo.data);
  } catch (err) {
    console.error('Error fetching photo:', err);
    res.status(500).json({ error: 'Could not fetch photo' });
  }
}
*/


// Middleware paramétrique pour userId
router.param('userId', userById);
router.param('productId', productById);

module.exports = router;
