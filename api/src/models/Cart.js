const db = require('../config/dbMysql');

const Cart = {
    tableName: 'cart',
    itemTableName: 'cart_items',

    // Lấy giỏ hàng theo user_id
    getByUserId: async (userId, page = 1, pageSize = 10) => {
        const offset = (page - 1) * pageSize;
        const query = `
            SELECT c.id as cart_id, c.user_id,
                   ci.id as item_id, ci.cart_id, ci.product_id, ci.quantity, ci.price
            FROM ${Cart.tableName} c
            LEFT JOIN ${Cart.itemTableName} ci ON c.id = ci.cart_id
            WHERE c.user_id = ?
            LIMIT ? OFFSET ?`;
        const queryParams = [userId, Number(pageSize), Number(offset)];

        try {
            const [rows] = await db.query(query, queryParams);
            const [countResult] = await db.query(`SELECT COUNT(*) as total FROM ${Cart.tableName} WHERE user_id = ?`, [userId]);
            const total = countResult[0].total;

            // Gom nhóm items theo cart
            const carts = [];
            rows.forEach(row => {
                let cart = carts.find(c => c.id === row.cart_id);
                if (!cart) {
                    cart = {
                        id: row.cart_id,
                        user_id: row.user_id,
                        items: []
                    };
                    carts.push(cart);
                }
                if (row.item_id) {
                    cart.items.push({
                        id: row.item_id,
                        cart_id: row.cart_id,
                        product_id: row.product_id,
                        quantity: row.quantity,
                        price: row.price
                    });
                }
            });

            return {
                data: carts,
                meta: {
                    total,
                    perPage: pageSize,
                    currentPage: page,
                    lastPage: Math.ceil(total / pageSize)
                }
            };
        } catch (error) {
            console.error('SQL Error:', error);
            throw error;
        }
    },

    // Thêm sản phẩm vào giỏ hàng
    addToCart: async (userId, productId, quantity, price) => {
        try {
            console.log('=== CART MODEL: addToCart ===');
            console.log('Params:', { userId, productId, quantity, price });

            // Validate input
            if (!userId || !productId || !quantity || !price) {
                throw new Error('Invalid input parameters');
            }

            // Convert to numbers to be safe
            const userIdNum = parseInt(userId, 10);
            const productIdNum = parseInt(productId, 10);
            const quantityNum = parseInt(quantity, 10);
            const priceNum = parseFloat(price);

            console.log('Converted params:', { userIdNum, productIdNum, quantityNum, priceNum });

            // Tìm hoặc tạo cart cho user
            const [cartRows] = await db.query(`SELECT * FROM ${Cart.tableName} WHERE user_id = ? LIMIT 1`, [userIdNum]);
            let cartId;

            if (cartRows.length === 0) {
                console.log('Creating new cart for user:', userIdNum);
                // Tạo cart đơn giản - chỉ user_id
                const [result] = await db.query(
                    `INSERT INTO ${Cart.tableName} (user_id) VALUES (?)`,
                    [userIdNum]
                );
                cartId = result.insertId;
                console.log('New cart created with ID:', cartId);
            } else {
                cartId = cartRows[0].id;
                console.log('Using existing cart ID:', cartId);
            }

            // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
            const [existingItemRows] = await db.query(
                `SELECT * FROM ${Cart.itemTableName} WHERE cart_id = ? AND product_id = ? LIMIT 1`,
                [cartId, productIdNum]
            );

            if (existingItemRows.length > 0) {
                // Nếu sản phẩm đã tồn tại, cập nhật quantity
                console.log('Product exists in cart, updating quantity');
                const existingItem = existingItemRows[0];
                const newQuantity = existingItem.quantity + quantityNum;
                
                await db.query(
                    `UPDATE ${Cart.itemTableName} SET quantity = ?, price = ? WHERE id = ?`,
                    [newQuantity, priceNum, existingItem.id]
                );
                
                console.log('Updated quantity to:', newQuantity);
                return { 
                    cartId, 
                    itemId: existingItem.id, 
                    isUpdate: true,
                    newQuantity 
                };
            } else {
                // Nếu sản phẩm chưa tồn tại, tạo mới
                console.log('Adding new product to cart');
                const [result] = await db.query(
                    `INSERT INTO ${Cart.itemTableName} (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
                    [cartId, productIdNum, quantityNum, priceNum]
                );

                console.log('New cart item created with ID:', result.insertId);
                return { 
                    cartId, 
                    itemId: result.insertId, 
                    isUpdate: false 
                };
            }
        } catch (error) {
            console.error('Cart Model - addToCart error:', error);
            throw error;
        }
    },

    // Xóa item khỏi giỏ hàng
    deleteItem: async (itemId) => {
        const query = `DELETE FROM ${Cart.itemTableName} WHERE id = ?`;
        const [result] = await db.query(query, [itemId]);
        return result.affectedRows > 0;
    },

    // Cập nhật số lượng sản phẩm
    updateQuantity: async (itemId, quantity) => {
        const query = `UPDATE ${Cart.itemTableName} SET quantity = ? WHERE id = ?`;
        const [result] = await db.query(query, [quantity, itemId]);
        return result.affectedRows > 0;
    },

    // Lấy tổng số item trong cart
    getCartCount: async (userId) => {
        try {
            const query = `
                SELECT COUNT(ci.id) as total_items
                FROM ${Cart.tableName} c
                LEFT JOIN ${Cart.itemTableName} ci ON c.id = ci.cart_id
                WHERE c.user_id = ?`;
            const [rows] = await db.query(query, [userId]);
            return rows[0]?.total_items || 0;
        } catch (error) {
            console.error('Cart Model - getCartCount error:', error);
            throw error;
        }
    }
};

module.exports = Cart;