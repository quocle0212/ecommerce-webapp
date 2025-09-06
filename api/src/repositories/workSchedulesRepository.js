const db = require('../config/dbMysql');

const WorkSchedulesRepository = {
    tableName: 'work_schedules',
    getAll: async (offset, pageSize, params = {}) => {
        let query = `
            SELECT ws.*, u.name AS user_name, u.email AS user_email , u.phone AS user_phone, u.avatar AS user_avatar
            FROM ${WorkSchedulesRepository.tableName} ws
            INNER JOIN users u ON ws.user_id = u.id 
        `;
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM ${WorkSchedulesRepository.tableName} ws
            INNER JOIN users u ON ws.user_id = u.id
        `;
        const queryParams = [];
        const countParams = [];

        let whereClause = ' WHERE 1=1';

        // Lọc theo user_id nếu có
        if (params.user_id) {
            whereClause += ' AND ws.user_id = ?';
            queryParams.push(params.user_id);
            countParams.push(params.user_id);
        }

        if (params.from_date) {
            whereClause += ' AND DATE(ws.work_date) >= ?';
            queryParams.push(params.from_date);
            countParams.push(params.from_date);
        }

        if (params.to_date) {
            whereClause += ' AND DATE(ws.work_date) <= ?';
            queryParams.push(params.to_date);
            countParams.push(params.to_date);
        }


        query += whereClause;
        countQuery += whereClause;

        // Thêm sắp xếp và phân trang
        query += ' ORDER BY ws.id DESC LIMIT ? OFFSET ?';
        queryParams.push(pageSize, offset);

        // Thực thi câu truy vấn
        try {
            const [rows] = await db.query(query, queryParams);
            const [countResult] = await db.query(countQuery, countParams);
            const total = countResult[0].total;

            return { data: rows, total };
        } catch (error) {
            console.error('Error fetching work schedules:', error);
            throw error;
        }
    }
};

module.exports = WorkSchedulesRepository;
