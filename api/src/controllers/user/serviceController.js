const Service = require('../../models/Service');
const ServiceUser = require('../../models/ServiceUser');
const { successResponse, errorResponse } = require("../../utils/response");

exports.getAllServicesRegister = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page, page_size: pageSize, name } = req.query;
        const result = await ServiceUser.getAll(Number(page || 1), Number(pageSize || 10), name, userId);

        return successResponse(res, { meta: result.meta, data: result.data }, 'Get Lists menu successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};