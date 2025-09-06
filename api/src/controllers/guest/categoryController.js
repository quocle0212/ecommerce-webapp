const Category = require('../../models/Category');
const formatResponse = require("../../utils/response");
const {successResponse, errorResponse} = require("../../utils/response");

// Lấy danh sách category
exports.getAllCategories = async (req, res) => {
    try {
        const { page =  1, page_size: pageSize = 10, name } = req.query;
        const result = await Category.getAll(Number(page || 1), Number(pageSize || 10), name);

        return successResponse(res, { meta: result.meta, data: result.data });
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};

// Lấy chi tiết category theo ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('createdBy', 'name');
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(formatResponse('success', { category }, 'Get category successfully'));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findBySlug(req.params.slug)
            .populate('createdBy', 'name');
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(formatResponse('success', { category }, 'Get category successfully'));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
