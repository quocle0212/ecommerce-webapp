const express = require('express');
const router = express.Router();
const CartController = require('../../controllers/user/cartController');
const auth = require('../../middleware/auth');

router.post('/add', auth, CartController.addToCart);
router.get('/:userId', auth, CartController.getCart);
router.delete('/item/:itemId', auth, CartController.deleteItem);
router.put('/item/:itemId', auth, CartController.updateQuantity);

module.exports = router;