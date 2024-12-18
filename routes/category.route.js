const express = require('express');
const { create, listCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { requireSignin, isAuth, isAdmin, userById } = require('../middlewares/auth.middleware');
const router = express.Router();

// Middleware paramétrique pour charger l'utilisateur
router.param('userId', userById);

// Middleware paramétrique pour charger une catégorie
router.param('categoryId', async (req, res, next, id) => {
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    req.category = category; // Attache la catégorie à la requête
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Error fetching the category' });
  }
});

// Routes
router.post('/create/:userId', requireSignin, isAuth, isAdmin, create);
router.get('/', listCategories); // Lister toutes les catégories
router.get('/:categoryId', getCategoryById); // Récupérer une catégorie par ID
router.put('/:categoryId/:userId', requireSignin, isAuth, isAdmin, updateCategory); // Modifier une catégorie
router.delete('/:categoryId/:userId', requireSignin, isAuth, isAdmin, deleteCategory); // Supprimer une catégorie

module.exports = router;
