const express = require('express');
const { signup, signin, signout } = require('../controllers/user.controller');
const { userSignupValidator } = require('../validator/index.validator');
const router = express.Router();

router.post('/signup', userSignupValidator, signup);
router.post('/signin', signin);
router.get('/signout', signout);

module.exports = router;