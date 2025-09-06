const express = require('express');
const router = express.Router();
const serviceController = require('../../controllers/user/serviceController');
const auth = require("../../middleware/auth");

router.get('/register', auth, serviceController.getAllServicesRegister);

module.exports = router;
