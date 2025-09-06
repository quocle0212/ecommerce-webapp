import React, { useEffect, useState, useTransition } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Pagination, Button, Form, Breadcrumb } from 'react-bootstrap';
import '../style/Category.css';
import '../../components/product/ProductCarousel.css';
import categoryService from '../../../api/categoryService';
import apiProductService from "../../../api/apiProductService";
import { createSlug, formatPrice, renderStarsItem } from "../../../helpers/formatters";
import apiBrandService from "../../../api/apiBrandService";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import { checkAuthBeforeAddToCart } from '../../../helpers/authHelpers';
import userService from '../../../api/userService';
import apiCartService from '../../../api/apiCartService';

const CategorySkeleton = React.lazy(() => import('../../components/loading/CategorySkeleton'));
const ProductSkeleton = React.lazy(() => import('../../components/loading/ProductSkeleton'));

const Category = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Lấy thông tin đăng nhập và giỏ hàng từ Redux
    const user = useSelector(state => state.auth.user);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const cartItems = useSelector(state => state.cart.items);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [labels, setLabels] = useState([]);
    const [categoryName, setCategoryName] = useState('SẢN PHẨM');
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingBrands, setLoadingBrands] = useState(true);
    const [loadingLabels, setLoadingLabels] = useState(true);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [totalPages, setTotalPages] = useState(1);
    const [isPending, startTransition] = useTransition();
    const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
    const [ratingFilter, setRatingFilter] = useState(searchParams.get('rating') ? parseInt(searchParams.get('rating')) : null);
    const [selectedLabel, setSelectedLabel] = useState(searchParams.get('label_id') ? parseInt(searchParams.get('label_id')) : null);
    const [priceFrom, setPriceFrom] = useState(searchParams.get('price_from') || '');
    const [priceTo, setPriceTo] = useState(searchParams.get('price_to') || '');
    const [loading, setLoading] = useState(true);
    const [addingProducts, setAddingProducts] = useState({});

    // Fetch danh sách categories
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await categoryService.getListsGuest();
                setCategories(response.data.data);

                // Cập nhật tên danh mục dựa trên slug
                const currentCategory = response.data.data.find(cat => cat.slug === slug);
                if (currentCategory) {
                    setCategoryName(currentCategory.name);
                } else {
                    setCategoryName('SẢN PHẨM');
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setTimeout(() => setLoadingCategories(false), 1000);
            }
        };
        fetchCategories();
    }, [slug]);

    // Fetch danh sách labels
    useEffect(() => {
        const fetchLabels = async () => {
            setLoadingLabels(true);
            try {
                const response = await apiProductService.getListsLabel();
                setLabels(response.data.data);
            } catch (error) {
                console.error("Error fetching labels:", error);
            } finally {
                setLoadingLabels(false);
            }
        };
        fetchLabels();
    }, []);

    // Fetch danh sách brands
    useEffect(() => {
        const fetchBrands = async () => {
            setLoadingBrands(true);
            try {
                const response = await apiBrandService.getLists();
                setBrands(response.data.data);
            } catch (error) {
                console.error("Error fetching brands:", error);
            } finally {
                setLoadingBrands(false);
            }
        };
        fetchBrands();
    }, []);

    // Fetch sản phẩm theo category và các tùy chọn sắp xếp/lọc
    useEffect(() => {
        startTransition(() => {
            setLoadingProducts(true);
            if (categories.length > 0 && slug) fetchProducts();
        });
    }, [slug, categories, currentPage, sortOption, ratingFilter, selectedLabel, priceFrom, priceTo]);

    const fetchProducts = async () => {
        try {
            const category = categories.find(cat => cat.slug === slug);
            const response = await apiProductService.getLists({
                page: currentPage,
                page_size: 12,
                category_id: category?.id,
                sort: sortOption,
                rating: ratingFilter,
                label_id: selectedLabel,
                price_from: priceFrom || undefined,
                price_to: priceTo || undefined,
            });
            console.log("res product-----------> ", response?.data?.data);
            setProducts(response?.data?.data || []);
            setTotalPages(response?.data?.meta?.total_page);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setTimeout(() => setLoadingProducts(false), 1000);
        }
    };

    // Hàm cập nhật URL params
    const updateSearchParams = (params) => {
        const newParams = new URLSearchParams(searchParams);

        // Cập nhật các tham số mới
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });

        // Đặt lại trang về 1 nếu thay đổi bộ lọc
        if (!params.hasOwnProperty('page')) {
            newParams.set('page', '1');
            setCurrentPage(1);
        }

        setSearchParams(newParams);
    };

    // Xử lý thay đổi sắp xếp
    const handleSortChange = (e) => {
        const value = e.target.value;
        setSortOption(value);
        updateSearchParams({ sort: value });
    };

    // Xử lý lọc theo đánh giá
    const handleRatingFilterChange = (rating) => {
        setRatingFilter(rating);
        updateSearchParams({ rating: rating });
    };

    // Xử lý lọc sản phẩm theo nhãn
    const handleLabelFilterChange = (labelId) => {
        setSelectedLabel(labelId);
        updateSearchParams({ label_id: labelId });
    };

    // Xử lý thay đổi giá từ
    const handlePriceFromChange = (e) => {
        const value = e.target.value;
        setPriceFrom(value);
    };

    // Xử lý thay đổi giá đến
    const handlePriceToChange = (e) => {
        const value = e.target.value;
        setPriceTo(value);
    };

    // Xử lý áp dụng lọc giá
    const handleApplyPriceFilter = () => {
        updateSearchParams({
            price_from: priceFrom,
            price_to: priceTo
        });
    };

    // Xử lý đặt lại lọc giá
    const handleResetPriceFilter = () => {
        setPriceFrom('');
        setPriceTo('');
        updateSearchParams({
            price_from: null,
            price_to: null
        });
    };

    // Function thực tế để thêm vào giỏ hàng (được gọi sau khi đã kiểm tra đăng nhập)
    const performAddToCart = async (product, quantity) => {
        const productId = product.id;
        if (addingProducts[productId]) return; // Prevent multiple clicks for this specific product
        
        setAddingProducts(prev => ({ ...prev, [productId]: true }));

        console.log('=== DEBUG ADD TO CART (Category) ===');
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
            console.log('Backend data (Category):', backendData);
            
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
        <>
            {/* Breadcrumb */}
            <div className="breadcrumb-section">
                <Container>
                    <Breadcrumb>
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                            Trang chủ
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>
                            {categoryName}
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </Container>
            </div>

            <Container className="category-container">
                <Row>
                    <Col lg={3} md={4}>
                        <div className="category-sidebar">
                            {/* Categories */}
                            <div className="sidebar-section">
                                <h5 className="sidebar-title">Danh mục sản phẩm</h5>
                                {loadingCategories ? (
                                    <CategorySkeleton />
                                ) : (
                                    <ul className="category-list">
                                        {categories.map((category) => (
                                            <li key={category.id} className={category.slug === slug ? 'active' : ''}>
                                                <Link to={`/c/${category.slug}`}>{category.name}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Brands */}
                            <div className="sidebar-section">
                                <h5 className="sidebar-title">Thương hiệu</h5>
                                {loadingBrands ? (
                                    <CategorySkeleton />
                                ) : (
                                    <ul className="category-list">
                                        {brands.slice(0, 8).map((brand) => (
                                            <li key={brand.id}>
                                                <Link to={`/b/${brand.slug}-${brand.id}`}>{brand.name}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Sort */}
                            <div className="filter-section">
                                <h6 className="filter-title">Sắp xếp</h6>
                                <Form.Select
                                    className="sort-dropdown"
                                    value={sortOption}
                                    onChange={handleSortChange}
                                >
                                    <option value="newest">Mới nhất</option>
                                    <option value="oldest">Cũ nhất</option>
                                    <option value="price-asc">Giá tăng dần</option>
                                    <option value="price-desc">Giá giảm dần</option>
                                </Form.Select>
                            </div>

                            {/* Rating Filter */}
                            <div className="filter-section">
                                <h6 className="filter-title">Đánh giá</h6>
                                <div className="rating-filter">
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <Button
                                            key={rating}
                                            className={`filter-btn ${ratingFilter === rating ? 'active' : ''}`}
                                            onClick={() => handleRatingFilterChange(rating)}
                                        >
                                            {rating} sao
                                        </Button>
                                    ))}
                                    <Button
                                        className={`filter-btn ${!ratingFilter ? 'active' : ''}`}
                                        onClick={() => handleRatingFilterChange(null)}
                                    >
                                        Tất cả
                                    </Button>
                                </div>
                            </div>

                            {/* Label Filter */}
                            <div className="filter-section">
                                <h6 className="filter-title">Nhãn sản phẩm</h6>
                                {loadingLabels ? (
                                    <CategorySkeleton />
                                ) : (
                                    <div className="label-filter">
                                        {labels.slice(0, 6).map((label) => (
                                            <Button
                                                key={label.id}
                                                className={`filter-btn ${selectedLabel === label.id ? 'active' : ''}`}
                                                onClick={() => handleLabelFilterChange(label.id)}
                                            >
                                                {label.name}
                                            </Button>
                                        ))}
                                        <Button
                                            className={`filter-btn ${!selectedLabel ? 'active' : ''}`}
                                            onClick={() => handleLabelFilterChange(null)}
                                        >
                                            Tất cả
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Price Filter */}
                            <div className="filter-section">
                                <h6 className="filter-title">Khoảng giá</h6>
                                <div className="price-filter">
                                    <div className="price-input-group">
                                        <Form.Control
                                            type="number"
                                            placeholder="Giá từ"
                                            value={priceFrom}
                                            onChange={handlePriceFromChange}
                                            className="price-input"
                                        />
                                    </div>
                                    <div className="price-input-group">
                                        <Form.Control
                                            type="number"
                                            placeholder="Giá đến"
                                            value={priceTo}
                                            onChange={handlePriceToChange}
                                            className="price-input"
                                        />
                                    </div>
                                    <div className="price-actions">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={handleApplyPriceFilter}
                                            className="price-btn"
                                        >
                                            Áp dụng
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={handleResetPriceFilter}
                                            className="price-btn"
                                        >
                                            Đặt lại
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col lg={9} md={8}>
                        <div className="products-section">
                            {/* Category Header with Sort */}
                            <div className="category-header">
                                <div className="category-title-section">
                                    <h1>{categoryName} ({products.length})</h1>
                                </div>
                                <div className="sort-section">
                                    <label htmlFor="sort-select">Sắp xếp:</label>
                                    <Form.Select
                                        id="sort-select"
                                        className="sort-dropdown"
                                        value={sortOption}
                                        onChange={handleSortChange}
                                    >
                                        <option value="newest">Mới nhất</option>
                                        <option value="name_asc">A - Z</option>
                                        <option value="name_desc">Z - A</option>
                                        <option value="price_asc">Giá tăng dần</option>
                                        <option value="price_desc">Giá giảm dần</option>
                                    </Form.Select>
                                </div>
                            </div>

                            <div className="hebekery-products-grid">
                                {loadingProducts || isPending ? (
                                    Array.from({ length: 8 }).map((_, idx) => (
                                        <div key={idx} className="hebekery-product-card">
                                            <ProductSkeleton />
                                        </div>
                                    ))
                                ) : (
                                    products.map((product, idx) => {
                                        const hasDiscount = product.price_old && product.price_old > product.price;
                                        const discountPercent = hasDiscount ? Math.round(((product.price_old - product.price) / product.price_old) * 100) : 0;

                                        return (
                                            <div key={idx} className="hebekery-product-card">
                                                <div className="hebekery-product-image-wrapper">
                                                    {hasDiscount && (
                                                        <div className="hebekery-discount-badge">
                                                            -{discountPercent}%
                                                        </div>
                                                    )}
                                                    <Link to={`/p/${createSlug(product.name)}-${product.id}`}>
                                                        <img
                                                            src={product.avatar}
                                                            alt={product.name}
                                                            className="hebekery-product-image"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="hebekery-product-info">
                                                    <h3 className="hebekery-product-title">
                                                        <Link to={`/p/${createSlug(product.name)}-${product.id}`}>
                                                            {product.name}
                                                        </Link>
                                                    </h3>
                                                    <div className="hebekery-product-rating">
                                                        {product.total_rating_score > 0 ? (
                                                            renderStarsItem(product.total_rating_score / product.total_vote_count)
                                                        ) : (
                                                            renderStarsItem(0)
                                                        )}
                                                    </div>
                                                    <div className="hebekery-product-price">
                                                        <span className="hebekery-current-price">
                                                            {formatPrice(product.sale ? product.price * (1 - product.sale / 100) : product.price)}
                                                        </span>
                                                        {hasDiscount && (
                                                            <span className="hebekery-old-price">
                                                                {formatPrice(product.price_old)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        className={`hebekery-product-btn ${product.number > 0 ? 'hebekery-btn-available' : 'hebekery-btn-unavailable'}`}
                                                        disabled={parseInt(product.number, 10) <= 0 || addingProducts[product.id]}
                                                        onClick={() => handleAddToCart(product)}
                                                    >
                                                        {addingProducts[product.id] ? 'Đang thêm...' : (parseInt(product.number, 10) > 0 ? 'Thêm vào giỏ' : 'Hết hàng')}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            {totalPages > 0 && (
                                <Pagination>
                                    <Pagination.First onClick={() => updateSearchParams({ page: 1 })} />
                                    <Pagination.Prev onClick={() => updateSearchParams({ page: Math.max(currentPage - 1, 1) })} />
                                    {[...Array(totalPages)].map((_, idx) => (
                                        <Pagination.Item
                                            key={idx}
                                            active={idx + 1 === currentPage}
                                            onClick={() => updateSearchParams({ page: idx + 1 })}
                                        >
                                            {idx + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next onClick={() => updateSearchParams({ page: Math.min(currentPage + 1, totalPages) })} />
                                    <Pagination.Last onClick={() => updateSearchParams({ page: totalPages })} />
                                </Pagination>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Category;