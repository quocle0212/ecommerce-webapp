import apiHelper from '../api/apiHelper';

const apiCartService = {
    // Lấy giỏ hàng theo userId
    getCart: async (userId, params = {}) => {
        try {
            const paramsSearch = new URLSearchParams(params);
            const response = await apiHelper.get(`cart/${userId}?${paramsSearch.toString()}`);
            console.log('Cart API - getCart success:', response);
            return response;
        } catch (error) {
            console.error('Cart API - getCart error:', error);
            throw error;
        }
    },

    // Thêm sản phẩm vào giỏ hàng
    addToCart: async (data) => {
        try {
            const response = await apiHelper.post('cart/add', data);
            console.log('Cart API - addToCart success:', response);
            return response;
        } catch (error) {
            console.error('Cart API - addToCart error:', error);
            throw error;
        }
    },

    // Xóa item khỏi giỏ hàng
    deleteItem: async (itemId, userId) => {
        try {
            const response = await apiHelper.delete(`cart/item/${itemId}`, { data: { userId } });
            console.log('Cart API - deleteItem success:', response);
            return response;
        } catch (error) {
            console.error('Cart API - deleteItem error:', error);
            throw error;
        }
    },

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateQuantity: async (itemId, quantity, userId) => {
        try {
            const response = await apiHelper.put(`cart/item/${itemId}`, { quantity, userId });
            console.log('Cart API - updateQuantity success:', response);
            return response;
        } catch (error) {
            console.error('Cart API - updateQuantity error:', error);
            throw error;
        }
    },
};

export default apiCartService;