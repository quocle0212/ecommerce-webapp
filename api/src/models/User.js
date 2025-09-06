const db = require('./../config/dbMysql');

const User = {
    tableName: 'users',  // Tên bảng

    columns: {
        id: 'bigint(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY',
        name: 'varchar(255)',
        email: 'varchar(255)',
        email_verified_at: 'timestamp NULL',
        password: 'varchar(255)',
        user_type: "enum('USER', 'ADMIN', 'STAFF', 'SHIPPER') DEFAULT 'USER'",
        phone: 'varchar(255)',
        provider: 'varchar(255) NULL',
        provider_id: 'varchar(255) NULL',
        status: 'tinyint(4) DEFAULT 1',
        avatar: 'varchar(255) NULL',
        remember_token: 'varchar(100) NULL',
        created_at: 'timestamp DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    },

    getAll: async (page = 1, pageSize = 10, name = null, user_type = null, email = null) => {
        const offset = (page - 1) * pageSize;
        let query = `SELECT * FROM ${User.tableName}`;
        let countQuery = `SELECT COUNT(*) as total FROM ${User.tableName}`;
        const queryParams = [];
        const countParams = [];

        const conditions = [];
        if (name) {
            conditions.push('name LIKE ?');
            queryParams.push(`%${name}%`);
            countParams.push(`%${name}%`);
        }
        if (user_type) {
            conditions.push('user_type = ?');
            queryParams.push(user_type);
            countParams.push(user_type);
        }
        if (email) {
            conditions.push('email LIKE ?');
            queryParams.push(`%${email}%`);
            countParams.push(`%${email}%`);
        }

        if (conditions.length > 0) {
            const whereClause = ` WHERE ${conditions.join(' AND ')}`;
            query += whereClause;
            countQuery += whereClause;
        }
		console.log(user_type);
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        queryParams.push(pageSize, offset);

        const [rows] = await db.query(query, queryParams);
        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        return {
            data: rows,
            meta: {
                total,
                perPage: pageSize,
                page_size: pageSize,
                currentPage: page,
                page: page,
                lastPage: Math.ceil(total / pageSize),
                total_page: Math.ceil(total / pageSize),
            }
        };

    },

    // Tạo phương thức findOne để tìm người dùng theo email
    findOne: async (email) => {
        const query = `SELECT * FROM ${User.tableName} WHERE email = ? LIMIT 1`;
        const [rows] = await db.query(query, [email]);
        return rows?.length > 0 ? rows[0] : null;
    },

    // Tạo phương thức create để tạo người dùng mới
    create: async (userData) => {
        const query = `INSERT INTO ${User.tableName} (name, email, password, avatar, phone, status, user_type) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const { name, email, password, avatar, phone, status, user_type } = userData;
        const [result] = await db.query(query, [name, email, password, avatar, phone, status, user_type]);
		if(user_type == 'SHIPPER'){

			// Xây dựng câu lệnh SQL
			const queryUpdate = `UPDATE ${User.tableName} SET code='SHIP000${result.insertId}'
			WHERE id = '${result.insertId}'`;
			const [resultUpdate] = await db.query(queryUpdate);
		 }
        return result.insertId;
    },
    update: async (id, updatedData) => {
        // const fields = Object.keys(updatedData).map(field => `${field} = ?`).join(', ');
        // const values = Object.values(updatedData);
        // const query = `UPDATE ${User.tableName} SET ${fields} WHERE id = ?`;
        // values.push(id);
        // const [result] = await db.query(query, values);
        // return result.affectedRows > 0;
        console.info("===========[] ===========[updatedData] : ",updatedData);
        // Kiểm tra nếu updatedData không có trường nào để cập nhật
        if (!updatedData || Object.keys(updatedData).length === 0) {
            throw new Error('No data provided to update');
        }

        // Tạo danh sách các trường cần cập nhật và giá trị tương ứng
        const fields = Object.keys(updatedData).map(field => `${field} = ?`).join(', ');
        const values = Object.values(updatedData);

		console.log(fields,values);

        // Xây dựng câu lệnh SQL
        const query = `UPDATE ${User.tableName} SET ${fields} WHERE id = ?`;
        values.push(id);

        // Thực hiện câu truy vấn
        const [result] = await db.query(query, values);
        return result.affectedRows > 0;

    },
    delete: async (id) => {
        const query = `DELETE FROM ${User.tableName} WHERE id = ?`;
        const [result] = await db.query(query, [id]);
        return result.affectedRows > 0;
    },
    findOneById: async (id) => {
        const query = `SELECT * FROM ${User.tableName} WHERE id = ? LIMIT 1`;
        const [rows] = await db.query(query, [id]);
        return rows?.length > 0 ? rows[0] : null;
    },

    // Kiểm tra đơn hàng chưa hoàn thành của user
    checkPendingOrders: async (userId) => {
        const query = `
            SELECT COUNT(*) as count
            FROM ec_orders
            WHERE user_id = ?
            AND (status != 'completed' OR payment_status != 'completed')
        `;
        const [rows] = await db.query(query, [userId]);
        const count = rows[0]?.count || 0;

        return {
            hasPendingOrders: count > 0,
            count: count
        };
    },

    // Xóa user và tất cả dữ liệu liên quan
    deleteUserWithRelatedData: async (userId) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const deletedData = {
                orders: 0,
                transactions: 0,
                votes: 0,
                user: 0
            };

            // 1. Xóa votes/reviews của user
            const [voteResult] = await connection.query(
                'DELETE FROM votes WHERE user_id = ?',
                [userId]
            );
            deletedData.votes = voteResult.affectedRows;

            // 2. Lấy danh sách order_id của user để xóa transactions
            const [orderIds] = await connection.query(
                'SELECT id FROM ec_orders WHERE user_id = ?',
                [userId]
            );

            if (orderIds.length > 0) {
                const orderIdList = orderIds.map(order => order.id);

                // 3. Xóa transactions của các orders
                const [transactionResult] = await connection.query(
                    `DELETE FROM ec_transactions WHERE order_id IN (${orderIdList.map(() => '?').join(',')})`,
                    orderIdList
                );
                deletedData.transactions = transactionResult.affectedRows;
            }

            // 4. Xóa orders của user
            const [orderResult] = await connection.query(
                'DELETE FROM ec_orders WHERE user_id = ?',
                [userId]
            );
            deletedData.orders = orderResult.affectedRows;

            // 5. Cuối cùng xóa user
            const [userResult] = await connection.query(
                `DELETE FROM ${User.tableName} WHERE id = ?`,
                [userId]
            );
            deletedData.user = userResult.affectedRows;

            await connection.commit();

            return {
                success: true,
                deletedData: deletedData
            };

        } catch (error) {
            await connection.rollback();
            console.error('Error deleting user with related data:', error);
            return {
                success: false,
                message: error.message
            };
        } finally {
            connection.release();
        }
    },
};

module.exports = User;
