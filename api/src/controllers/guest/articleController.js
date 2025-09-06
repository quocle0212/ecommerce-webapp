const Article = require('../../models/Post');
const { successResponse, errorResponse } = require("../../utils/response");

// Lấy danh sách bài viết cho guest (chỉ lấy bài viết đã published)
exports.getAll = async (req, res) => {
    try {
        const { page, page_size: pageSize, name, menu_id } = req.query;
        const result = await Article.getAll(
            Number(page || 1),
            Number(pageSize || 12),
            name,
            menu_id,
            'published' // Chỉ lấy bài viết đã published
        );

        return successResponse(res, { meta: result.meta, data: result.data }, 'Get list of articles successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};

// Lấy chi tiết bài viết theo ID
exports.getById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article || article.status !== 'published') {
            return errorResponse(res, 'Article not found', 404, 404);
        }

        // Tăng view count
        await Article.incrementViews(req.params.id);

        return successResponse(res, { data: article }, 'Article found successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};

// Lấy chi tiết bài viết theo slug
exports.getBySlug = async (req, res) => {
    try {
        const article = await Article.findBySlug(req.params.slug);
        if (!article || article.status !== 'published') {
            return errorResponse(res, 'Article not found', 404, 404);
        }

        // Tăng view count
        await Article.incrementViews(article.id);

        return successResponse(res, { data: article }, 'Article found successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};
