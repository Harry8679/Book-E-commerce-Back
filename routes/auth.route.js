const express = require('express');
const { signup, signin, signout } = require('../controllers/auth.controller');
const { requireSignin } = require('../middlewares/auth.middleware'); // Import du middleware
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/signout', signout);

// Exemple de route protégée
router.get('/protected', requireSignin, (req, res) => {
  return res.json({ message: 'This route is protected' });
});

// Route pour obtenir le profil de l'utilisateur
router.get('/user/:userId', (req, res) => {
  req.profile.salt = undefined; // Masquer le salt pour des raisons de sécurité
  req.profile.hashed_password = undefined; // Masquer le mot de passe hashé
  return res.json(req.profile);
});

// Middleware paramétrique pour récupérer un utilisateur par ID
router.param('userId', userById);

module.exports = router;
