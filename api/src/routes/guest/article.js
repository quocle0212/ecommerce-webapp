const express = require('express');
const router = express.Router();
const articleController = require('../../controllers/guest/articleController');

// Lấy danh sách bài viết cho guest
router.get('/', articleController.getAll);

// Lấy chi tiết bài viết theo ID
router.get('/show/:id', articleController.getById);

// Lấy chi tiết bài viết theo slug
router.get('/show-slug/:slug', articleController.getBySlug);

module.exports = router;
