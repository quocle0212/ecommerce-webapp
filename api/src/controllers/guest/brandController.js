const Brand = require('../../models/Brand');
const {successResponse, errorResponse, formatResponse} = require("../../utils/response");

exports.getAll = async (req, res) => {
    try {
        const { page =  1, page_size: pageSize = 10, name, page_site = null, product_id } = req.query;
        const result = await Brand.getAll(Number(page || 1), Number(pageSize || 10), product_id, page_site);

        return successResponse(res, { meta: result.meta, data: result.data });
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};

// Lấy chi tiết theo ID
exports.showById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ message: 'brand not found' });
        res.status(200).json(formatResponse('success', { brand }, 'Get brand successfully'));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

