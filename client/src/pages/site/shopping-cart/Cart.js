import React, { useState, useEffect, startTransition, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { setAllCart, clearCart } from '../../../redux/slices/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrashAlt, FaHome, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Cart.css';
import { formatPrice } from '../../../helpers/formatters';
import { checkAuthBeforeCheckout } from '../../../helpers/authHelpers';
import userService from '../../../api/userService';
import apiCartService from '../../../api/apiCartService';
import apiProductService from '../../../api/apiProductService';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [itemCount, setItemCount] = useState(0);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    // ✅ DEBUG: Lấy Redux cart state để debug
    const reduxCartItems = useSelector((state) => state.cart.items);
    const reduxItemCount = useSelector((state) => state.cart.itemCount);
    const reduxLoading = useSelector((state) => state.cart.loading);

    // ✅ useCallback để tránh lỗi dependency
    const updateCartInRedux = useCallback((items) => {
        console.log('Cart update ------>', items);
        
        // ✅ FIX: Tính toán itemCount bao gồm TẤT CẢ items, không chỉ selected items
        const totalItemCount = items.reduce((count, item) => count + item.quantity, 0);
        
        // ✅ Cập nhật Redux với items và itemCount
        dispatch(setAllCart(items.map(({ selected, ...rest }) => rest)));
        
        // ✅ Log để debug
        console.log('=== UPDATING REDUX CART ===');
        console.log('Total items count:', totalItemCount);
        console.log('Items being sent to Redux:', items.map(({ selected, ...rest }) => rest));
        
        // ✅ Cập nhật local itemCount cho selected items (để hiển thị trong summary)
        const selectedItemCount = items.reduce(
            (totalItem, item) => totalItem + (item.selected ? Number(item.quantity) : 0),
            0
        );
        setItemCount(selectedItemCount);
    }, [dispatch]);

    // ✅ DEBUG: Log Redux state changes
    useEffect(() => {
        console.log('=== CART COMPONENT - REDUX STATE DEBUG ===');
        console.log('Redux cart items:', reduxCartItems);
        console.log('Redux item count:', reduxItemCount);
        console.log('Redux loading:', reduxLoading);
        console.log('Local cart items:', cartItems.length);
        console.log('Local item count:', itemCount);
        console.log('==========================================');
    }, [reduxCartItems, reduxItemCount, reduxLoading, cartItems.length, itemCount]);

    // ✅ UseEffect 1: Sync với Redux state (chỉ khi Redux có data)
    useEffect(() => {
        if (reduxCartItems && reduxCartItems.length > 0 && cartItems.length === 0 && !loading) {
            console.log('=== SYNCING WITH REDUX CART DATA ===');
            console.log('Redux items:', reduxCartItems);
            
            // Convert Redux data sang format cho Cart component
            const itemsWithSelection = reduxCartItems.map(item => ({
                id: item.cart_item_id || item.id,
                cart_id: item.cart_id,
                cart_item_id: item.cart_item_id,
                product_id: item.product_id,
                name: item.name,
                avatar: item.avatar,
                price: item.price,
                quantity: item.quantity,
                selected: false // Default không select
            }));
            
            setCartItems(itemsWithSelection);
            setItemCount(0); // Selected count = 0 ban đầu
            console.log('✅ Synced cart from Redux state');
        }
    }, [reduxCartItems, cartItems.length, loading]);

    // ✅ UseEffect 2: Fetch từ backend (chỉ khi cần thiết)
    useEffect(() => {
        const fetchCartData = async () => {
            if (!isAuthenticated || !user) {
                setCartItems([]);
                setLoading(false);
                toast.error('Vui lòng đăng nhập để xem giỏ hàng.');
                return;
            }

            // ✅ Skip fetch nếu Redux đang loading hoặc đã có data
            if (reduxLoading || (reduxCartItems && reduxCartItems.length > 0)) {
                console.log('⏭️ Skipping fetch - Redux has data or is loading');
                setLoading(false);
                return;
            }

            // ✅ Fetch từ backend khi Redux trống
            console.log('=== FETCHING CART FROM BACKEND ===');
            try {
                console.log('Fetching cart data for authenticated user...');
                const profileResponse = await userService.getProfile();
                const userId = profileResponse.data.id;
                console.log('User ID:', userId);

                const cartResponse = await apiCartService.getCart(userId, { page: 1, pageSize: 10 });
                console.log('Cart Response:', cartResponse);
                const carts = cartResponse.data || [];
                console.log('Carts:', carts);

                if (!carts.length) {
                    console.log('No carts found for user:', userId);
                    setCartItems([]);
                    setLoading(false);
                    return;
                }

                const productIds = new Set();
                const cartItemsData = [];
                
                carts.forEach(cart => {
                    cart.items.forEach(item => {
                        productIds.add(item.product_id);
                        cartItemsData.push({
                                        cart_id: cart.id,
                                        cart_item_id: item.id,
                                        product_id: item.product_id,
                                        quantity: item.quantity,
                            price: item.price
                        });
                    });
                });

                const productPromises = Array.from(productIds).map(productId =>
                    apiProductService.showProductDetail(productId)
                        .then(response => ({
                            id: productId,
                            ...response.data.data
                        }))
                        .catch(error => {
                            console.error(`Error fetching product ${productId}:`, error);
                            return {
                                id: productId,
                                name: `Product ${productId}`,
                                avatar: 'https://via.placeholder.com/150',
                                price: 0
                            };
                        })
                );

                const products = await Promise.all(productPromises);
                const productMap = new Map(products.map(p => [p.id, p]));

                const itemsFromServer = cartItemsData.map(item => {
                    const product = productMap.get(item.product_id);
                    return {
                        id: item.cart_item_id,
                        cart_id: item.cart_id,
                        cart_item_id: item.cart_item_id,
                        product_id: item.product_id,
                        name: product?.name || `Product ${item.product_id}`,
                        avatar: product?.avatar || 'https://via.placeholder.com/150',
                        price: parseFloat(product?.price || item.price || 0),
                        quantity: item.quantity,
                        selected: false
                    };
                });

                console.log('Items From Server:', itemsFromServer);

                setCartItems(itemsFromServer);
                
                // ✅ FIX: Cập nhật Redux state ngay khi load cart từ backend
                updateCartInRedux(itemsFromServer);
                
                // Local itemCount cho selected items (ban đầu = 0 vì chưa select gì)
                const total = itemsFromServer.reduce(
                    (totalItem, item) => totalItem + (item.selected ? Number(item.quantity) : 0),
                    0
                );
                setItemCount(total);
                setLoading(false);
                console.log('Cart Items State:', itemsFromServer);
            } catch (error) {
                console.error('Error fetching cart data:', error);
                toast.error('Không thể tải giỏ hàng. Vui lòng thử lại.');
                setLoading(false);
            }
        };

        fetchCartData();
    }, [isAuthenticated, user, reduxLoading, reduxCartItems, updateCartInRedux]); // ✅ Thêm dependencies để tránh lỗi linting

    const handleQuantityChange = (id, quantity) => {
        setCartItems(prevItems => {
            const updatedItems = prevItems.map(item =>
                item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
            );
            updateCartInRedux(updatedItems);
            return updatedItems;
        });
    };

    const handleRemoveItem = async (id) => {
        if (!isAuthenticated || !user) {
            toast.error('Vui lòng đăng nhập để xóa sản phẩm.');
            return;
        }

        console.log('=== DEBUG REMOVE ITEM ===');
        console.log('Item ID to remove:', id);
        console.log('Current cart items:', cartItems);

        try {
            const profileResponse = await userService.getProfile();
            const userId = profileResponse.data.id;
            console.log('User ID:', userId);
            
            const item = cartItems.find(item => item.id === id);
            console.log('Found item:', item);
            
            if (!item) {
                toast.error('Không thể xóa sản phẩm. Dữ liệu không hợp lệ.');
                return;
            }

            console.log('Deleting cart_item_id:', item.cart_item_id);
            
            // ✅ Fallback: Sử dụng item.id nếu cart_item_id không có
            const itemIdToDelete = item.cart_item_id || item.id;
            console.log('Final item ID to delete:', itemIdToDelete);
            
            await apiCartService.deleteItem(itemIdToDelete, userId);
            
            const updatedItems = cartItems.filter(item => item.id !== id);
            console.log('Updated items after removal:', updatedItems);
            
            setCartItems(updatedItems);
            updateCartInRedux(updatedItems);
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng.');
        } catch (error) {
            console.error('Error deleting item:', error);
            
            // ✅ BACKUP: Nếu API thất bại, vẫn xóa ở local state
            const updatedItems = cartItems.filter(item => item.id !== id);
            setCartItems(updatedItems);
            updateCartInRedux(updatedItems);
            
            toast.warning('Đã xóa sản phẩm khỏi giỏ hàng (local). Có thể cần reload trang để đồng bộ.');
        }
    };

    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        const updatedItems = cartItems.map(item => ({
            ...item,
            selected: isChecked
        }));
        const total = updatedItems.reduce(
            (totalItem, item) => totalItem + (item.selected ? Number(item.quantity) : 0),
            0
        );
        setItemCount(total);
        setCartItems(updatedItems);
        updateCartInRedux(updatedItems);
    };

    const handleSelectItem = (id, isChecked) => {
        const updatedItems = cartItems.map(item =>
            item.id === id ? { ...item, selected: isChecked } : item
        );
        setCartItems(updatedItems);

        const allSelected = updatedItems.every(item => item.selected);
        const total = updatedItems.reduce(
            (totalItem, item) => totalItem + (item.selected ? Number(item.quantity) : 0),
            0
        );
        setItemCount(total);
        setSelectAll(allSelected);
        updateCartInRedux(updatedItems);
    };

    const getTotalPrice = () => {
        return cartItems
            .filter(item => item.selected)
            .reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const performCheckout = () => {
        const selectedItems = cartItems.filter(item => item.selected);
        if (selectedItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
            return;
        }
        startTransition(() => {
            navigate('/checkout', { state: { selectedItems } });
        });
    };

    const handleCheckout = () => {
        checkAuthBeforeCheckout(user, isAuthenticated, navigate, performCheckout);
    };

    const handleRemoveAllCart = async () => {
        if (!isAuthenticated || !user) {
            toast.error('Vui lòng đăng nhập để xóa giỏ hàng.');
            return;
        }

        try {
            const profileResponse = await userService.getProfile();
            const userId = profileResponse.data.id;
            for (const item of cartItems) {
                if (item.cart_item_id) {
                    await apiCartService.deleteItem(item.cart_item_id, userId);
                }
            }
            dispatch(clearCart());
            setCartItems([]);
            setItemCount(0);
            toast.success('Đã xóa tất cả sản phẩm trong giỏ hàng.');
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Không thể xóa giỏ hàng. Vui lòng thử lại.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="hebekery-cart-container">
            <div className="hebekery-cart-header">
                <h1 className="hebekery-cart-title">
                    <FaShoppingCart className="me-3" />
                    GIỎ HÀNG CỦA BẠN
                </h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>Quản lý sản phẩm và thanh toán dễ dàng</p>
            </div>

            <div className="hebekery-promotion-banner">
                🎉 Miễn phí vận chuyển đơn từ 500k - Ưu đãi đặc biệt cho khách hàng thân thiết! 🎉
            </div>

            {cartItems.length === 0 ? (
                <div className="hebekery-empty-cart">
                    <FaShoppingCart size={60} color="#ccc" />
                    <h3>Giỏ hàng của bạn đang trống</h3>
                    <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                    <Link
                        to="/"
                        className="hebekery-continue-shopping"
                        onClick={(e) => {
                            e.preventDefault();
                            startTransition(() => navigate('/'));
                        }}
                    >
                        <FaHome className="me-2" />
                        Tiếp tục mua sắm
                    </Link>
                </div>
            ) : (
                <div className="hebekery-cart-content">
                    <div className="hebekery-cart-items">
                        <div className="hebekery-select-all">
                            <Form.Check
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                                id="select-all"
                            />
                            <label htmlFor="select-all">Chọn tất cả ({cartItems.length} sản phẩm)</label>
                        </div>

                        {cartItems.map((item) => (
                            <div key={item.id} className="hebekery-cart-item">
                                <Form.Check
                                    type="checkbox"
                                    checked={item.selected}
                                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                                    className="hebekery-item-checkbox"
                                />

                                <img
                                    src={item.avatar || '/images/default-product.png'}
                                    alt={item.name}
                                    className="hebekery-item-image"
                                />

                                <div className="hebekery-item-details">
                                    <h4 className="hebekery-item-name">{item.name}</h4>
                                    <div className="hebekery-item-price">{formatPrice(item.price)}</div>

                                    <div className="hebekery-quantity-controls">
                                        <button
                                            className="hebekery-quantity-btn"
                                            onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                        >
                                            <FaMinus />
                                        </button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            min="1"
                                            onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                                            className="hebekery-quantity-input"
                                        />
                                        <button
                                            className="hebekery-quantity-btn"
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="hebekery-remove-btn"
                                    onClick={() => handleRemoveItem(item.id)}
                                >
                                    <FaTrashAlt />
                                    Xóa
                                </button>
                            </div>
                        ))}

                        <Link
                            to="/"
                            className="hebekery-continue-shopping"
                            onClick={(e) => {
                                e.preventDefault();
                                startTransition(() => navigate('/'));
                            }}
                        >
                            <FaHome className="me-2" />
                            Tiếp tục mua sắm
                        </Link>
                    </div>

                    <div className="hebekery-cart-summary">
                        <h3 className="hebekery-summary-title">TỔNG TIỀN</h3>

                        <div className="hebekery-shipping-info">
                            <h6>🚚 Thông tin vận chuyển & Ưu đãi</h6>
                            <div className="hebekery-shipping-option">
                                <span>FREESHIP toàn quốc đơn từ 500k</span>
                                <span style={{ color: '#1976d2', fontWeight: 'bold' }}>Miễn phí</span>
                            </div>
                            <div className="hebekery-shipping-option">
                                <span>GIẢM 5% đơn từ 200k - Mã HOME5</span>
                                <span style={{ color: '#1976d2', fontWeight: 'bold' }}>-5%</span>
                            </div>
                            <div className="hebekery-shipping-option">
                                <span>GIẢM 50k đơn từ 1tr - Mã HOME50</span>
                                <span style={{ color: '#1976d2', fontWeight: 'bold' }}>-50k</span>
                            </div>
                            <div className="hebekery-shipping-option">
                                <span>GIẢM 100k đơn từ 2tr - Mã HOME100</span>
                                <span style={{ color: '#1976d2', fontWeight: 'bold' }}>-100k</span>
                            </div>
                            <div className="hebekery-shipping-option">
                                <span>Bảo hành chính hãng & Đổi trả 7 ngày</span>
                                <span style={{ color: '#1976d2', fontWeight: 'bold' }}>✓</span>
                            </div>
                        </div>

                        <div className="hebekery-summary-row">
                            <span>Số lượng sản phẩm:</span>
                            <span>{itemCount}</span>
                        </div>

                        <div className="hebekery-summary-row">
                            <span>Tổng tiền:</span>
                            <span>{formatPrice(getTotalPrice())}</span>
                        </div>

                        <button
                            className="hebekery-checkout-btn"
                            onClick={handleCheckout}
                            disabled={itemCount === 0}
                        >
                            ĐẶT HÀNG NGAY
                            <br />
                            <small>Thanh toán an toàn & bảo mật</small>
                        </button>

                        <button
                            className="hebekery-clear-cart"
                            onClick={handleRemoveAllCart}
                        >
                            Xóa tất cả
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;