const express = require('express');
const { create } = require('../controllers/category.controller');
const { requireSignin, isAuth, isAdmin } = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/create', requireSignin, isAuth, isAdmin, create);

module.exports = router;