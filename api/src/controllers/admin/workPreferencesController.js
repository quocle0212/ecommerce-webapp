const axios = require('axios');
const WorkPreferencesService = require('./../../services/admin/WorkPreferencesService');
const { successResponse, errorResponse } = require("../../utils/response");

exports.findByUserId = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await WorkPreferencesService.findByUserId(userId);
        return successResponse(res, { data: data }, 'Successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};


exports.createOrUpdate = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        // Cập nhật menu
        const data = await WorkPreferencesService.createOrUpdate(userId, updateData);
        console.info("===========[] ===========[data] : ",data);
        if(data) {
            axios.get('http://127.0.0.1:5000/generate-schedules')
                .then(response => {
                    console.info('Lịch làm việc được tạo thành công:', response.data);
                })
                .catch(error => {
                    console.error('Lỗi khi gọi API generate-schedules:', error.message);
                });
        }
        return successResponse(res, { data: data }, 'Successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};

