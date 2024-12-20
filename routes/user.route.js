const express = require('express');
const { userById, read, update, updatePassword } = require('../controllers/user.controller');
const { requireSignin, isAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Middleware paramétrique pour charger l'utilisateur par ID
router.param('userId', userById);

// Route pour lire le profil utilisateur
router.get('/profile/:userId', requireSignin, isAuth, read);

// Route pour mettre à jour le profil utilisateur
router.put('/profile/:userId', requireSignin, isAuth, update);

// Route pour modifier le mot de passe utilisateur
router.put('/profile/:userId/password', requireSignin, isAuth, updatePassword);


module.exports = router;
