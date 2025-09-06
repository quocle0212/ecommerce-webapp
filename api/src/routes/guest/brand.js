const express = require('express');
const router = express.Router();
const brandController = require('../../controllers/guest/brandController');

// Lấy danh sách sản phẩm
router.get('/', brandController.getAll);

// show brand by id
router.get('/show/:id', brandController.showById);

module.exports = router;
