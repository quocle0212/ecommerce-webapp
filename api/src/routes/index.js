const express = require('express');
const {check} = require("express-validator");
const authController = require("../controllers/auth/authController");
const auth = require("../middleware/auth");
const router = express.Router();

router.use('/auth', require('./auth/auth'));
router.use('/admin', require('./admin'));
router.use('/user', require('./user'));
router.use('/users', require('./guest/admin'));
router.use('/products', require('./guest/product'));
router.use('/order', require('./user/order'));
router.use('/categories', require('./guest/category'));
router.use('/slides', require('./guest/slide'));
router.use('/service', require('./guest/service'));
router.use('/setting/info', require('./guest/setting'));
router.use('/votes', require('./guest/vote'));
router.use('/brand', require('./guest/brand'));
router.use('/payment-methods', require('./guest/payment_methods'));
router.use('/work-preferences', require('./guest/work_preferences'));
router.use('/posts', require('./guest/article'));
router.use('/menus', require('./guest/menu'));
router.use('/debug', require('./debug/product'));
router.use('/cart', require('./user/cart')); // Them cart route

// router.use('/guest', require('./guest/guest'));
router.get(
    '/me',
    auth,
    authController.me
);
router.put(
    '/me',
    auth,
    authController.updateProfile
);

module.exports = router;
