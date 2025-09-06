// Debug helper cho chức năng giỏ hàng
import apiCartService from '../api/apiCartService';
import userService from '../api/userService';

export const debugCartFunctionality = async () => {
    console.log('=== CART DEBUG HELPER ===');
    
    try {
        // 1. Kiểm tra đăng nhập
        const token = localStorage.getItem('token');
        console.log('1. Token exists:', !!token);
        
        if (!token) {
            console.error('❌ No token found. Please login first.');
            return { success: false, error: 'No token' };
        }
        
        // 2. Kiểm tra user profile
        console.log('2. Getting user profile...');
        const profileResponse = await userService.getProfile();
        console.log('Profile response:', profileResponse);
        
        const userId = profileResponse.data.id;
        console.log('User ID:', userId);
        
        // 3. Test thêm sản phẩm vào giỏ hàng
        console.log('3. Testing add to cart...');
        const testCartData = {
            userId: userId,
            productId: 1, // Test với product ID 1
            quantity: 1,
            price: 100000
        };
        
        console.log('Test cart data:', testCartData);
        
        const cartResponse = await apiCartService.addToCart(testCartData);
        console.log('Cart response:', cartResponse);
        
        // 4. Lấy giỏ hàng để kiểm tra
        console.log('4. Getting cart...');
        const getCartResponse = await apiCartService.getCart(userId);
        console.log('Get cart response:', getCartResponse);
        
        return { 
            success: true, 
            data: {
                userId,
                cartResponse,
                cartItems: getCartResponse.data
            }
        };
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
        return { 
            success: false, 
            error: error.message,
            details: error
        };
    }
};

export const checkCartAPI = async () => {
    console.log('=== CHECKING CART API ENDPOINTS ===');
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No token found');
            return;
        }
        
        const profileResponse = await userService.getProfile();
        const userId = profileResponse.data.id;
        
        // Test GET cart
        console.log('Testing GET /cart/' + userId);
        try {
            const getResponse = await apiCartService.getCart(userId);
            console.log('✅ GET cart successful:', getResponse);
        } catch (error) {
            console.error('❌ GET cart failed:', error);
        }
        
        // Test POST cart/add
        console.log('Testing POST /cart/add');
        try {
            const addResponse = await apiCartService.addToCart({
                userId: userId,
                productId: 1,
                quantity: 1,
                price: 50000
            });
            console.log('✅ POST cart/add successful:', addResponse);
        } catch (error) {
            console.error('❌ POST cart/add failed:', error);
        }
        
    } catch (error) {
        console.error('❌ API check failed:', error);
    }
};

// Hàm để clear localStorage và reset cart
export const resetCartDebug = () => {
    localStorage.removeItem('cart');
    console.log('✅ Cart cleared from localStorage');
};

// Export để có thể gọi từ console
window.debugCart = debugCartFunctionality;
window.checkCartAPI = checkCartAPI;
window.resetCartDebug = resetCartDebug; 