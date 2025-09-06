import React, { useEffect, useState } from "react";
import apiProductService from "../../../api/apiProductService";
import categoryService from "../../../api/categoryService";
import { Card, Col, Container, Nav, Row, Button, Carousel } from "react-bootstrap";
import ContentLoader from "react-content-loader";
import { Link, useNavigate } from "react-router-dom";
import { createSlug, formatPrice, renderStarsItem } from "../../../helpers/formatters";
import "../style/Home.css";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import { checkAuthBeforeAddToCart } from '../../../helpers/authHelpers';
import userService from '../../../api/userService';
import apiCartService from '../../../api/apiCartService';

const ProductCarousel = React.lazy(() =>
  import("../../components/product/ProductCarousel")
);
const LoadingProductSkeleton = React.lazy(() =>
  import("../../components/loading/LoadingProductSkeleton")
);

const CategoryLoader = () => {
  return (
    <Row className="gy-4">
      {[...Array(6)].map((_, index) => (
        <Col key={index} xs={6} sm={4} md={3} lg={2}>
          <div className="category-skeleton"></div>
        </Col>
      ))}
    </Row>
  );
};

const ProductLoader = () => {
  return (
    <Row className="gy-4">
      {[...Array(8)].map((_, index) => (
        <Col key={index} xs={6} sm={6} md={4} lg={3}>
          <div className="product-skeleton"></div>
        </Col>
      ))}
    </Row>
  );
};

const Home = () => {
  const [categoryProducts, setCategoryProducts] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [addingProducts, setAddingProducts] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Lấy thông tin đăng nhập và giỏ hàng từ Redux
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const cartItems = useSelector(state => state.cart.items);

  useEffect(() => {
    let isMounted = true;

    const loadCategoriesAndProducts = async () => {
      setLoading(true);
      try {
        const categoriesResponse = await categoryService.getListsGuest({
          page: 1,
          page_size: 3,
        });
        if (!isMounted) return;

        const categories = categoriesResponse.data.data;
        const productsByCategory = {};

        await Promise.all(
          categories.map(async (category) => {
            const productsResponse = await apiProductService.getLists({
              page: 1,
              page_size: 10,
              category_id: category.id,
            });
            if (!isMounted) return;
            productsByCategory[category.name] = productsResponse?.data?.data;
          })
        );

        if (isMounted) setCategoryProducts(productsByCategory);
      } catch (error) {
        console.error("Error fetching categories or products:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCategoriesAndProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchCategoryHome = async () => {
      setLoadingCategory(true);
      try {
        const categoriesResponse = await categoryService.getListsGuest({
          page: 1,
          page_size: 6,
        });
        setCategories(categoriesResponse.data.data);
      } catch (error) {
        console.error("Error fetching categories or products:", error);
      } finally {
        setTimeout(() => setLoadingCategory(false), 1000);
      }
    };
    fetchCategoryHome();
  }, []);

  // Function thực tế để thêm vào giỏ hàng (được gọi sau khi đã kiểm tra đăng nhập)
  const performAddToCart = async (product, quantity) => {
    const productId = product.id;
    if (addingProducts[productId]) return; // Prevent multiple clicks for this specific product
    
    setAddingProducts(prev => ({ ...prev, [productId]: true }));

    console.log('=== DEBUG ADD TO CART (Home) ===');
    console.log('Product:', product);
    console.log('Product.number (stock):', product.number);
    console.log('Quantity to add:', quantity);

    try {
      const profileResponse = await userService.getProfile();
      const userId = profileResponse.data.id;
      console.log('User ID:', userId);

      // ✅ FIX: Check existing bằng product_id để match với Redux logic
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
      console.log('Backend data (Home):', backendData);
      
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

      // ✅ Hiển thị message phù hợp
      if (backendData.isUpdate) {
        toast.success(`Đã cập nhật số lượng sản phẩm thành ${backendData.newQuantity}`);
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
    <>
      {/* Category Cards Section */}
      <section className="category-cards-section">
        <Container>
          <div className="section-header text-center mb-5">
            <h2 className="section-title">DANH MỤC SẢN PHẨM</h2>
            <p className="section-subtitle">Khám phá bộ sưu tập đồ gia dụng chất lượng cao</p>
          </div>
          <Row className="justify-content-center">
            {loadingCategory ? (
              <CategoryLoader />
            ) : (
              <>
                {categories.map((category, index) => {
                  // Định nghĩa màu sắc cho từng category theo thiết kế đồ gia dụng
                  const categoryColors = [
                    { bg: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)', color: '#ffffff' }, // Blue
                    { bg: 'linear-gradient(135deg, #424242 0%, #616161 100%)', color: '#ffffff' }, // Gray
                    { bg: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)', color: '#ffffff' }, // Green
                    { bg: 'linear-gradient(135deg, #d84315 0%, #ff5722 100%)', color: '#ffffff' }, // Orange
                    { bg: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)', color: '#ffffff' }, // Purple
                    { bg: 'linear-gradient(135deg, #c62828 0%, #f44336 100%)', color: '#ffffff' }  // Red
                  ];
                  const colorScheme = categoryColors[index % categoryColors.length];

                  return (
                    <Col key={category.id} xs={12} sm={6} md={4} lg={4} xl={4} className="mb-4">
                      <Link to={`/c/${category.slug}`} className="category-card-link">
                        <div
                          className="category-card"
                          style={{
                            background: colorScheme.bg,
                            color: colorScheme.color
                          }}
                        >
                          <div className="category-card-content">
                            <div className="category-card-text">
                              <h3 className="category-card-title">
                                {category.name.toUpperCase()}
                              </h3>
                            </div>
                            <div className="category-card-image">
                              <img
                                src={category.avatar || '/images/default-category.png'}
                                alt={category.name}
                                className="category-product-img"
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Col>
                  );
                })}
              </>
            )}
          </Row>
        </Container>
      </section>

      <Container>
        {/* Product Sections */}
        {loading ? (
          <ProductLoader />
        ) : (
          Object.keys(categoryProducts).map((categoryName, idx) => (
            <section key={idx} className="hebekery-product-section">
              <div className="hebekery-section-header">
                <h2 className="hebekery-section-title">
                  {categoryName.toUpperCase()} ({categoryProducts[categoryName]?.length || 0})
                </h2>
                <Link to={`/c/${createSlug(categoryName)}`} className="hebekery-view-all">
                  Xem tất cả →
                </Link>
              </div>

              <div className="hebekery-products-container">
                <div className="hebekery-products-grid">
                  {categoryProducts[categoryName]?.slice(0, 4).map((product, productIdx) => (
                    <div key={productIdx} className="hebekery-product-card">
                      <div className="hebekery-product-image-wrapper">
                        <Link to={`/p/${createSlug(product.name)}-${product.id}`}>
                          <img
                            src={product.avatar}
                            alt={product.name}
                            className="hebekery-product-image"
                          />
                        </Link>
                        {/* Badge cho sản phẩm nổi bật */}
                        {productIdx < 2 && (
                          <div className="hebekery-product-badge">
                            <span className="badge-text">{productIdx + 1}+</span>
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

                        <div className="hebekery-product-price">
                          <span className="current-price">
                            {formatPrice(product.sale ? product.price * (1 - product.sale / 100) : product.price)}
                          </span>
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

                {/* Navigation arrows */}
                <div className="hebekery-nav-arrows">
                  <button className="nav-arrow nav-prev">‹</button>
                  <button className="nav-arrow nav-next">›</button>
                </div>
              </div>
            </section>
          ))
        )}
      </Container>
    </>
  );
};

export default Home;