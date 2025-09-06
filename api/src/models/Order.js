const db = require("../config/dbMysql");
const { orderMail } = require( "../services/sendMailService" );

const generateOrderCode = () => {
	const prefix = "OD";
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const codeLength = 10 - prefix.length;
	let randomCode = "";
	for (let i = 0; i < codeLength; i++) {
		randomCode += characters.charAt(
			Math.floor(Math.random() * characters.length)
		);
	}
	return prefix + randomCode;
};

const Order = {
	tableName: "ec_orders",

	columns: {
		id: "bigint(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY",
		user_id: "bigint(20) UNSIGNED",
		payment_method_id: "bigint(20) UNSIGNED",
		code: "varchar(255)",
		total_shipping_fee: "bigint(20)",
		payment_status:
			"enum('pending', 'completed', 'refunding', 'refunded') DEFAULT 'pending'",
		status: "enum('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending'",
		coupon_code: "varchar(255) NULL",
		amount: "decimal(16,2)", //Tổng tiền hàng
		shipping_amount: "decimal(16,2)", //Tiền ship
		tax_amount: "decimal(16,2)", // Tiền thuế
		discount_amount: "decimal(16,2)", //Tiền giảm giá
		sub_total: "decimal(16,2)", //Tổng tiền
		completed_at: "datetime NULL",
		notes: "text NULL",
		meta_data: "longtext NULL",
		shipper_id: "int NULL",
		created_at: "timestamp DEFAULT CURRENT_TIMESTAMP",
		updated_at:
			"timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
	},

	// Phương thức lấy tất cả đơn hàng với phân trang và tìm kiếm
	getAll: async (page = 1, pageSize = 10, code = null, user_id = null, status = null, payment_status = null, customer_name = null) => {
		const offset = (page - 1) * pageSize;
		let query = `
        SELECT o.*, u.id AS user_id,
		u.name AS user_name,
		u.email AS user_email,
		u.phone AS user_phone,
		pm.name as payment_name
        FROM ${Order.tableName} o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
    `;
		let countQuery = `SELECT COUNT(*) as total FROM ${Order.tableName} o
		LEFT JOIN users u ON o.user_id = u.id
		`;
		const queryParams = [];
		const countParams = [];

		// Mảng điều kiện tìm kiếm
		const conditions = [];

		// Điều kiện tìm kiếm theo mã đơn hàng (code)
		if (code) {
			conditions.push("o.code LIKE ?");
			queryParams.push(`%${code}%`);
			countParams.push(`%${code}%`);
		}

		// Điều kiện lọc theo user_id
		if (user_id) {
			conditions.push("o.user_id = ?");
			queryParams.push(user_id);
			countParams.push(user_id);
		}

		// Điều kiện lọc theo trạng thái đơn hàng
		if (status) {
			conditions.push("o.status = ?");
			queryParams.push(status);
			countParams.push(status);
		}

		// Điều kiện lọc theo trạng thái thanh toán
		if (payment_status) {
			conditions.push("o.payment_status = ?");
			queryParams.push(payment_status);
			countParams.push(payment_status);
		}

		// Điều kiện lọc theo tên khách hàng
		if (customer_name) {
			conditions.push("u.name LIKE ?");
			queryParams.push(`%${customer_name}%`);
			countParams.push(`%${customer_name}%`);
		}

		// Thêm điều kiện WHERE nếu có điều kiện
		if (conditions.length > 0) {
			query += " WHERE " + conditions.join(" AND ");
			countQuery += " WHERE " + conditions.join(" AND ");
		}

		// Sắp xếp và phân trang
		query += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
		queryParams.push(pageSize, offset);

		const [orders] = await db.query(query, queryParams);
		const [countResult] = await db.query(
			countQuery,
			queryParams.slice(0, -2)
		);
		const total = countResult[0].total;

		// Lấy danh sách sản phẩm cho từng đơn hàng
		for (let order of orders) {
			const productsQuery = `
            SELECT p.id, p.name, p.price, op.qty, p.avatar
            FROM ec_transactions op
            JOIN ec_products p ON op.product_id = p.id
            WHERE op.order_id = ?
        `;
			const [products] = await db.query(productsQuery, [order.id]);
			order.products = products;

			// Đặt thông tin người dùng vào object `user`
			order.user = {
				id: order.user_id,
				name: order.user_name,
				email: order.user_email,
				phone: order.user_phone,
			};
			if (order.shipper_id) {
				const shipperQuery = `
            SELECT name, email, phone, avatar, code
            FROM users
            WHERE id = ?
        `;
				const [shipper] = await db.query(shipperQuery, [
					order.shipper_id,
				]);
				order.shipper = shipper;
			} else {
				order.shipper = null;
			}

			// Xóa các cột thông tin người dùng không cần thiết ở cấp cao nhất
			// delete order.user_id;
			delete order.user_name;
			delete order.user_email;
			delete order.user_phone;
		}

		return {
			data: orders,
			meta: {
				total,
				perPage: pageSize,
				currentPage: page,
				lastPage: Math.ceil(total / pageSize),
				page_size: pageSize,
				total_page: Math.ceil(total / pageSize),
			},
		};
	},

	// Phương thức lấy đơn hàng theo ID
	findById: async (id) => {
		const query = `
            SELECT o.*, u.name AS user_name, u.email AS user_email,
		u.phone AS user_phone
            FROM ${Order.tableName} o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ? LIMIT 1
        `;
		const [rows] = await db.query(query, [id]);
		const order = rows.length > 0 ? rows[0] : null;

		if (order) {
			const productsQuery = `
                SELECT p.id, p.name, p.price, op.qty
                FROM ec_transactions op
                JOIN ec_products p ON op.product_id = p.id
                WHERE op.order_id = ?
            `;
			const [products] = await db.query(productsQuery, [id]);
			order.products = products;
			if (order.shipper_id) {
				const shipperQuery = `
            SELECT name, email, phone, avatar, code
            FROM users
            WHERE id = ?
        `;
				const [shipper] = await db.query(shipperQuery, [
					order.shipper_id,
				]);
				order.shipper = shipper;
			} else {
				order.shipper = null;
			}
		}

		return order;
	},

	create: async (orderData) => {
		try {
			// Check còn hàng:
			let productIds = orderData.products.map((item) => item.id);
			if (productIds?.length <= 0) {
				throw new Error("Không có sản phẩm nào trong đơn hàng");
			}
			let productInstockQuery = `SELECT id, number, name FROM ec_products WHERE id IN (${productIds.join(
				","
			)})`;
			let [productInstock] = await db.query(productInstockQuery);
			let productInstockMap = productInstock.filter(
				(item) => item.number <= 0
			);
			if (productInstockMap?.length > 0) {
				throw new Error(
					`Sản phẩm ${productInstockMap[0]?.name} không còn hàng`
				);
			}
			// Tạo mã đơn hàng
			orderData.code = generateOrderCode();

			// Tính tổng giá trị đơn hàng (bao gồm phí vận chuyển nếu có)
			const subTotal =
				orderData.total_amount + (orderData.shipping_fee || 0);
			// Tạo đơn hàng trong bảng `ec_orders`
			const orderQuery = `
  INSERT INTO ${Order.tableName}
  (user_id, payment_method_id, code, total_shipping_fee, payment_status, status,
  coupon_code, amount, shipping_amount, tax_amount, discount_amount, sub_total,
  completed_at, notes, shipper_id, meta_data, created_at)
  VALUES
  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`;

			const orderValues = [
				orderData.user_id || 0, // user_id: default to 0 if not provided
				orderData.payment_method_id || 0, // payment_method_id: default to 0 if not provided
				orderData.code, // order code
				orderData.shipping_fee || 0, // total_shipping_fee: default to 0 if not provided
				orderData.payment_status || "pending", // payment_status: default to "pending"
				orderData.status || "pending", // status: default to "pending"
				orderData.coupon_code || null, // coupon_code: can be null
				orderData.total_amount || 0, // amount: default to 0 if not provided
				orderData.shipping_fee || 0, // shipping_amount: default to 0 if not provided
				orderData.tax_amount || 0, // tax_amount: default to 0 if not provided
				orderData.discount_amount || 0, // discount_amount: default to 0 if not provided
				subTotal, // sub_total is calculated externally, so we just pass it
				orderData.completed_at || null, // completed_at: can be null if not completed
				orderData.notes || null, // notes: can be null if not provided
				orderData.shipper_id || 0, // shipper_id: default to 0 if not provided
				orderData.meta_data
					? JSON.stringify(orderData.meta_data)
					: null, // meta_data: if present, stringify; else null
			];

			console.log("orderValues:", orderValues); // Log the order values for debugging

			const [orderResult] = await db.query(orderQuery, orderValues);

			// Lấy `order_id` vừa được tạo
			const orderId = orderResult.insertId;
			// Lưu chi tiết sản phẩm vào bảng `ec_transactions`
			for (const product of orderData.products) {
				// Giả sử bạn có một cách để lấy `price` của sản phẩm (từ bảng `ec_products` chẳng hạn)
				const productQuery = `SELECT price FROM ec_products WHERE id = ? LIMIT 1`;
				const [productResult] = await db.query(productQuery, [
					product.id,
				]);
				const productPrice = productResult[0]?.price || 0;
				const totalProductPrice = productPrice * product.quantity;

				const transactionQuery = `INSERT INTO ec_transactions (order_id, product_id, qty, price, total_price, status) VALUES (?, ?, ?, ?, ?, ?)`;
				const transactionValues = [
					orderId,
					product.id,
					product.quantity,
					productPrice,
					totalProductPrice,
					orderData.status || "pending",
				];
				console.log(transactionQuery);
				await db.query(transactionQuery, transactionValues);
			}

			// Trả về đơn hàng đã tạo
			const order =  await Order.findById(orderId);
			orderMail(order);
			return order;
		} catch (error) {
			console.error(
				"Error creating order and saving transactions:",
				error
			);
			throw error;
		}
	},

	// Phương thức cập nhật đơn hàng theo ID
	updateById: async (id, updateData) => {
		try {
			const existingOrder = await Order.findById(id);
			if (!existingOrder) {
				throw new Error("Order not found");
			}

			// Sử dụng giá trị `code` từ `updateData` nếu có, nếu không lấy từ `existingOrder`
			const code = updateData.code || existingOrder.code;

			// Tính tổng giá trị đơn hàng (bao gồm phí vận chuyển nếu có)
			const subTotal =
				updateData.total_amount + (updateData.shipping_fee || 0);

			// Cập nhật thông tin đơn hàng trong bảng `ec_orders`
			const query = `
            UPDATE ${Order.tableName}
            SET user_id = ?, payment_method_id = ?, code = ?, total_shipping_fee = ?, payment_status = ?, status = ?, coupon_code = ?, amount = ?, shipping_amount = ?, tax_amount = ?, discount_amount = ?, sub_total = ?, completed_at = ?
			, notes = ?
			, shipper_id = ?
			, meta_data = ?
            WHERE id = ?`;
			const values = [
				updateData.user_id || 0,
				updateData.payment_method_id,
				code,
				updateData.shipping_fee || 0,
				updateData.payment_status || "pending",
				updateData.status || "pending",
				updateData.coupon_code || null,
				updateData.total_amount || 0,
				updateData.shipping_fee || 0,
				updateData.tax_amount || 0,
				updateData.discount_amount || 0,
				subTotal,
				updateData.completed_at || null,
				updateData.notes || null,
				updateData?.shipper_id || 0,
				updateData.meta_data
					? JSON.stringify(updateData.meta_data)
					: null,
				id,
			];
			const [result] = await db.query(query, values);

			if (result.affectedRows === 0) {
				return null; // Nếu không có dòng nào bị ảnh hưởng, trả về null
			}

			// Xóa các chi tiết sản phẩm cũ liên quan đến đơn hàng trong bảng `ec_transactions`
			const deleteTransactionsQuery = `DELETE FROM ec_transactions WHERE order_id = ?`;
			await db.query(deleteTransactionsQuery, [id]);

			// Thêm các chi tiết sản phẩm mới vào bảng `ec_transactions`
			for (const product of updateData.products) {
				// Lấy giá sản phẩm từ bảng `ec_products`
				const productQuery = `SELECT price FROM ec_products WHERE id = ? LIMIT 1`;
				const [productResult] = await db.query(productQuery, [
					product.id,
				]);
				const productPrice = productResult[0]?.price || 0;
				const totalProductPrice = productPrice * product.quantity;

				const transactionQuery = `
                INSERT INTO ec_transactions (order_id, product_id, qty, price, total_price, status)
                VALUES (?, ?, ?, ?, ?, ?)`;
				const transactionValues = [
					id,
					product.id,
					product.quantity,
					productPrice,
					totalProductPrice,
					updateData.status || "pending",
				];
				await db.query(transactionQuery, transactionValues);
			}

			// Trả về đơn hàng đã cập nhật
			return await Order.findById(id);
		} catch (error) {
			console.error("Error updating order and transactions:", error);
			throw error;
		}
	},

	// Phương thức xóa đơn hàng theo ID
	deleteById: async (id) => {
		try {
			// Xóa các bản ghi liên quan trong bảng ec_transactions trước
			const deleteTransactionsQuery = `DELETE FROM ec_transactions WHERE order_id = ?`;
			await db.query(deleteTransactionsQuery, [id]);

			// Xóa đơn hàng trong bảng ec_orders
			const deleteOrderQuery = `DELETE FROM ${Order.tableName} WHERE id = ?`;
			const [result] = await db.query(deleteOrderQuery, [id]);

			return result.affectedRows > 0;
		} catch (error) {
			console.error(
				"Error deleting order and related transactions:",
				error
			);
			throw error;
		}
	},
};

module.exports = Order;
