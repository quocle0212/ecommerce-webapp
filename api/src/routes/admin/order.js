const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/orderController');
const auth = require('../../middleware/auth');

router.get('/', auth, orderController.getAll);
router.get('/:id', auth, orderController.getById);
router.post('/', auth, orderController.create);
router.post('/sendmail/:id', auth, orderController.sendMail);
router.put('/:id', auth, orderController.update);
router.post('/update-status/:id', auth, orderController.updateStatus);
router.delete('/:id', auth, orderController.delete);

module.exports = router;
