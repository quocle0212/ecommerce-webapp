import React, {useState, useEffect, useCallback} from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import apiOrderService from '../../../api/apiOrderService';
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {useNavigate, useLocation} from "react-router-dom";
import CheckoutSummary from "../../components/cart/CheckoutSummary";
import CheckoutForm from "../../components/cart/CheckoutForm"; // Đường dẫn API của bạn
import { clearCart } from '../../../redux/slices/cartSlice';
import { toast, ToastContainer } from 'react-toastify';
import { validateCheckoutForm, validateField } from '../../../helpers/validationHelpers';
import { checkAuthAndRedirect } from '../../../helpers/authHelpers';
import apiCartService from '../../../api/apiCartService';
import userService from '../../../api/userService';
import { addToCart } from '../../../redux/slices/cartSlice';

const Checkout = () => {

    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const reduxCartItems = useSelector((state) => state.cart.items); // ✅ Thêm Redux cart items
    const location = useLocation(); // ✅ Thêm để nhận React Router state
    
    const [userInfo, setUserInfo] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        email: user?.email || '',
    });
    
    // Thêm state cho validation errors
    const [errors, setErrors] = useState({});
    
    const dispatch = useDispatch();

    console.info("===========[] ===========[userInfo] : ",userInfo);

    const [cartItems, setCartItems] = useState([]); // Danh sách sản phẩm trong giỏ hàng
    const [shippingMethod, setShippingMethod] = useState('localPickup');
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const taxRate = 0;
    const shippingFee = 0;

    const navigate = useNavigate();

    // Kiểm tra đăng nhập khi vào trang checkout
    useEffect(() => {
        if (!checkAuthAndRedirect(user, isAuthenticated, navigate, '/checkout', 'Vui lòng đăng nhập để thực hiện thanh toán')) {
            return; // Đã chuyển hướng đến login
        }
    }, [user, isAuthenticated, navigate]);

    // Function để validate tất cả các trường sử dụng helper
    const validateAllFields = () => {
        const validation = validateCheckoutForm(userInfo, paymentMethod);
        setErrors(validation.errors);
        return validation.isValid;
    };

    // ✅ FIX: Lấy giỏ hàng từ React Router state, fallback về localStorage và Redux
    useEffect(() => {
        console.log('=== DEBUG CHECKOUT CART LOADING ===');
        
        // 1. Ưu tiên: Lấy từ React Router state (từ Cart)
        const selectedItemsFromState = location.state?.selectedItems;
        console.log('selectedItemsFromState:', selectedItemsFromState);
        
        if (selectedItemsFromState && selectedItemsFromState.length > 0) {
            console.log('✅ Using selected items from Cart navigation');
            setCartItems(selectedItemsFromState);
            return;
        }
        
        // 2. Fallback: Lấy từ localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            console.log("=========== CART from localStorage: ", savedCart);
            try {
                const parsedCart = JSON.parse(savedCart);
				const itemsWithSelected = parsedCart?.items?.filter(item => item.selected);
                console.log('itemsWithSelected from localStorage:', itemsWithSelected);
                
                if (itemsWithSelected && itemsWithSelected.length > 0) {
                    console.log('✅ Using selected items from localStorage');
				setCartItems(itemsWithSelected);
                    return;
                }
                
                // ✅ FALLBACK: Nếu localStorage có items nhưng không có selected, lấy tất cả
                if (parsedCart?.items && parsedCart.items.length > 0) {
                    console.log('⚠️ Using all items from localStorage (no selection)');
                    setCartItems(parsedCart.items);
                    return;
                }
            } catch (error) {
                console.error('Không thể phân tích dữ liệu giỏ hàng từ localStorage:', error);
            }
        }
        
        // 3. Fallback cuối: Lấy từ Redux (tất cả items)
        if (reduxCartItems && reduxCartItems.length > 0) {
            console.log('⚠️ Using all items from Redux as fallback');
            setCartItems(reduxCartItems);
            return;
        }
        
        // 4. Không có dữ liệu gì
        console.log('❌ No cart data found');
        toast.error('Không tìm thấy sản phẩm nào. Vui lòng quay lại giỏ hàng.');
    }, [location.state, reduxCartItems]);

    // ✅ DEBUG: Log cart items changes
    // ✅ FIX: Tính tổng tiền sản phẩm - trả về number
    const getTotalPrice = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cartItems]);

    useEffect(() => {
        console.log('=== CART ITEMS UPDATED ===');
        console.log('Cart items count:', cartItems.length);
        console.log('Cart items:', cartItems);
        console.log('Total price:', getTotalPrice());
    }, [cartItems, getTotalPrice]);

    // Lấy phương thức thanh toán từ API
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const response = await apiOrderService.getPaymentMethods();
                if (response?.data?.data) {
                    const methods = response.data.data;
                    setPaymentMethods(methods);
                    const defaultMethod = methods.find((method) => method.is_default === true);
                    setPaymentMethod(defaultMethod?.id || methods[0]?.id || '');
                }
            } catch (error) {
                console.error('Lỗi khi lấy phương thức thanh toán:', error);
            }
        };

        fetchPaymentMethods();
    }, []);

    const handleUserInfoChange = (e) => {
        const {name, value} = e.target;
        setUserInfo({...userInfo, [name]: value});
        
        // Clear error cho field đang được edit và validate tức thì
        if (errors[name]) {
            setErrors({...errors, [name]: ''});
        }
        
        // Validate tức thì khi user nhập
        setTimeout(() => {
            validateFieldRealTime(name, value);
        }, 500); // Delay 500ms để tránh validate quá nhiều lần
    };

    const validateFieldRealTime = (fieldName, value) => {
        const error = validateField(fieldName, value);
        
        if (error) {
            setErrors(prev => ({...prev, [fieldName]: error}));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate tất cả các trường trước khi submit
        if (!validateAllFields()) {
            toast.error('Vui lòng kiểm tra lại thông tin và điền đầy đủ các trường bắt buộc');
            return;
        }
        
        console.log('=== DEBUG ORDER SUBMISSION ===');
        console.log('Cart items for order:', cartItems);
        console.log('Thông tin người dùng:', userInfo);
        console.log('Phương thức vận chuyển:', shippingMethod);
        console.log('Phương thức thanh toán:', paymentMethod);

        setIsLoading(true); // Hiển thị loading
        try {
            // ✅ FIX: Đảm bảo products data đúng format
            const productsForOrder = cartItems.map(item => ({
                id: item.product_id || item.id, // Sử dụng product_id nếu có, fallback về id
                quantity: item.quantity,
                price: item.price // Thêm price để backend tính toán
            }));
            
            console.log('Products for order:', productsForOrder);

            const orderData = {
                user_id: user?.id,
				meta_data: {
					user_name: userInfo.name,
					user_email: userInfo.email,
					user_phone: userInfo.phone,
					user_address: userInfo.address,
				},
                products: productsForOrder,
                shipping_fee: shippingFee,
                total_amount: getTotalPrice(),
                payment_method_id: paymentMethod
            };

            console.log('Final order data:', orderData);

			if(orderData?.products?.length <= 0) {
				setIsLoading(false);
				toast.error("Vui lòng chọn sản phẩm thanh toán");
				return;
			}

            const response = await apiOrderService.add(orderData);
            console.info("===========[] ===========[response.status] : ",response.status);
			setIsLoading(false);
            if (response.status === "success") {
                // ✅ FIX: Chỉ xóa sản phẩm đã đặt hàng, không xóa toàn bộ cart
                await removeOrderedItemsFromCart(cartItems);
                
                // Clear checkout state
                setCartItems([]);
                
                if(paymentMethod !== 1) {
                    try {
                        let newData = {
                            order_id: response?.data.data.id,
                            url_return: 'http://localhost:3000/checkout/success',
                            amount: response?.data.data.sub_total,
                            service_code: "hotel",
                            url_callback: 'http://localhost:3000/checkout/failure'
                        }
                        const responsePayment = await axios.post("https://123code.net/api/v1/payment/add", newData);
                        setIsLoading(false);
                        console.info("===========[] ===========[123code] : ",response);
                        window.location.href = responsePayment.data.link
                        return;
                    } catch (err) {
                        console.info("===========[handleSubmit order] ===========[] : ",err);
                    }
                }

                navigate('/checkout/alert-success');
            } else {
				toast.error(response?.message || 'Có lỗi xảy ra trong quá trình tạo đơn hàng');
            }
        } catch (error) {
            console.error('Thanh toán thất bại:', error);
            toast.error('Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // Tính tổng tiền tạm tính
    const getSubTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    // Tính thuế
    const calculateTax = (subtotal) => {
        return subtotal * taxRate;
    };

    const handlePaymentChange = (id) => {
        console.log('Phương thức thanh toán được chọn:', id);
        setPaymentMethod(id);
    };

    // Tính tổng tiền cuối cùng
    const calculateTotal = (subtotal, tax, shippingFee) => {
        return subtotal + tax + shippingFee - discountAmount;
    };

    // Xử lý khi người dùng nhấn "Áp dụng" mã giảm giá
    const handleApplyDiscount = () => {
        if (discountCode === 'SALE10') {
            setDiscountAmount(getSubTotal() * 0.1); // Giảm 10%
        } else {
            alert('Mã giảm giá không hợp lệ!');
        }
    };

    const subtotal = getSubTotal();
    const tax = calculateTax(subtotal);
    const total = calculateTotal(subtotal, tax, shippingFee);



    // ✅ Helper function: Xóa sản phẩm đã đặt hàng khỏi cart
    const removeOrderedItemsFromCart = async (orderedItems) => {
        try {
            console.log('=== REMOVING ORDERED ITEMS FROM CART ===');
            console.log('Ordered items:', orderedItems);
            
            // 1. Lấy cart hiện tại từ Redux
            const currentCartItems = reduxCartItems || [];
            console.log('Current cart items:', currentCartItems);
            
            // 2. Tạo danh sách items còn lại (chưa được đặt hàng)
            const remainingItems = currentCartItems.filter(cartItem => {
                // Kiểm tra xem item này có trong danh sách đã đặt hàng không
                const isOrdered = orderedItems.some(orderedItem => {
                    // So sánh theo product_id hoặc id
                    const orderedProductId = orderedItem.product_id || orderedItem.id;
                    const cartProductId = cartItem.product_id || cartItem.id;
                    return orderedProductId === cartProductId;
                });
                return !isOrdered; // Giữ lại những item KHÔNG được đặt hàng
            });
            
            console.log('Remaining items after filter:', remainingItems);
            
            // 3. Cập nhật Redux cart
            dispatch(clearCart()); // Xóa hết trước
            remainingItems.forEach(item => {
                dispatch(addToCart({
                    id: item.id,
                    product_id: item.product_id,
                    name: item.name,
                    price: item.price,
                    avatar: item.avatar,
                    quantity: item.quantity,
                    stock: item.stock,
                    cart_item_id: item.cart_item_id
                }));
            });
            
            // 4. Cập nhật localStorage
            const updatedCartData = {
                items: remainingItems,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('cart', JSON.stringify(updatedCartData));
            
            // 5. Xóa các cart items đã đặt hàng từ backend
            if (isAuthenticated && user) {
                const userProfile = await userService.getProfile();
                const userId = userProfile.data.id;
                
                for (const orderedItem of orderedItems) {
                    if (orderedItem.cart_item_id) {
                        try {
                            await apiCartService.deleteItem(orderedItem.cart_item_id, userId);
                            console.log(`✅ Deleted cart item ${orderedItem.cart_item_id} from backend`);
                        } catch (error) {
                            console.error(`❌ Failed to delete cart item ${orderedItem.cart_item_id}:`, error);
                        }
                    }
                }
            }
            
            console.log('✅ Successfully removed ordered items from cart');
            toast.success(`Đã xóa ${orderedItems.length} sản phẩm đã đặt hàng khỏi giỏ hàng`);
            
        } catch (error) {
            console.error('❌ Error removing ordered items from cart:', error);
            // Fallback: xóa toàn bộ nếu có lỗi
            dispatch(clearCart());
            localStorage.removeItem('cart');
        }
    };

    return (
        <Container>
            <h1 className="my-4">Thanh toán</h1>
            
            {/* ✅ Hiển thị warning nếu không có sản phẩm */}
            {cartItems.length === 0 ? (
                <div className="text-center my-5">
                    <h3>Không có sản phẩm nào để thanh toán</h3>
                    <p>Vui lòng quay lại giỏ hàng và chọn sản phẩm.</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/cart')}
                    >
                        Quay lại giỏ hàng
                    </button>
                </div>
            ) : (
            <Row>
                <Col md={7}>
                    <CheckoutForm
                        userInfo={userInfo}
                        handleUserInfoChange={handleUserInfoChange}
                        shippingMethod={shippingMethod}
                        setShippingMethod={setShippingMethod}
                        paymentMethods={paymentMethods}
                        paymentMethod={paymentMethod}
                        handlePaymentChange={handlePaymentChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        errors={errors}
                    />
                </Col>
                <Col md={5}>
                    <CheckoutSummary
                        cartItems={cartItems}
                        subtotal={subtotal}
                        tax={tax}
                        shippingFee={shippingFee}
                        discountAmount={discountAmount}
                        total={total}
                        discountCode={discountCode}
                        setDiscountCode={setDiscountCode}
                        handleApplyDiscount={handleApplyDiscount}
                    />
                </Col>
            </Row>
            )}
						<ToastContainer position="top-right" autoClose={3000} />
			
        </Container>
    );
};

export default Checkout;
