const Cart = require('../../models/Cart');

class CartController {
    async addToCart(req, res) {
        try {
            console.log('=== CART CONTROLLER: addToCart ===');
            console.log('Request body:', req.body);
            
            const { userId, productId, quantity, price } = req.body;
            
            // Validation
            if (!userId || !productId || !quantity || !price) {
                console.log('❌ Missing required fields:', { userId, productId, quantity, price });
                return res.status(400).json({ 
                    status: 'error',
                    error: 'Missing required fields',
                    data: null 
                });
            }
            
            console.log('✅ All fields present, calling Cart.addToCart...');
            const result = await Cart.addToCart(userId, productId, quantity, price);
            console.log('✅ Cart.addToCart result:', result);
            
            res.status(201).json({ 
                status: 'success',
                message: 'Added to cart', 
                data: {
                    cartId: result.cartId,
                    itemId: result.itemId,
                    isUpdate: result.isUpdate,
                    newQuantity: result.newQuantity
                }
            });
        } catch (error) {
            console.error('❌ Cart Controller - addToCart error:', error);
            res.status(500).json({ 
                status: 'error',
                error: error.message,
                data: null 
            });
        }
    }

    async getCart(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, pageSize = 10 } = req.query;
            const cart = await Cart.getByUserId(userId, page, pageSize);
            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteItem(req, res) {
        try {
            const { itemId } = req.params;
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ error: 'Missing userId' });
            }
            const success = await Cart.deleteItem(itemId);
            if (success) {
                res.status(200).json({ message: 'Item removed' });
            } else {
                res.status(404).json({ error: 'Item not found or not authorized' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateQuantity(req, res) {
        try {
            const { itemId } = req.params;
            const { quantity, userId } = req.body;
            
            if (!userId || !quantity) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            
            if (quantity <= 0) {
                return res.status(400).json({ error: 'Quantity must be greater than 0' });
            }
            
            const success = await Cart.updateQuantity(itemId, quantity);
            if (success) {
                res.status(200).json({ message: 'Quantity updated', data: { itemId, quantity } });
            } else {
                res.status(404).json({ error: 'Item not found or not authorized' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CartController();