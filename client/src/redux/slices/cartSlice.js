import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiCartService from '../../api/apiCartService';
import userService from '../../api/userService';

// ✅ Async thunk để load cart từ backend
export const loadCartFromBackend = createAsyncThunk(
    'cart/loadCartFromBackend',
    async (_, { rejectWithValue }) => {
        try {
            console.log('=== LOADING CART FROM BACKEND ===');
            
            // Kiểm tra đăng nhập
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('User not authenticated');
            }

            // Lấy user profile để có userId
            const profileResponse = await userService.getProfile();
            const userId = profileResponse.data.id;
            console.log('Loading cart for user ID:', userId);

            // Lấy cart từ backend
            const cartResponse = await apiCartService.getCart(userId);
            console.log('Backend cart response:', cartResponse);

            if (cartResponse.status === 'success' && cartResponse.data) {
                return cartResponse.data; // Return cart items từ backend
            } else {
                return []; // Return empty array nếu không có data
            }
        } catch (error) {
            console.error('Error loading cart from backend:', error);
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    items: [],
    itemCount: 0,
    lastAddResult: null,
    loading: false,
    error: null,
};

// Kiểm tra xem user có đăng nhập không
const isUserLoggedIn = () => {
    return !!localStorage.getItem('token');
};

// Khôi phục trạng thái giỏ hàng từ localStorage (chỉ khi đã đăng nhập)
const loadCartFromLocalStorage = () => {
    try {
        // Chỉ load cart nếu user đã đăng nhập
        if (!isUserLoggedIn()) {
            return initialState;
        }

        const serializedCart = localStorage.getItem('cart');
        if (serializedCart === null) {
            return initialState;
        }
        const parsedCart = JSON.parse(serializedCart);
        console.log("serializedCart---------> ", serializedCart);
        console.log("parsedCart---------> ", parsedCart);
        return {
            ...initialState,
            items: Array.isArray(parsedCart.items) ? parsedCart.items : [],
            itemCount: parsedCart.itemCount || 0,
        };
    } catch (e) {
        console.error("Could not load cart from localStorage", e);
        return initialState;
    }
};

const saveCartToLocalStorage = (state) => {
    try {
        // Chỉ lưu cart nếu user đã đăng nhập
        if (!isUserLoggedIn()) {
            return;
        }
        
        const serializedCart = JSON.stringify(state);
        localStorage.setItem('cart', serializedCart);
    } catch (e) {
        console.error("Could not save cart to localStorage", e);
    }
};

// Xóa cart khỏi localStorage
const removeCartFromLocalStorage = () => {
    try {
        localStorage.removeItem('cart');
    } catch (e) {
        console.error("Could not remove cart from localStorage", e);
    }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: loadCartFromLocalStorage(),
    reducers: {
        addToCart: (state, action) => {
            // Không cho phép thêm vào giỏ hàng nếu chưa đăng nhập
            if (!isUserLoggedIn()) {
                console.warn("User not logged in, cannot add to cart");
                return;
            }

            state.items = state.items || [];
            
            // ✅ FIX: Tìm sản phẩm existing bằng product_id thay vì compound id
            const existingProductIndex = state.items.findIndex(item => item.product_id === action.payload.product_id);
            const productStock = action.payload.number || action.payload.stock || 0;

            if (existingProductIndex >= 0) {
                // ✅ Nếu sản phẩm đã tồn tại, cập nhật quantity
                const currentQuantity = state.items[existingProductIndex].quantity;
                const newQuantity = currentQuantity + action.payload.quantity;

                if (newQuantity > productStock && productStock > 0) {
                    // Nếu vượt quá tồn kho, set về số lượng tối đa
                    state.items[existingProductIndex].quantity = productStock;
                    state.lastAddResult = {
                        success: false,
                        message: `Chỉ có thể thêm tối đa ${productStock} sản phẩm. Đã cập nhật số lượng trong giỏ hàng.`
                    };
                } else {
                    state.items[existingProductIndex].quantity = newQuantity;
                    // ✅ Cập nhật cart_item_id nếu có từ backend
                    if (action.payload.cart_item_id) {
                        state.items[existingProductIndex].cart_item_id = action.payload.cart_item_id;
                    }
                    state.lastAddResult = { success: true };
                }
            } else {
                // ✅ Nếu sản phẩm chưa tồn tại, thêm mới
                if (action.payload.quantity > productStock && productStock > 0) {
                    // Nếu vượt quá tồn kho, thêm số lượng tối đa có thể
                    state.items.push({ ...action.payload, quantity: productStock });
                    state.lastAddResult = {
                        success: false,
                        message: `Chỉ có thể thêm tối đa ${productStock} sản phẩm.`
                    };
                } else {
                    state.items.push({ ...action.payload, quantity: action.payload.quantity });
                    state.lastAddResult = { success: true };
                }
            }

            // Tính lại itemCount bằng cách tính tổng số lượng các sản phẩm trong giỏ hàng
            state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);

            // Lưu trạng thái giỏ hàng vào localStorage (chỉ khi đã đăng nhập)
            saveCartToLocalStorage(state);
        },
        removeFromCart: (state, action) => {
            if (!isUserLoggedIn()) {
                console.warn("User not logged in, cannot remove from cart");
                return;
            }

            state.items = state.items || [];
            const updatedItems = state.items?.filter(item => item.id !== action.payload.id);
            state.items = updatedItems;

            // Tính lại itemCount sau khi xóa sản phẩm
            state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);

            saveCartToLocalStorage(state);
        },
        clearCart: (state) => {
            state.items = [];
            state.itemCount = 0;
            state.lastAddResult = null;

            // Xóa cart khỏi localStorage
            removeCartFromLocalStorage();
        },
        clearCartOnLogout: (state) => {
            // Action đặc biệt để xóa cart khi logout
            state.items = [];
            state.itemCount = 0;
            state.lastAddResult = null;

            // Xóa cart khỏi localStorage
            removeCartFromLocalStorage();
        },
        setAllCart: (state, action) => {
            if (!isUserLoggedIn()) {
                console.warn("User not logged in, cannot set cart");
                return;
            }

            console.info("===========[] ===========[action.payload] : ", action.payload);
            let items = action.payload || [];
            state.items = items;
            state.itemCount = items.reduce((count, item) => count + item.quantity, 0);
            saveCartToLocalStorage(state);
        },
        // ✅ Action để load cart sau khi login - gọi backend
        loadCartAfterLogin: (state) => {
            // Reset state trước khi load
            state.loading = true;
            state.error = null;
            // Logic load từ backend sẽ được handle bởi async thunk
        },
    },
    // ✅ Handle async actions
    extraReducers: (builder) => {
        builder
            .addCase(loadCartFromBackend.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadCartFromBackend.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                const cartItems = action.payload || [];
                state.items = cartItems;
                state.itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
                
                // Lưu vào localStorage
                saveCartToLocalStorage(state);
                
                console.log(`✅ Loaded ${cartItems.length} items from backend, total count: ${state.itemCount}`);
            })
            .addCase(loadCartFromBackend.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load cart';
                console.error('❌ Failed to load cart from backend:', action.payload);
                
                // Fallback: load từ localStorage nếu backend fail
            if (isUserLoggedIn()) {
                const loadedCart = loadCartFromLocalStorage();
                state.items = loadedCart.items;
                state.itemCount = loadedCart.itemCount;
            }
            });
    },
});

export const { 
    addToCart, 
    removeFromCart, 
    clearCart, 
    clearCartOnLogout,
    setAllCart, 
    loadCartAfterLogin 
} = cartSlice.actions;

export default cartSlice.reducer;
