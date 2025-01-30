const express = require('express');
const { requireSignin, isAuth } = require('../middlewares/auth.middleware');
const { createComment, getCommentsByProduct } = require('../controllers/comment.controller');

const router = express.Router();

// Ajouter un commentaire (seulement si l'utilisateur a acheté le produit)
router.post('/product/:productId/comment', requireSignin, createComment);

// Obtenir tous les commentaires d'un produit
router.get('/product/:productId/comments', getCommentsByProduct);

module.exports = router;