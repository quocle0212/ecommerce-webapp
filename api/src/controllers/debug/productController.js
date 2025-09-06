const Product = require('../../models/Product');
const db = require('../../config/dbMysql');
const { successResponse, errorResponse } = require("../../utils/response");

// Debug endpoint để kiểm tra thông tin sản phẩm và tồn kho
exports.debugProductStock = async (req, res) => {
    try {
        const { slug } = req.params;
        const productId = slug.split('-').pop(); // Lấy ID từ cuối slug
        
        console.log(`=== DEBUG PRODUCT STOCK ===`);
        console.log(`Slug: ${slug}`);
        console.log(`Product ID: ${productId}`);
        
        // 1. Lấy thông tin sản phẩm
        const [productRows] = await db.query(
            'SELECT id, name, price, number, status, created_at FROM ec_products WHERE id = ?',
            [productId]
        );
        
        if (productRows.length === 0) {
            return errorResponse(res, 'Product not found', 404);
        }
        
        const product = productRows[0];
        
        // 2. Kiểm tra các giao dịch liên quan
        const [transactionRows] = await db.query(`
            SELECT 
                t.id,
                t.order_id,
                t.qty,
                t.price,
                t.total_price,
                t.status,
                t.created_at,
                o.code as order_code,
                o.status as order_status,
                o.payment_status
            FROM ec_transactions t
            LEFT JOIN ec_orders o ON t.order_id = o.id
            WHERE t.product_id = ?
            ORDER BY t.created_at DESC
            LIMIT 10
        `, [productId]);
        
        // 3. Tính tổng số lượng đã bán (completed orders)
        const [soldRows] = await db.query(`
            SELECT 
                SUM(t.qty) as total_sold,
                COUNT(DISTINCT t.order_id) as total_orders
            FROM ec_transactions t
            LEFT JOIN ec_orders o ON t.order_id = o.id
            WHERE t.product_id = ? 
            AND o.payment_status = 'completed'
        `, [productId]);
        
        // 4. Kiểm tra đơn hàng pending
        const [pendingRows] = await db.query(`
            SELECT 
                SUM(t.qty) as pending_qty,
                COUNT(DISTINCT t.order_id) as pending_orders
            FROM ec_transactions t
            LEFT JOIN ec_orders o ON t.order_id = o.id
            WHERE t.product_id = ? 
            AND (o.payment_status != 'completed' OR o.status != 'completed')
        `, [productId]);
        
        const totalSold = soldRows[0].total_sold || 0;
        const totalOrders = soldRows[0].total_orders || 0;
        const pendingQty = pendingRows[0].pending_qty || 0;
        const pendingOrders = pendingRows[0].pending_orders || 0;
        const availableStock = product.number - pendingQty;
        
        const debugInfo = {
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                stock_in_db: product.number,
                status: product.status,
                created_at: product.created_at
            },
            sales_stats: {
                total_sold: totalSold,
                total_completed_orders: totalOrders
            },
            pending_orders: {
                pending_quantity: pendingQty,
                pending_orders_count: pendingOrders
            },
            stock_analysis: {
                stock_in_db: product.number,
                pending_quantity: pendingQty,
                available_stock: availableStock,
                status: availableStock <= 0 ? 'OUT_OF_STOCK' : 
                       availableStock < 5 ? 'LOW_STOCK' : 'IN_STOCK'
            },
            recent_transactions: transactionRows.map(t => ({
                id: t.id,
                order_code: t.order_code,
                quantity: t.qty,
                price: t.price,
                order_status: t.order_status,
                payment_status: t.payment_status,
                created_at: t.created_at
            }))
        };
        
        return successResponse(res, debugInfo, 'Product debug info retrieved successfully');
        
    } catch (err) {
        console.error('Debug error:', err);
        return errorResponse(res, err?.message || 'Server error');
    }
};
