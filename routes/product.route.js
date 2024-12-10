const express = require('express');
const { requireSignin, isAuth, isAdmin } = require('../middlewares/auth.middleware');
const { create } = require('../controllers/product.controller');
const router = express.Router();

router.post('/create/:userId', requireSignin, isAdmin, create);

module.exports = router;