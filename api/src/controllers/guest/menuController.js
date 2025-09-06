const MenuService = require('../../services/admin/menuService');
const { successResponse, errorResponse } = require("../../utils/response");

// Lấy danh sách menu cho guest
exports.getAll = async (req, res) => {
    try {
        const { page, page_size: pageSize, name } = req.query;
        const result = await MenuService.getAll(
            Number(page || 1), 
            Number(pageSize || 50), 
            name
        );

        return successResponse(res, { meta: result.meta, data: result.data }, 'Get list of menus successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};

// Lấy chi tiết menu theo ID
exports.getById = async (req, res) => {
    try {
        const menu = await MenuService.findById(req.params.id);
        if (!menu) {
            return errorResponse(res, 'Menu not found', 404, 404);
        }

        return successResponse(res, { data: menu }, 'Menu found successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};
