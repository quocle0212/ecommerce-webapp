import React, { useEffect, useState } from 'react';
import { Carousel, Card, Button, Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { formatPrice, createSlug, renderStarsItem } from '../../../helpers/formatters';
import ContentLoader from "react-content-loader";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import { checkAuthBeforeAddToCart } from '../../../helpers/authHelpers';
import userService from '../../../api/userService';
import apiCartService from '../../../api/apiCartService';

const RelatedProductsLoader = () => (
    <Row>
        {Array.from({ length: 6 }).map((_, idx) => (
            <Col key={idx} xs={12} sm={6} md={4} lg={2} className="mb-3">
                <ContentLoader
                    speed={2}
                    width="100%"
                    height={200}
                    viewBox="0 0 200 200"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                >
                    <rect x="0" y="0" rx="5" ry="5" width="100%" height="120" />
                    <rect x="0" y="130" rx="5" ry="5" width="100%" height="20" />
                    <rect x="0" y="160" rx="5" ry="5" width="80%" height="20" />
                </ContentLoader>
            </Col>
        ))}
    </Row>
);

const RelatedProducts = ({ relatedProducts, isLoading }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Lấy thông tin đăng nhập và giỏ hàng từ Redux
    const user = useSelector(state => state.auth.user);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const cartItems = useSelector(state => state.cart.items);
    // ✅ FIX: State riêng để track trạng thái "đang thêm" của từng sản phẩm
    const [addingProducts, setAddingProducts] = useState({});

    // Function thực tế để thêm vào giỏ hàng (được gọi sau khi đã kiểm tra đăng nhập)
    const performAddToCart = async (product, quantity) => {
        const productId = product.id;
        if (addingProducts[productId]) return; // Prevent multiple clicks for this specific product
        
        setAddingProducts(prev => ({ ...prev, [productId]: true }));

        console.log('=== DEBUG ADD TO CART (RelatedProducts) ===');
        console.log('Product:', product);
        console.log('Product.number (stock):', product.number);
        console.log('Quantity to add:', quantity);

        try {
            const profileResponse = await userService.getProfile();
            const userId = profileResponse.data.id;
            console.log('User ID:', userId);

            const existingCartItem = cartItems.find(item => item.product_id === product.id);
            const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
            const totalQuantity = existingQuantity + quantity;

            // Parse product.number to ensure it's a number
            const stock = parseInt(product.number, 10);

            console.log('Parsed stock:', stock);
            console.log('Existing quantity in cart:', existingQuantity);
            console.log('Total quantity after adding:', totalQuantity);
            console.log('Stock check:', totalQuantity > stock);

            if (isNaN(stock) || stock <= 0) {
                console.log('❌ Out of stock');
                toast.error('Sản phẩm đã hết hàng');
                setAddingProducts(prev => ({ ...prev, [productId]: false }));
                return;
            }

            if (totalQuantity > stock) {
                console.log('❌ Total quantity exceeds stock');
                const remainingStock = stock - existingQuantity;
                if (remainingStock <= 0) {
                    toast.error('Sản phẩm này đã đạt số lượng tối đa trong giỏ hàng');
                } else {
                    toast.error(`Chỉ có thể thêm tối đa ${remainingStock} sản phẩm nữa vào giỏ hàng`);
                }
                setAddingProducts(prev => ({ ...prev, [productId]: false }));
                return;
            }

            const price = product.sale ? product.price * (1 - product.sale / 100) : product.price;

            console.log('✅ Stock check passed, adding to cart');
            const cartData = {
                userId,
                productId: product.id,
                quantity,
                price,
            };

            console.log('Sending cart data:', cartData);
            const response = await apiCartService.addToCart(cartData);
            console.log('API call completed:', response);
            console.log('Response data:', response.data);

            // Kiểm tra response structure trước khi sử dụng
            const backendData = response.data || {};
            console.log('Backend data (RelatedProducts):', backendData);
            
            // Tạo unique ID cho cart item
            const uniqueId = existingCartItem ? existingCartItem.id : `cart-item-${product.id}-${Date.now()}`;
            
            // Dispatch với data structure cơ bản
            dispatch(addToCart({
                id: uniqueId,
                cart_id: backendData.cartId || backendData.cart_id || `cart-${userId}`,
                cart_item_id: backendData.itemId || backendData.item_id || backendData.id,
                product_id: product.id,
                name: product.name,
                avatar: product.avatar,
                price,
                quantity,
                number: stock,
                selected: true,
            }));

            // Hiển thị thông báo thành công
            if (backendData.isUpdate || (existingCartItem && backendData.newQuantity)) {
                const newQty = backendData.newQuantity || (existingQuantity + quantity);
                toast.success(`Đã cập nhật số lượng sản phẩm thành ${newQty}`);
            } else {
                toast.success('Đã thêm sản phẩm vào giỏ hàng');
            }
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            const errorMessage = error.response?.data?.error || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng';
            toast.error(errorMessage);
        } finally {
            setAddingProducts(prev => ({ ...prev, [productId]: false }));
        }
    };

    // Hàm xử lý thêm vào giỏ hàng (với kiểm tra đăng nhập)
    const handleAddToCart = (product) => {
        checkAuthBeforeAddToCart(user, isAuthenticated, navigate, performAddToCart, product, 1);
    };

    return (
        <section className="related-products-section">
            <Container>
                <div className="section-header text-center mb-5">
                    <h2 className="section-title">SẢN PHẨM LIÊN QUAN</h2>
                    <p className="section-subtitle">Khám phá thêm những sản phẩm tương tự</p>
                </div>

                {isLoading ? (
                    <RelatedProductsLoader />
                ) : (
                    <div className="hebekery-products-grid">
                        {relatedProducts.slice(0, 8).map((product, idx) => (
                            <div key={idx} className="hebekery-product-card">
                                <div className="hebekery-product-image-wrapper">
                                    <Link to={`/p/${createSlug(product.name)}-${product.id}`}>
                                        <img
                                            src={product.avatar}
                                            alt={product.name}
                                            className="hebekery-product-image"
                                        />
                                    </Link>
                                    {/* Badge cho sản phẩm nổi bật */}
                                    {idx < 2 && (
                                        <div className="hebekery-product-badge">
                                            <span className="badge-text">{idx + 1}+</span>
                                        </div>
                                    )}
                                </div>

                                <div className="hebekery-product-info">
                                    <Link
                                        to={`/p/${createSlug(product.name)}-${product.id}`}
                                        className="hebekery-product-title"
                                    >
                                        {product.name}
                                    </Link>

                                    <div className="hebekery-product-rating">
                                        {product.total_rating_score > 0 ? (
                                            renderStarsItem(product.total_rating_score / product.total_vote_count)
                                        ) : (
                                            renderStarsItem(0)
                                        )}
                                    </div>

                                    <div className="hebekery-product-price">
                                        <span className="current-price">{formatPrice(product.sale ? product.price * (1 - product.sale / 100) : product.price)}</span>
                                        {product.sale > 0 && (
                                            <span className="original-price">{formatPrice(product.price)}</span>
                                        )}
                                    </div>

                                    <button
                                        className={`hebekery-product-status ${product.number > 0 ? 'available' : 'unavailable'}`}
                                        disabled={parseInt(product.number, 10) <= 0 || addingProducts[product.id]}
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        {addingProducts[product.id] ? 'Đang thêm...' : (parseInt(product.number, 10) > 0 ? 'Thêm vào giỏ' : 'Hết hàng')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </section>
    );
};

export default RelatedProducts;