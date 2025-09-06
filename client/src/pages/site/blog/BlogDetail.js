import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Breadcrumb, Button } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaEye, FaUser, FaArrowLeft, FaShare, FaPrint } from 'react-icons/fa';
import blogService from '../../../api/blogService';
import { createSlug } from '../../../helpers/formatters';
import ContentLoader from 'react-content-loader';
import './BlogDetail.css';

const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Extract ID from slug (format: title-id)
    const postId = slug ? slug.split('-').pop() : null;

    useEffect(() => {
        if (postId) {
            fetchPost();
        }
    }, [postId]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await blogService.getById(postId);
            if (response.status === 'success') {
                const postData = response.data.data;
                setPost(postData);

                // Fetch related posts from same menu
                if (postData.menu_id) {
                    fetchRelatedPosts(postData.menu_id, postData.id);
                }
            } else {
                setError('Bài viết không tồn tại');
            }
        } catch (error) {
            console.error('Error fetching post:', error);
            setError('Có lỗi xảy ra khi tải bài viết');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedPosts = async (menuId, currentPostId) => {
        try {
            const response = await blogService.getByMenu(menuId, { page_size: 4 });
            if (response.data.success) {
                const posts = response.data.data.data || [];
                // Filter out current post
                const filtered = posts.filter(p => p.id !== currentPostId);
                setRelatedPosts(filtered.slice(0, 3));
            }
        } catch (error) {
            console.error('Error fetching related posts:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post.name,
                text: post.description,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Đã sao chép link bài viết!');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const PostLoader = () => (
        <ContentLoader
            speed={2}
            width="100%"
            height={600}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
        >
            <rect x="0" y="0" rx="4" ry="4" width="100%" height="40" />
            <rect x="0" y="60" rx="4" ry="4" width="60%" height="20" />
            <rect x="0" y="100" rx="15" ry="15" width="100%" height="300" />
            <rect x="0" y="420" rx="4" ry="4" width="100%" height="20" />
            <rect x="0" y="460" rx="4" ry="4" width="100%" height="20" />
            <rect x="0" y="500" rx="4" ry="4" width="80%" height="20" />
        </ContentLoader>
    );

    if (loading) {
        return (
            <div className="blog-detail-container">
                <Container>
                    <PostLoader />
                </Container>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="blog-detail-container">
                <Container>
                    <div className="error-message">
                        <h3>Oops! Có lỗi xảy ra</h3>
                        <p>{error || 'Bài viết không tồn tại'}</p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/blog')}
                            className="back-btn"
                        >
                            <FaArrowLeft className="me-2" />
                            Quay lại danh sách blog
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="blog-detail-container">
            <Container>
                {/* Breadcrumb */}
                <Breadcrumb className="blog-breadcrumb">
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                        Trang chủ
                    </Breadcrumb.Item>
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/blog" }}>
                        Blog
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {post.name}
                    </Breadcrumb.Item>
                </Breadcrumb>

                <Row>
                    <Col lg={8}>
                        {/* Main Content */}
                        <article className="blog-article">
                            {/* Header */}
                            <div className="article-header">
                                <div className="article-actions">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => navigate('/blog')}
                                        className="back-btn"
                                    >
                                        <FaArrowLeft className="me-2" />
                                        Quay lại
                                    </Button>

                                    <div className="action-buttons">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={handleShare}
                                        >
                                            <FaShare className="me-2" />
                                            Chia sẻ
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={handlePrint}
                                        >
                                            <FaPrint className="me-2" />
                                            In
                                        </Button>
                                    </div>
                                </div>

                                <h1 className="article-title">{post.name}</h1>

                                {post.description && (
                                    <p className="article-description">{post.description}</p>
                                )}

                                <div className="article-meta">
                                    <div className="meta-item">
                                        <FaCalendarAlt className="meta-icon" />
                                        <span>{formatDate(post.created_at)}</span>
                                    </div>
                                    <div className="meta-item">
                                        <FaEye className="meta-icon" />
                                        <span>{post.views || 0} lượt xem</span>
                                    </div>
                                    {post.is_featured && (
                                        <Badge className="featured-badge">
                                            ⭐ Bài viết nổi bật
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Featured Image */}
                            {post.avatar && (
                                <div className="article-image">
                                    <img
                                        src={post.avatar}
                                        alt={post.name}
                                        className="img-fluid"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div
                                className="article-content"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </article>
                    </Col>

                    <Col lg={4}>
                        {/* Sidebar */}
                        <div className="blog-sidebar">
                            {/* Related Posts */}
                            {relatedPosts.length > 0 && (
                                <Card className="sidebar-card">
                                    <Card.Header className="sidebar-header">
                                        <h5>Bài viết liên quan</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {relatedPosts.map(relatedPost => (
                                            <div key={relatedPost.id} className="related-post">
                                                <Link
                                                    to={`/blog/${createSlug(relatedPost.name)}-${relatedPost.id}`}
                                                    className="related-post-link"
                                                >
                                                    <div className="related-post-image">
                                                        <img
                                                            src={relatedPost.avatar || 'https://via.placeholder.com/80x60/1976d2/ffffff?text=Blog'}
                                                            alt={relatedPost.name}
                                                        />
                                                    </div>
                                                    <div className="related-post-content">
                                                        <h6 className="related-post-title">
                                                            {relatedPost.name}
                                                        </h6>
                                                        <div className="related-post-meta">
                                                            <FaCalendarAlt className="meta-icon" />
                                                            <span>{formatDate(relatedPost.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Back to Blog */}
                            <Card className="sidebar-card">
                                <Card.Body className="text-center">
                                    <h6>Khám phá thêm</h6>
                                    <p className="text-muted">
                                        Đọc thêm những bài viết hữu ích khác
                                    </p>
                                    <Button
                                        as={Link}
                                        to="/blog"
                                        variant="primary"
                                        className="w-100"
                                    >
                                        Xem tất cả bài viết
                                    </Button>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BlogDetail;
