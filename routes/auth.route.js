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

module.exports = router;
