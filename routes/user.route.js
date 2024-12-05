const express = require('express');
const { signup } = require('../controllers/user.controller');
const { userSignupValidator } = require('../validator/index.validator');
const router = express.Router();

router.post('/signup', userSignupValidator, signup);

module.exports = router;