const express = require('express');
const { signup, signin } = require('../controllers/user.controller');
const { userSignupValidator } = require('../validator/index.validator');
const router = express.Router();

router.post('/signup', userSignupValidator, signup);
router.post('/signin', signin);

module.exports = router;