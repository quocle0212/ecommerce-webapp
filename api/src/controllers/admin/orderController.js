const Model = require('../../models/Order');
const Product = require('../../models/Product');
const { successResponse, errorResponse } = require("../../utils/response");
const Article = require("../../models/Post");
const { orderMail } = require( '../../services/sendMailService' );

// Lấy tất cả đơn hàng
exports.getAll = async (req, res) => {
    try {
        const {
            page,
            page_size: pageSize,
            code,
            customer_name,
            status,
            payment_status
        } = req.query;

        const result = await Model.getAll(
            Number(page || 1),
            Number(pageSize || 10),
            code,
            null, // user_id
            status,
            payment_status,
            customer_name
        );

        return successResponse(res, { meta: result.meta, data: result.data }, 'Get list of data successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};

// Lấy đơn hàng theo ID
exports.getById = async (req, res) => {
    try {
        const order = await Model.findById(req.params.id)

        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        return successResponse(res, { data: order }, 'Order found successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res, err?.message || 'Server error');
    }
};

exports.sendMail = async (req, res) => {
    try {
        const order = await Model.findById(req.params.id)
		orderMail(order)

        return successResponse(res, { data: order }, 'Order found successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res, err?.message || 'Server error');
    }
};

// Tạo mới đơn hàng
exports.create = async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = await Model.create(orderData);

        return successResponse(res, { data: newOrder }, 'Order created successfully', 201);
    } catch (err) {
        console.error(err);
        return errorResponse(res, err?.message || 'Server error');
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const orderData = req.body;

        console.log(`=== UPDATING ORDER ${id} ===`);
        console.log('Order data received:', JSON.stringify(orderData, null, 2));

        // Lấy thông tin đơn hàng hiện tại để so sánh trạng thái thanh toán
        const existingOrder = await Model.findById(id);
        if (!existingOrder) {
            return errorResponse(res, 'Order not found', 404);
        }

        console.log('Existing order payment_status:', existingOrder.payment_status);
        console.log('New order payment_status:', orderData.payment_status);

        // Cập nhật đơn hàng
        const newOrder = await Model.updateById(id, orderData);
        console.log('Order updated successfully');

        // Kiểm tra nếu payment_status chuyển từ trạng thái khác sang "completed"
        if (existingOrder.payment_status !== 'completed' && orderData.payment_status === 'completed') {
            console.log('Payment status changed to completed, updating product stock...');

            // Lấy danh sách sản phẩm trong đơn hàng và trừ số lượng
            let stockUpdateFailed = false;
            const failedProducts = [];

            for (const product of newOrder.products) {
                try {
                    // Sử dụng qty thay vì quantity vì trong database là qty
                    const quantity = product.qty || product.quantity || 1;
                    const stockUpdated = await Product.updateStock(product.id, quantity);
                    if (!stockUpdated) {
                        console.warn(`Failed to update stock for product ID: ${product.id}, insufficient stock`);
                        stockUpdateFailed = true;
                        failedProducts.push({
                            id: product.id,
                            name: product.name || `Product ${product.id}`,
                            requested: quantity
                        });
                    } else {
                        console.log(`Updated stock for product ID: ${product.id}, quantity: ${quantity}`);
                    }
                } catch (stockError) {
                    console.error(`Error updating stock for product ID: ${product.id}:`, stockError);
                    stockUpdateFailed = true;
                    failedProducts.push({
                        id: product.id,
                        name: product.name || `Product ${product.id}`,
                        error: stockError.message
                    });
                }
            }

            // Nếu có sản phẩm không đủ hàng, có thể cần rollback payment_status
            if (stockUpdateFailed) {
                console.warn('Some products failed to update stock:', failedProducts);
                // Tùy chọn: có thể rollback payment_status về trạng thái cũ
                // await Model.updateById(id, { ...orderData, payment_status: existingOrder.payment_status });
            }
        }

        // Kiểm tra nếu payment_status chuyển từ "completed" về trạng thái khác (hoàn trả hàng)
        else if (existingOrder.payment_status === 'completed' && orderData.payment_status !== 'completed') {
            console.log('Payment status changed from completed, restoring product stock...');

            // Lấy danh sách sản phẩm trong đơn hàng cũ và hoàn trả số lượng
            for (const product of existingOrder.products) {
                try {
                    const quantity = product.qty || product.quantity || 1;
                    await Product.restoreStock(product.id, quantity);
                    console.log(`Restored stock for product ID: ${product.id}, quantity: ${quantity}`);
                } catch (stockError) {
                    console.error(`Error restoring stock for product ID: ${product.id}:`, stockError);
                }
            }
        }

        return successResponse(res, { data: newOrder }, 'Order update successfully', 201);
    } catch (err) {
        console.error(err);
        return errorResponse(res, err?.message || 'Server error');
    }
};

// Cập nhật trạng thái đơn hàng
exports.updateStatus = async (req, res) => {
    try {
        const { status, payment_status } = req.body;

        // Kiểm tra trạng thái hợp lệ
        const validStatuses = ['pending', 'completed', 'processing', 'canceled'];
        if (status && !validStatuses.includes(status)) {
            return errorResponse(res, 'Invalid status', 400);
        }

        const validPaymentStatuses = ['pending', 'completed', 'refunding', 'refunded', 'fraud', 'failed'];
        if (payment_status && !validPaymentStatuses.includes(payment_status)) {
            return errorResponse(res, 'Invalid payment status', 400);
        }

        const order = await Model.findById(req.params.id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        const oldPaymentStatus = order.payment_status;

        // Cập nhật trạng thái
        if (status) order.status = status;
        if (payment_status) order.payment_status = payment_status;

        // Lưu thay đổi (giả sử có method save, nếu không thì dùng updateById)
        const updateData = {};
        if (status) updateData.status = status;
        if (payment_status) updateData.payment_status = payment_status;

        const updatedOrder = await Model.updateById(req.params.id, {
            ...order,
            ...updateData,
            products: order.products // Giữ nguyên products
        });

        // Xử lý thay đổi số lượng sản phẩm khi payment_status thay đổi
        if (payment_status && oldPaymentStatus !== payment_status) {
            if (oldPaymentStatus !== 'completed' && payment_status === 'completed') {
                console.log('Payment status changed to completed, updating product stock...');

                let stockUpdateFailed = false;
                const failedProducts = [];

                for (const product of order.products) {
                    try {
                        const quantity = product.qty || product.quantity || 1;
                        const stockUpdated = await Product.updateStock(product.id, quantity);
                        if (!stockUpdated) {
                            console.warn(`Failed to update stock for product ID: ${product.id}, insufficient stock`);
                            stockUpdateFailed = true;
                            failedProducts.push({
                                id: product.id,
                                name: product.name || `Product ${product.id}`,
                                requested: quantity
                            });
                        } else {
                            console.log(`Updated stock for product ID: ${product.id}, quantity: ${quantity}`);
                        }
                    } catch (stockError) {
                        console.error(`Error updating stock for product ID: ${product.id}:`, stockError);
                        stockUpdateFailed = true;
                        failedProducts.push({
                            id: product.id,
                            name: product.name || `Product ${product.id}`,
                            error: stockError.message
                        });
                    }
                }

                if (stockUpdateFailed) {
                    console.warn('Some products failed to update stock in updateStatus:', failedProducts);
                }
            }
            else if (oldPaymentStatus === 'completed' && payment_status !== 'completed') {
                console.log('Payment status changed from completed, restoring product stock...');

                for (const product of order.products) {
                    try {
                        const quantity = product.qty || product.quantity || 1;
                        await Product.restoreStock(product.id, quantity);
                        console.log(`Restored stock for product ID: ${product.id}, quantity: ${quantity}`);
                    } catch (stockError) {
                        console.error(`Error restoring stock for product ID: ${product.id}:`, stockError);
                    }
                }
            }
        }

        return successResponse(res, { data: updatedOrder }, 'Order status updated successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res, err?.message || 'Server error');
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;

        const isDeleted = await Model.deleteById(id);

        if (!isDeleted) {
            return errorResponse(res, 'Data not found', 404, 404);
        }

        return successResponse(res, {}, 'Data deleted successfully');
    } catch (err) {
        console.error(err);
        return errorResponse(res);
    }
};
//
//
// // Xóa đơn hàng
// exports.delete = async (req, res) => {
//     try {
//         // Tìm đơn hàng theo ID
//         const order = await Model.findById(req.params.id);
//         if (!order) {
//             return errorResponse(res, 'Order not found', 404);
//         }
//
//         // Xóa các bản ghi trong `ec_transactions` dựa vào `order_id`
//         const deleteTransactionsQuery = `DELETE FROM ec_transactions WHERE order_id = ?`;
//         await db.query(deleteTransactionsQuery, [req.params.id]);
//
//         // Xóa đơn hàng trong `ec_orders`
//         const deleteOrderQuery = `DELETE FROM ${Model.tableName} WHERE id = ?`;
//         const [result] = await db.query(deleteOrderQuery, [req.params.id]);
//
//         if (result.affectedRows > 0) {
//             return successResponse(res, {}, 'Order deleted successfully');
//         } else {
//             return errorResponse(res, 'Failed to delete order', 500);
//         }
//     } catch (err) {
//         console.error('Error deleting order and transactions:', err);
//         return errorResponse(res, err?.message || 'Server error');
//     }
// };
