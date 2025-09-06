const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboardController');
const auth = require('../../middleware/auth');

router.get('/', auth, dashboardController.getDashboard);
router.get('/fetch-monthly-revenue', auth, dashboardController.fetchMonthlyRevenue);
router.get('/fetch-daily-revenue', auth, dashboardController.fetchDailyRevenue);
router.get('/fetch-user-news', auth, dashboardController.fetchNewMembers);
router.get('/fetch-order-news', auth, dashboardController.fetchNewOrders);

module.exports = router;
