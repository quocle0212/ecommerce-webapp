const express = require('express');
const router = express.Router();
const productController = require('../../controllers/debug/productController');

// Debug endpoint để kiểm tra thông tin sản phẩm và tồn kho
router.get('/stock/:slug', productController.debugProductStock);

module.exports = router;
