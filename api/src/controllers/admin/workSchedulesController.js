const WorkSchedulesService = require('./../../services/admin/workSchedulesService');
const { successResponse, errorResponse } = require("../../utils/response");

exports.getAll = async (req, res) => {
    try {
        const { page: page = 1, page_size: pageSize = 10 } = req.query;
        const result = await WorkSchedulesService.getAll(Number(page || 1), Number(pageSize || 10), req.query);

        return successResponse(res, { meta: result.meta, data: result.data }, 'Get Lists menu successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};
