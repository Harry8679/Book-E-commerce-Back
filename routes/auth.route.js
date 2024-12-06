const express = require('express');
const { signup, signin, signout, profile } = require('../controllers/auth.controller');
const { requireSignin, userById } = require('../middlewares/auth.middleware'); // Import du middleware
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/signout', signout);

// Exemple de route protégée
router.get('/protected', requireSignin, (req, res) => {
  return res.json({ message: 'This route is protected' });
});

// Route pour obtenir le profil de l'utilisateur
router.get('/secret/:userId', profile);

// Middleware paramétrique pour récupérer un utilisateur par ID
router.param('userId', userById);

module.exports = router;
