const Model = require("../../models/Order");
const Product = require("../../models/Product");
const db = require("../../config/dbMysql");
const {successResponse, errorResponse} = require("../../utils/response");
const OrderService = require('../../services/user/orderService');

exports.createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = await Model.create(orderData);

        return successResponse(res, { data: newOrder }, 'Order created successfully', 201);
    } catch (err) {
        console.error(err);
        return errorResponse(res, err?.message || err?.message || 'Server error');
    }
};

exports.getAll = async (req, res) => {
    try {
        const { page, page_size: pageSize, code, status, payment_status } = req.query;
        const userId = req.user.id;
        console.log('User ID from token:', userId);
        console.log('Query params:', { page, pageSize, code, status, payment_status });

        const result = await Model.getAll(
            Number(page || 1),
            Number(pageSize || 10),
            code,
            userId,
            status,
            payment_status
        );

        console.log('Orders result:', result);
        return successResponse(res, { meta: result.meta, data: result.data }, 'Get list of data successfully');
    } catch (err) {
        console.error('Error in getAll orders:', err);
        return errorResponse(res);
    }
};

exports.updateStatusPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id, payment_status, user_id = userId } = req.body;
        const result = await OrderService.updateStatusPayment(id, {
            payment_status,
            user_id
        });
        console.log("======== result: ", result);
        return successResponse(res, { data: result.data }, 'Update successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};

// Lấy chi tiết đơn hàng (chỉ của user hiện tại)
exports.getById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        const order = await Model.findById(orderId);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        // Kiểm tra quyền sở hữu đơn hàng
        if (order.user_id !== userId) {
            return errorResponse(res, 'Access denied', 403);
        }

        return successResponse(res, { data: order }, 'Get order successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res, err?.message || 'Server error');
    }
};

// User chỉ có thể hủy đơn hàng khi chưa thanh toán
exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        // Lấy thông tin đơn hàng hiện tại
        const existingOrder = await Model.findById(orderId);
        if (!existingOrder) {
            return errorResponse(res, 'Order not found', 404);
        }

        // Kiểm tra quyền sở hữu đơn hàng
        if (existingOrder.user_id !== userId) {
            return errorResponse(res, 'Access denied', 403);
        }

        // Kiểm tra trạng thái thanh toán - chỉ cho phép hủy khi chưa thanh toán
        if (existingOrder.payment_status === 'completed') {
            return errorResponse(res, 'Cannot cancel order that has been paid', 400);
        }

        // Kiểm tra trạng thái đơn hàng - không cho phép hủy đơn đã hoàn thành
        if (existingOrder.status === 'completed') {
            return errorResponse(res, 'Cannot cancel completed order', 400);
        }

        // Cập nhật trạng thái đơn hàng thành canceled (chỉ cập nhật status, không động đến products)
        const updateQuery = `
            UPDATE ec_orders
            SET status = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        await db.query(updateQuery, ['canceled', 'failed', orderId]);

        // Lấy lại đơn hàng đã cập nhật
        const updatedOrder = await Model.findById(orderId);

        // Nếu đơn hàng đã thanh toán completed trước đó, hoàn trả số lượng sản phẩm
        if (existingOrder.payment_status === 'completed') {
            console.log('Restoring product stock for canceled order...');
            for (const product of existingOrder.products) {
                try {
                    await Product.restoreStock(product.id, product.qty);
                    console.log(`Restored stock for product ID: ${product.id}, quantity: ${product.qty}`);
                } catch (stockError) {
                    console.error(`Error restoring stock for product ID: ${product.id}:`, stockError);
                }
            }
        }

        return successResponse(res, { data: updatedOrder }, 'Order canceled successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res, err?.message || 'Server error');
    }
};
