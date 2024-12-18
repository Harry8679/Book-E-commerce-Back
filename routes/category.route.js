const express = require('express');
const { create, listCategories, getCategoryById, updateCategory, deleteCategory, categoryById } = require('../controllers/category.controller');
const { requireSignin, isAuth, isAdmin, userById } = require('../middlewares/auth.middleware');
const router = express.Router();

// Middleware paramétrique pour charger l'utilisateur
router.param('userId', userById);

// Middleware paramétrique pour charger une catégorie
router.param('categoryId', categoryById);

// Routes
router.post('/create/:userId', requireSignin, isAuth, isAdmin, create);
router.get('/', listCategories); // Lister toutes les catégories
router.get('/:categoryId', getCategoryById); // Récupérer une catégorie par ID
router.put('/:categoryId/:userId', requireSignin, isAuth, isAdmin, updateCategory); // Modifier une catégorie
router.delete('/:categoryId/:userId', requireSignin, isAuth, isAdmin, deleteCategory); // Supprimer une catégorie

module.exports = router;
