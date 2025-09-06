import React, { useEffect, useState, useTransition } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Dropdown, Pagination, Nav, Button, Form, InputGroup } from 'react-bootstrap';
import '../style/Category.css';
import '../../components/product/ProductCarousel.css';
import categoryService from '../../../api/categoryService';
import apiProductService from "../../../api/apiProductService";
import {createSlug, formatPrice, renderStarsItem} from "../../../helpers/formatters";
import apiBrandService from "../../../api/apiBrandService";

const CategorySkeleton = React.lazy(() => import('../../components/loading/CategorySkeleton'));
const ProductSkeleton = React.lazy(() => import('../../components/loading/ProductSkeleton'));

const Brand = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [brand, setBrand] = useState([]);
    const [brands, setBrands] = useState([]);
    const [labels, setLabels] = useState([]);  // Thêm state để lưu danh sách nhãn
    const [categoryName, setCategoryName] = useState('SẢN PHẨM');
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingBrands, setLoadingBrands] = useState(true);
    const [loadingLabels, setLoadingLabels] = useState(true);  // Thêm state loading cho labels
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [totalPages, setTotalPages] = useState(1);
    const [isPending, startTransition] = useTransition();
    const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
    const [ratingFilter, setRatingFilter] = useState(searchParams.get('rating') ? parseInt(searchParams.get('rating')) : null);
    const [selectedLabel, setSelectedLabel] = useState(searchParams.get('label_id') ? parseInt(searchParams.get('label_id')) : null); // Thêm state để lưu nhãn được chọn
    const [priceFrom, setPriceFrom] = useState(searchParams.get('price_from') || '');
    const [priceTo, setPriceTo] = useState(searchParams.get('price_to') || '');

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
                setTimeout(() => setLoadingLabels(false), 1000);
            }
        };
        fetchLabels();
    }, []);

    useEffect(() => {
        const fetchBrand = async () => {
            if (slug) {
                const id = slug.split('-').pop();
                try {
                    const response = await apiBrandService.getById(id);
                    setBrand(response.data.brand);
                } catch (error) {
                    console.error("Error fetching product:", error);
                }
            }
        };
        fetchBrand();
    },[])

    useEffect(() => {
        const fetchBrands = async () => {
            setLoadingBrands(true);
            try {
                const response = await apiBrandService.getLists();
                setBrands(response.data.data);
            } catch (error) {
                console.error("Error fetching labels:", error);
            } finally {
                setLoadingBrands(false);
                setTimeout(() => setLoadingBrands(false), 1000);
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
			const category = categories.find(cat => cat.slug == slug);
			const response = await apiProductService.getLists({
				page: currentPage,
				page_size: 12,
				category_id: category?.id,
                brand_id: brand?.id,
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

    return (
        <Container className="category-container">
            <Row>
                <Col md={3}>
                    <h5 className="mt-4">Chuyên mục</h5>
                    {loadingCategories ? (
                        <CategorySkeleton/>
                    ) : (
                        <ul className="category-list">
                            {categories.map((category) => (
                                <li key={category.id} className={category.slug === slug ? 'active' : ''}>
                                    <Link to={`/c/${category.slug}`}>{category.name}</Link>
                                </li>
                            ))}
                        </ul>
                    )}
                    <h5 className="mt-4">Nhà cung cấp</h5>
                    {loadingBrands ? (
                        <CategorySkeleton/>
                    ) : (
                        <ul className="category-list">
                            {brands.map((brand) => (
                                <li key={brand.id} className=''>
                                    <Link to={`/c/${brand.slug}`}>{brand.name}</Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Khối Sắp xếp */}
                    <h5 className="mt-4">Sắp xếp</h5>
                    <Form.Select aria-label="Sắp xếp" value={sortOption} onChange={handleSortChange}>
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="price-asc">Giá tăng dần</option>
                        <option value="price-desc">Giá giảm dần</option>
                    </Form.Select>

                    {/* Khối Lọc theo đánh giá */}
                    <h5 className="mt-4">Lọc theo đánh giá</h5>
                    <div className="rating-filter">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <Button
                                key={rating}
                                size={'sm'}
                                variant={ratingFilter === rating ? 'primary' : 'outline-primary'}
                                onClick={() => handleRatingFilterChange(rating)}
                                className="mb-2 me-2"
                            >
                                {rating} sao
                            </Button>
                        ))}
                        <Button
                            variant={!ratingFilter ? 'primary' : 'outline-primary'}
                            size={'sm'}
                            onClick={() => handleRatingFilterChange(null)}
                            className="mb-2 ms-2"
                        >
                            Tất cả
                        </Button>
                    </div>

                    {/* Khối Lọc theo nhãn */}
                    <h5 className="mt-4">Lọc theo nhãn</h5>
                    {loadingLabels ? (
                        <CategorySkeleton/>
                    ) : (
                        <div className="label-filter mb-4">
                            {labels.map((label) => (
                                <Button
                                    key={label.id}
                                    size="sm"
                                    variant={selectedLabel === label.id ? 'primary' : 'outline-primary'}
                                    onClick={() => handleLabelFilterChange(label.id)}
                                    className="mb-2 me-2"
                                >
                                    {label.name}
                                </Button>
                            ))}
                            <Button
                                variant={!selectedLabel ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => handleLabelFilterChange(null)}
                                className="mb-2 me-2"
                            >
                                Tất cả
                            </Button>
                        </div>
                    )}

                    {/* Khối Lọc theo giá */}
                    <h5 className="mt-4">Lọc theo giá</h5>
                    <div className="price-filter mb-4">
                        <InputGroup className="mb-2">
                            <InputGroup.Text>Từ</InputGroup.Text>
                            <Form.Control
                                type="number"
                                placeholder="Giá từ"
                                value={priceFrom}
                                onChange={handlePriceFromChange}
                            />
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Đến</InputGroup.Text>
                            <Form.Control
                                type="number"
                                placeholder="Giá đến"
                                value={priceTo}
                                onChange={handlePriceToChange}
                            />
                        </InputGroup>
                        <div className="d-flex">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleApplyPriceFilter}
                                className="me-2"
                            >
                                Áp dụng
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={handleResetPriceFilter}
                            >
                                Đặt lại
                            </Button>
                        </div>
                    </div>
                </Col>
                <Col md={9}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4>{categoryName}</h4>
                    </div>
                    <Row>
                        {loadingProducts || isPending ? (
                            Array.from({ length: 8 }).map((_, idx) => (
                                <Col md={3} key={idx}>
                                    <ProductSkeleton />
                                </Col>
                            ))
                        ) : (
                            products.map((product, idx) => (
                                <Col md={3} key={idx} className={'item-prod'}>
                                    <Card className="mb-4 card-prod">
                                        {/*<Card.Img variant="top" src={product.avatar} />*/}
                                        <Nav.Link as={Link} to={`/p/${createSlug(product.name)}-${product.id}`}>
                                            <Card.Img variant="top" src={product.avatar} alt={product.name} style={{ height: '200px'}} />
                                        </Nav.Link>
                                        <Card.Body>
                                            <Card.Title>
                                                <Nav.Link as={Link}
                                                          to={`p/${createSlug(product.name)}-${product.id}`}>{product.name}</Nav.Link>
                                            </Card.Title>
                                            <div className="rating-small mb-2">
                                                {product.total_rating_score > 0 ? (
                                                    renderStarsItem(product.total_rating_score / product.total_vote_count)
                                                ) : (
                                                    renderStarsItem(0)
                                                )}
                                            </div>
                                            <Card.Text>{formatPrice(product.price)}</Card.Text>
                                        </Card.Body>
                                        <Button variant={product.number > 0 ? 'success' : 'danger'}>
                                            {product.number > 0 ? 'Còn hàng' : 'Hết hàng'}
                                        </Button>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                    {totalPages > 0 && (
                        <Pagination className="justify-content-center">
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
                </Col>
            </Row>
        </Container>
    );
};

export default Brand;
