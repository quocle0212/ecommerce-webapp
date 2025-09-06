const User = require('../../models/User');
const { successResponse, errorResponse } = require("../../utils/response");

// Get all menus
exports.getListsAdmin = async (req, res) => {
    try {
        const { page = 1, page_size: pageSize = 10, name } = req.query;
        const result = await User.getAll(Number(page || 1), Number(pageSize || 10), name,'ADMIN');
        return successResponse(res, { data: result }, 'Get Info successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};
