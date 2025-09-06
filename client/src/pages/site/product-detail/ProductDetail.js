import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Form, Breadcrumb } from 'react-bootstrap';
import { FaTruck, FaShieldAlt, FaExchangeAlt, FaMinus, FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, setAllCart } from '../../../redux/slices/cartSlice';
import apiProductService from '../../../api/apiProductService';
import { formatPrice, renderStarsItem } from '../../../helpers/formatters';
import '../style/ProductDetail.css';
import apiVoteService from '../../../api/apiVoteService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkAuthBeforeAddToCart, checkAuthBeforeBuyNow } from '../../../helpers/authHelpers';
import userService from '../../../api/userService';
import apiCartService from '../../../api/apiCartService';

const DashboardVoteProduct = React.lazy(() => import('../../components/vote/DashboardVoteProduct'));
const RelatedProducts = React.lazy(() => import('../../components/product/RelatedProducts'));

const ProductDetail = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [votes, setVotes] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isLoadingRelated, setIsLoadingRelated] = useState(true);
    const [isAdding, setIsAdding] = useState(false); // Loading state for add-to-cart
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector(state => state.cart.items);
    const user = useSelector(state => state.auth.user);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [slug]);

    useEffect(() => {
        const fetchProduct = async () => {
            if (slug) {
                const id = slug.split('-').pop();
                try {
                    const response = await apiProductService.showProductDetail(id);
                    console.log('=== API RESPONSE ===');
                    console.log('Full response:', response);
                    console.log('Product data:', response.data.data);
                    console.log('Product number (stock):', response.data.data.number);
                    console.log('Product number type:', typeof response.data.data.number);
                    setProduct(response.data.data);
                } catch (error) {
                    console.error('Error fetching product:', error);
                }
            }
        };

        const getProducts = async () => {
            const productsResponse = await apiProductService.getLists({
                page: 1,
                page_size: 10,
            });
            setRelatedProducts(productsResponse.data.data);
            setTimeout(() => setIsLoadingRelated(false), 2000);
        };

        const getListsVote = async () => {
            if (slug) {
                const id = slug.split('-').pop();
                const votesResponse = await apiVoteService.getListsVoteProducts({
                    page: 1,
                    page_size: 10,
                    product_id: id,
                });
                setVotes(votesResponse.data.data);
                console.info('===========[] ===========[votesResponse] : ', votesResponse);
            }
        };

        fetchProduct();
        getProducts();
        getListsVote();
    }, [slug]);

    if (!product) {
        return <div className="text-center my-5">Đang tải...</div>;
    }

    const performAddToCart = async () => {
        if (isAdding) return; // Prevent multiple clicks
        setIsAdding(true);

        console.log('=== DEBUG ADD TO CART ===');
        console.log('Product:', product);
        console.log('Product.number (stock):', product.number);
        console.log('Quantity to add:', quantity);

        if (!isAuthenticated || !user) {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
            navigate('/login');
            setIsAdding(false);
            return;
        }

        try {
            const profileResponse = await userService.getProfile();
            const userId = profileResponse.data.id;
            console.log('User ID:', userId);

            const existingCartItem = cartItems.find(item => item.product_id === product.id);
            const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
            const totalQuantity = existingQuantity + quantity;

            console.log('Existing quantity in cart:', existingQuantity);
            console.log('Total quantity after adding:', totalQuantity);
            console.log('Stock check:', totalQuantity > product.number);

            if (product.number <= 0) {
                console.log('❌ Out of stock');
                toast.error('Sản phẩm đã hết hàng');
                setIsAdding(false);
                return;
            }

            if (totalQuantity > product.number) {
                console.log('❌ Total quantity exceeds stock');
                const remainingStock = product.number - existingQuantity;
                if (remainingStock <= 0) {
                    toast.error('Sản phẩm này đã đạt số lượng tối đa trong giỏ hàng');
                } else {
                    toast.error(`Chỉ có thể thêm tối đa ${remainingStock} sản phẩm nữa vào giỏ hàng`);
                }
                setIsAdding(false);
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

            console.log('Starting API call to addToCart');
            console.log('Cart data being sent:', cartData);
            
            const response = await apiCartService.addToCart(cartData);
            console.log('API call completed:', response);
            console.log('Response data:', response.data);
            console.log('Response status:', response.status);

            // Kiểm tra response structure trước khi sử dụng
            const backendData = response.data || {};
            console.log('Backend data:', backendData);
            
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
                number: product.number,
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
            console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
            const errorMessage = error.response?.data?.error || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng';
            toast.error(errorMessage);
        } finally {
            setIsAdding(false);
        }
    };

    const performBuyNow = async () => {
        if (isAdding) return;
        setIsAdding(true);

        if (!isAuthenticated || !user) {
            toast.error('Vui lòng đăng nhập để mua sản phẩm.');
            navigate('/login');
            setIsAdding(false);
            return;
        }

        try {
            const profileResponse = await userService.getProfile();
            const userId = profileResponse.data.id;
            console.log('User ID:', userId);

            const existingCartItem = cartItems.find(item => item.product_id === product.id);
            const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
            const totalQuantity = existingQuantity + quantity;

            if (product.number <= 0) {
                toast.error('Sản phẩm đã hết hàng');
                setIsAdding(false);
                return;
            }

            if (totalQuantity > product.number) {
                const remainingStock = product.number - existingQuantity;
                if (remainingStock <= 0) {
                    toast.error('Sản phẩm này đã đạt số lượng tối đa trong giỏ hàng');
                } else {
                    toast.error(`Chỉ có thể mua tối đa ${remainingStock} sản phẩm nữa`);
                }
                setIsAdding(false);
                return;
            }

            const price = product.sale ? product.price * (1 - product.sale / 100) : product.price;

            const cartData = {
                userId,
                productId: product.id,
                quantity,
                price,
            };

            console.log('Starting API call to addToCart for BuyNow');
            console.log('Cart data being sent:', cartData);
            
            const response = await apiCartService.addToCart(cartData);
            console.log('API call completed:', response);
            console.log('Response data:', response.data);

            // Kiểm tra response structure trước khi sử dụng
            const backendData = response.data || {};
            console.log('Backend data for BuyNow:', backendData);
            
            const existingCartItemForBuy = cartItems.find(item => item.product_id === product.id);
            const uniqueId = existingCartItemForBuy ? existingCartItemForBuy.id : `cart-item-${product.id}-${Date.now()}`;
            
            dispatch(addToCart({
                id: uniqueId,
                cart_id: backendData.cartId || backendData.cart_id || `cart-${userId}`,
                cart_item_id: backendData.itemId || backendData.item_id || backendData.id,
                product_id: product.id,
                name: product.name,
                avatar: product.avatar,
                price,
                quantity,
                number: product.number,
                selected: true,
            }));

            toast.success('Đã thêm sản phẩm vào giỏ hàng, đang chuyển đến trang thanh toán');
            setTimeout(() => {
                navigate('/checkout');
            }, 1000);
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
            const errorMessage = error.response?.data?.error || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng';
            toast.error(errorMessage);
        } finally {
            setIsAdding(false);
        }
    };

    const handleAddToCart = async () => {
        await checkAuthBeforeAddToCart(user, isAuthenticated, navigate, performAddToCart, product, quantity);
    };

    const handleOrder = async () => {
        await checkAuthBeforeBuyNow(user, isAuthenticated, navigate, performBuyNow, product, quantity);
    };

    const colors = ['primary', 'secondary', 'success', 'danger', 'info'];
    const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

    return (
        <>
            <div className="breadcrumb-section">
                <Container>
                    <Breadcrumb>
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
                            Trang chủ
                        </Breadcrumb.Item>
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/san-pham' }}>
                            Sản phẩm
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            {product.name}
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </Container>
            </div>

            <Container className="product-detail-container">
                <div className="product-detail-card">
                    <Row>
                        <Col lg={5} md={6}>
                            <div className="product-images">
                                <img
                                    src={product.images?.[selectedImage] || product.avatar}
                                    alt={product.name}
                                    className="main-image"
                                />
                                <div className="image-thumbnails">
                                    {product.images?.map((image, idx) => (
                                        <img
                                            key={idx}
                                            src={image}
                                            alt={`${product.name} - ${idx + 1}`}
                                            className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                                            onClick={() => setSelectedImage(idx)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </Col>
                        <Col lg={7} md={6}>
                            <div className="product-info">
                                <div className="d-flex align-items-center mb-3">
                                    {product?.labels.map((label) => (
                                        <Badge key={label.id} bg={getRandomColor()} className="me-2">
                                            {label.name}
                                        </Badge>
                                    ))}
                                    <span className={`stock-status ${product.number > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {product.number > 0 ? 'Còn hàng' : 'Hết hàng'}
                                    </span>
                                </div>

                                <h1 className="product-title">
                                    {product.name}
                                </h1>

                                <div className="product-rating">
                                    <div className="rating">
                                        {product.total_rating_score > 0 ? (
                                            renderStarsItem(product.total_rating_score / product.total_vote_count)
                                        ) : (
                                            renderStarsItem(0)
                                        )}
                                    </div>
                                    <span className="rating-count">({product.total_vote_count} đánh giá)</span>
                                </div>

                                <div className="product-price">
                                    {product.sale ? (
                                        <>
                                            <span className="current-price">{formatPrice(product.price * (1 - product.sale / 100))}</span>
                                            <span className="original-price">{formatPrice(product.price)}</span>
                                            <span className="discount-percent">-{product.sale}%</span>
                                        </>
                                    ) : (
                                        <span className="current-price">{formatPrice(product.price)}</span>
                                    )}
                                </div>

                                <div className="delivery-info">
                                    <h6><FaTruck className="me-2" />Thông tin vận chuyển</h6>
                                    <div>
                                        <Badge bg="success" className="me-2">Giao hàng nhanh</Badge>
                                        <span>Miễn phí vận chuyển cho đơn hàng từ 500k</span>
                                    </div>
                                </div>

                                <div className="product-actions">
                                    <div className="quantity-selector">
                                        <span className="quantity-label">Số lượng:</span>
                                        <div className="quantity-controls">
                                            <button
                                                className="quantity-btn"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                disabled={quantity <= 1 || isAdding}
                                            >
                                                <FaMinus />
                                            </button>
                                            <Form.Control
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => {
                                                    const newQuantity = parseInt(e.target.value) || 1;
                                                    const existingCartItem = cartItems.find(item => item.product_id === product.id);
                                                    const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
                                                    const maxAllowedQuantity = product.number - existingQuantity;
                                                    const finalQuantity = Math.min(newQuantity, maxAllowedQuantity);
                                                    setQuantity(Math.max(1, finalQuantity));
                                                }}
                                                className="quantity-input"
                                                min="1"
                                                max={(() => {
                                                    const existingCartItem = cartItems.find(item => item.product_id === product.id);
                                                    const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
                                                    return Math.max(1, product.number - existingQuantity);
                                                })()}
                                                disabled={isAdding}
                                            />
                                            <button
                                                className="quantity-btn"
                                                onClick={() => {
                                                    const existingCartItem = cartItems.find(item => item.product_id === product.id);
                                                    const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
                                                    const maxAllowedQuantity = product.number - existingQuantity;
                                                    setQuantity(Math.min(quantity + 1, maxAllowedQuantity));
                                                }}
                                                disabled={(() => {
                                                    const existingCartItem = cartItems.find(item => item.product_id === product.id);
                                                    const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
                                                    return quantity >= (product.number - existingQuantity) || isAdding;
                                                })()}
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                        {product.number > 0 && (
                                            <small className="text-muted">
                                                {(() => {
                                                    const existingCartItem = cartItems.find(item => item.product_id === product.id);
                                                    const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
                                                    const remainingStock = product.number - existingQuantity;
                                                    if (existingQuantity > 0) {
                                                        return `Còn lại: ${remainingStock} sản phẩm (${existingQuantity} đã có trong giỏ)`;
                                                    } else {
                                                        return `Còn lại: ${product.number} sản phẩm`;
                                                    }
                                                })()}
                                            </small>
                                        )}
                                    </div>

                                    <div className="action-buttons">
                                        <Button
                                            className="add-to-cart-btn"
                                            disabled={product.number === 0 || isAdding}
                                            onClick={handleAddToCart}
                                        >
                                            {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                                        </Button>
                                        <Button
                                            className="buy-now-btn"
                                            disabled={product.number === 0 || isAdding}
                                            onClick={handleOrder}
                                        >
                                            {isAdding ? 'Đang xử lý...' : 'Mua ngay'}
                                        </Button>
                                    </div>

                                    <div className="product-policies">
                                        <div className="d-flex align-items-center mb-2">
                                            <FaTruck className="me-2 text-success" />
                                            <span>Giao hàng toàn quốc</span>
                                        </div>
                                        <div className="d-flex align-items-center mb-2">
                                            <FaShieldAlt className="me-2 text-success" />
                                            <span>Bảo hành chính hãng</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <FaExchangeAlt className="me-2 text-success" />
                                            <span>Đổi trả trong 7 ngày</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className="product-tabs">
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>

                <DashboardVoteProduct product={product} votes={votes} />
                <RelatedProducts relatedProducts={relatedProducts} isLoading={isLoadingRelated} />
                <ToastContainer position="top-right" autoClose={3000} />
            </Container>
        </>
    );
};

export default ProductDetail;