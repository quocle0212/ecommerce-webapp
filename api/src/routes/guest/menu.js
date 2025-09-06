const express = require('express');
const router = express.Router();
const menuController = require('../../controllers/guest/menuController');

// Lấy danh sách menu cho guest
router.get('/', menuController.getAll);

// Lấy chi tiết menu theo ID
router.get('/show/:id', menuController.getById);

module.exports = router;
