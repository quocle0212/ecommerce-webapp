import { toast } from 'react-toastify';

/**
 * Kiểm tra user đã đăng nhập hay chưa
 * @param {Object} user - User object từ Redux state
 * @param {boolean} isAuthenticated - Trạng thái đăng nhập từ Redux state  
 * @returns {boolean} - true nếu đã đăng nhập, false nếu chưa
 */
export const isUserLoggedIn = (user, isAuthenticated) => {
    return !!(user && isAuthenticated && localStorage.getItem('token'));
};

/**
 * Kiểm tra đăng nhập và chuyển hướng nếu cần
 * @param {Object} user - User object từ Redux state
 * @param {boolean} isAuthenticated - Trạng thái đăng nhập từ Redux state
 * @param {Function} navigate - Function navigate từ react-router-dom
 * @param {string} redirectPath - Đường dẫn để chuyển hướng sau khi login (optional)
 * @param {string} message - Thông báo tùy chỉnh (optional)
 * @returns {boolean} - true nếu đã đăng nhập, false nếu chưa đăng nhập và đã chuyển hướng
 */
export const checkAuthAndRedirect = (user, isAuthenticated, navigate, redirectPath = null, message = null) => {
    if (!isUserLoggedIn(user, isAuthenticated)) {
        // Lưu đường dẫn hiện tại để chuyển hướng sau khi login
        const currentPath = window.location.pathname;
        const returnUrl = redirectPath || currentPath;
        
        // Lưu vào localStorage để sử dụng sau khi login thành công
        localStorage.setItem('returnUrl', returnUrl);
        
        // Hiển thị thông báo
        const defaultMessage = 'Vui lòng đăng nhập để thực hiện chức năng này';
        toast.warning(message || defaultMessage);
        
        // Chuyển hướng đến trang login
        navigate('/login');
        
        return false;
    }
    
    return true;
};

/**
 * Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
 * @param {Object} user - User object từ Redux state
 * @param {boolean} isAuthenticated - Trạng thái đăng nhập từ Redux state
 * @param {Function} navigate - Function navigate từ react-router-dom
 * @param {Function} addToCartCallback - Callback function để thực hiện thêm vào giỏ hàng
 * @param {Object} product - Sản phẩm cần thêm vào giỏ hàng
 * @param {number} quantity - Số lượng sản phẩm (optional, default = 1)
 */
export const checkAuthBeforeAddToCart = (user, isAuthenticated, navigate, addToCartCallback, product, quantity = 1) => {
    if (!checkAuthAndRedirect(user, isAuthenticated, navigate, null, 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')) {
        return;
    }
    
    // Nếu đã đăng nhập, thực hiện thêm vào giỏ hàng
    if (addToCartCallback && typeof addToCartCallback === 'function') {
        addToCartCallback(product, quantity);
    }
};

/**
 * Kiểm tra đăng nhập trước khi mua ngay
 * @param {Object} user - User object từ Redux state
 * @param {boolean} isAuthenticated - Trạng thái đăng nhập từ Redux state
 * @param {Function} navigate - Function navigate từ react-router-dom
 * @param {Function} buyNowCallback - Callback function để thực hiện mua ngay
 * @param {Object} product - Sản phẩm cần mua
 * @param {number} quantity - Số lượng sản phẩm (optional, default = 1)
 */
export const checkAuthBeforeBuyNow = (user, isAuthenticated, navigate, buyNowCallback, product, quantity = 1) => {
    if (!checkAuthAndRedirect(user, isAuthenticated, navigate, '/checkout', 'Vui lòng đăng nhập để mua sản phẩm')) {
        return;
    }
    
    // Nếu đã đăng nhập, thực hiện mua ngay
    if (buyNowCallback && typeof buyNowCallback === 'function') {
        buyNowCallback(product, quantity);
    }
};

/**
 * Kiểm tra đăng nhập trước khi thanh toán
 * @param {Object} user - User object từ Redux state
 * @param {boolean} isAuthenticated - Trạng thái đăng nhập từ Redux state
 * @param {Function} navigate - Function navigate từ react-router-dom
 * @param {Function} checkoutCallback - Callback function để thực hiện thanh toán
 */
export const checkAuthBeforeCheckout = (user, isAuthenticated, navigate, checkoutCallback) => {
    if (!checkAuthAndRedirect(user, isAuthenticated, navigate, '/checkout', 'Vui lòng đăng nhập để thực hiện thanh toán')) {
        return;
    }
    
    // Nếu đã đăng nhập, thực hiện thanh toán
    if (checkoutCallback && typeof checkoutCallback === 'function') {
        checkoutCallback();
    }
};

/**
 * Xử lý chuyển hướng sau khi login thành công
 * @param {Function} navigate - Function navigate từ react-router-dom
 * @param {string} defaultPath - Đường dẫn mặc định nếu không có returnUrl (optional, default = '/')
 */
export const handlePostLoginRedirect = (navigate, defaultPath = '/') => {
    const returnUrl = localStorage.getItem('returnUrl');
    
    if (returnUrl) {
        localStorage.removeItem('returnUrl');
        navigate(returnUrl);
    } else {
        navigate(defaultPath);
    }
};

/**
 * Kiểm tra và yêu cầu đăng nhập cho một action cụ thể
 * @param {Object} user - User object từ Redux state
 * @param {boolean} isAuthenticated - Trạng thái đăng nhập từ Redux state
 * @param {Function} navigate - Function navigate từ react-router-dom
 * @param {Function} action - Function cần thực hiện nếu đã đăng nhập
 * @param {string} message - Thông báo yêu cầu đăng nhập
 * @param {string} returnUrl - URL để chuyển hướng sau khi login
 */
export const requireAuth = (user, isAuthenticated, navigate, action, message = 'Vui lòng đăng nhập để tiếp tục', returnUrl = null) => {
    if (!checkAuthAndRedirect(user, isAuthenticated, navigate, returnUrl, message)) {
        return;
    }
    
    // Thực hiện action nếu đã đăng nhập
    if (action && typeof action === 'function') {
        action();
    }
}; 