const express = require('express');
const { create } = require('../controllers/category.controller');
const { requireSignin, isAuth, isAdmin, userById } = require('../middlewares/auth.middleware');
const router = express.Router();

router.param('userId', userById);

router.post('/create/:userId', requireSignin, isAuth, isAdmin, create);

module.exports = router;
