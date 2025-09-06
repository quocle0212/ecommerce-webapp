import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Pagination, Form, InputGroup, Button } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaCalendarAlt, FaEye, FaUser, FaTags } from 'react-icons/fa';
import blogService from '../../../api/blogService';
import { createSlug } from '../../../helpers/formatters';
import ContentLoader from 'react-content-loader';
import './BlogList.css';

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });

    // Get search parameters
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const searchQuery = searchParams.get('search') || '';
    const selectedMenu = searchParams.get('menu') || '';

    useEffect(() => {
        fetchPosts();
        fetchMenus();
    }, [currentPage, searchQuery, selectedMenu]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                page_size: 12
            };

            if (searchQuery) params.name = searchQuery;
            if (selectedMenu) params.menu_id = selectedMenu;

            const response = await blogService.getAll(params);
            if (response.status === 'success') {
                setPosts(response.data.data || []);
                setPagination({
                    page: response.data.meta.currentPage,
                    totalPages: response.data.meta.total_page,
                    total: response.data.meta.total
                });
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMenus = async () => {
        try {
            const response = await blogService.getMenus({ page_size: 50 });
            if (response.status === 'success') {
                setMenus(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching menus:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const search = formData.get('search');

        const newParams = new URLSearchParams(searchParams);
        if (search) {
            newParams.set('search', search);
        } else {
            newParams.delete('search');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleMenuFilter = (menuId) => {
        const newParams = new URLSearchParams(searchParams);
        if (menuId) {
            newParams.set('menu', menuId);
        } else {
            newParams.delete('menu');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handlePageChange = (page) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        setSearchParams(newParams);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const BlogLoader = () => (
        <Row>
            {[...Array(6)].map((_, index) => (
                <Col key={index} lg={4} md={6} className="mb-4">
                    <ContentLoader
                        speed={2}
                        width="100%"
                        height={400}
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                    >
                        <rect x="0" y="0" rx="15" ry="15" width="100%" height="200" />
                        <rect x="20" y="220" rx="4" ry="4" width="60%" height="20" />
                        <rect x="20" y="250" rx="4" ry="4" width="80%" height="16" />
                        <rect x="20" y="275" rx="4" ry="4" width="70%" height="16" />
                        <rect x="20" y="320" rx="4" ry="4" width="40%" height="14" />
                        <rect x="20" y="350" rx="4" ry="4" width="30%" height="14" />
                    </ContentLoader>
                </Col>
            ))}
        </Row>
    );

    return (
        <div className="blog-container">
            <Container>
                {/* Header */}
                <div className="blog-header">
                    <h1 className="blog-title">📝 Blog HomeLife Store</h1>
                    <p className="blog-subtitle">Khám phá những bài viết hữu ích về đồ gia dụng và cuộc sống</p>
                </div>

                {/* Search and Filter */}
                <Row className="mb-4">
                    <Col lg={8}>
                        <Form onSubmit={handleSearch}>
                            <InputGroup className="search-group">
                                <Form.Control
                                    type="text"
                                    name="search"
                                    placeholder="Tìm kiếm bài viết..."
                                    defaultValue={searchQuery}
                                    className="search-input"
                                />
                                <Button type="submit" className="search-btn">
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Form>
                    </Col>
                    <Col lg={4}>
                        <Form.Select
                            value={selectedMenu}
                            onChange={(e) => handleMenuFilter(e.target.value)}
                            className="menu-filter"
                        >
                            <option value="">Tất cả danh mục</option>
                            {menus.map(menu => (
                                <option key={menu.id} value={menu.id}>
                                    {menu.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>

                {/* Posts Grid */}
                {loading ? (
                    <BlogLoader />
                ) : posts.length > 0 ? (
                    <>
                        <Row>
                            {posts.map(post => (
                                <Col key={post.id} lg={4} md={6} className="mb-4">
                                    <Card className="blog-card h-100">
                                        <div className="blog-image-wrapper">
                                            <Card.Img
                                                variant="top"
                                                src={post.avatar || 'https://via.placeholder.com/400x200/1976d2/ffffff?text=HomeLife+Blog'}
                                                alt={post.name}
                                                className="blog-image"
                                            />
                                            {post.is_featured && (
                                                <Badge className="featured-badge">
                                                    ⭐ Nổi bật
                                                </Badge>
                                            )}
                                        </div>

                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title className="blog-card-title">
                                                <Link
                                                    to={`/blog/${createSlug(post.name)}-${post.id}`}
                                                    className="title-link"
                                                >
                                                    {post.name}
                                                </Link>
                                            </Card.Title>

                                            <Card.Text className="blog-description">
                                                {post.description}
                                            </Card.Text>

                                            <div className="blog-meta mt-auto">
                                                <div className="meta-item">
                                                    <FaCalendarAlt className="meta-icon" />
                                                    <span>{formatDate(post.created_at)}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <FaEye className="meta-icon" />
                                                    <span>{post.views || 0} lượt xem</span>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-5">
                                <Pagination>
                                    <Pagination.Prev
                                        disabled={pagination.page === 1}
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                    />

                                    {[...Array(pagination.totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        return (
                                            <Pagination.Item
                                                key={page}
                                                active={page === pagination.page}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </Pagination.Item>
                                        );
                                    })}

                                    <Pagination.Next
                                        disabled={pagination.page === pagination.totalPages}
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                    />
                                </Pagination>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-posts">
                        <h4>Không tìm thấy bài viết nào</h4>
                        <p>Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default BlogList;
