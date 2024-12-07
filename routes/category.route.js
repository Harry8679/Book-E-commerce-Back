const express = require('express');
const { create } = require('../controllers/category.controller');
const router = express.Router();

router.post('/create', create);