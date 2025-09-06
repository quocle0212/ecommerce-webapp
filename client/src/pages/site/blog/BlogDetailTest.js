import React from 'react';
import { Container, Row, Col, Card, Badge, Breadcrumb, Button } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaEye, FaArrowLeft, FaShare, FaPrint } from 'react-icons/fa';
import './BlogDetail.css';

const BlogDetailTest = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    // Mock data for testing
    const mockPost = {
        id: 1,
        name: '10 Mẹo Hay Giúp Tiết Kiệm Điện Trong Gia Đình',
        description: 'Khám phá những cách đơn giản nhưng hiệu quả để giảm hóa đơn tiền điện hàng tháng cho gia đình bạn.',
        content: `
            <h2>Giới thiệu</h2>
            <p>Trong thời đại hiện nay, việc tiết kiệm điện năng không chỉ giúp giảm chi phí sinh hoạt mà còn góp phần bảo vệ môi trường. Dưới đây là 10 mẹo hay giúp bạn tiết kiệm điện hiệu quả trong gia đình.</p>
            
            <h3>1. Sử dụng đèn LED thay thế đèn thường</h3>
            <p>Đèn LED tiêu thụ ít điện hơn đèn sợi đốt truyền thống đến 80% và có tuổi thọ cao hơn gấp 25 lần. Mặc dù giá mua ban đầu cao hơn, nhưng về lâu dài sẽ tiết kiệm được rất nhiều chi phí.</p>
            
            <h3>2. Rút phích cắm khi không sử dụng</h3>
            <p>Nhiều thiết bị điện vẫn tiêu thụ điện ở chế độ chờ (standby mode). Hãy rút phích cắm các thiết bị như TV, máy tính, lò vi sóng khi không sử dụng để tiết kiệm điện.</p>
            
            <h3>3. Sử dụng quạt trần thay vì điều hòa</h3>
            <p>Quạt trần tiêu thụ ít điện hơn điều hòa rất nhiều và vẫn mang lại cảm giác mát mẻ. Bạn có thể kết hợp sử dụng quạt trần với điều hòa ở nhiệt độ cao hơn để tiết kiệm điện.</p>
            
            <h3>4. Bảo dưỡng điều hòa định kỳ</h3>
            <p>Vệ sinh lưới lọc điều hòa thường xuyên giúp máy hoạt động hiệu quả hơn và tiêu thụ ít điện hơn. Nên vệ sinh ít nhất 1 tháng/lần.</p>
            
            <h3>5. Sử dụng nồi áp suất khi nấu ăn</h3>
            <p>Nồi áp suất giúp nấu chín thức ăn nhanh hơn, từ đó tiết kiệm được thời gian và điện năng tiêu thụ.</p>
            
            <h3>6. Đóng cửa tủ lạnh ngay sau khi sử dụng</h3>
            <p>Mở cửa tủ lạnh lâu sẽ làm nhiệt độ bên trong tăng lên, buộc máy nén phải hoạt động nhiều hơn để làm lạnh lại.</p>
            
            <h3>7. Sử dụng máy giặt với chế độ nước lạnh</h3>
            <p>Giặt bằng nước lạnh có thể tiết kiệm đến 90% điện năng so với giặt bằng nước nóng, và vẫn giặt sạch hiệu quả với bột giặt hiện đại.</p>
            
            <h3>8. Tận dụng ánh sáng tự nhiên</h3>
            <p>Mở rèm cửa vào ban ngày để tận dụng ánh sáng mặt trời, giảm việc sử dụng đèn điện trong ngày.</p>
            
            <h3>9. Sử dụng ấm đun nước thay vì bếp điện</h3>
            <p>Ấm đun nước điện hiệu quả hơn việc đun nước bằng bếp điện và tiết kiệm thời gian.</p>
            
            <h3>10. Điều chỉnh nhiệt độ điều hòa hợp lý</h3>
            <p>Mỗi độ C giảm xuống sẽ tăng 8-10% lượng điện tiêu thụ. Nên để nhiệt độ điều hòa ở 25-26°C để vừa mát mẻ vừa tiết kiệm điện.</p>
            
            <h2>Kết luận</h2>
            <p>Việc tiết kiệm điện không chỉ giúp giảm hóa đơn tiền điện mà còn góp phần bảo vệ môi trường. Hãy áp dụng những mẹo trên một cách thường xuyên để có hiệu quả tốt nhất.</p>
        `,
        avatar: 'https://via.placeholder.com/800x400/1976d2/ffffff?text=Tiết+Kiệm+Điện',
        is_featured: 1,
        views: 156,
        created_at: '2024-01-15T10:30:00Z'
    };

    const mockRelatedPosts = [
        {
            id: 2,
            name: 'Cách Chọn Nồi Cơm Điện Phù Hợp',
            avatar: 'https://via.placeholder.com/80x60/4caf50/ffffff?text=Nồi',
            created_at: '2024-01-10T14:20:00Z'
        },
        {
            id: 3,
            name: 'Xu Hướng Trang Trí Nhà Cửa 2024',
            avatar: 'https://via.placeholder.com/80x60/ff9800/ffffff?text=Trang+Trí',
            created_at: '2024-01-08T09:15:00Z'
        },
        {
            id: 4,
            name: 'Hướng Dẫn Vệ Sinh Máy Giặt',
            avatar: 'https://via.placeholder.com/80x60/9c27b0/ffffff?text=Máy+Giặt',
            created_at: '2024-01-05T16:45:00Z'
        }
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const createSlug = (name, id) => {
        const removeVietnameseTones = (str) => {
            return str
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/Đ/g, "D");
        };

        const slug = removeVietnameseTones(name)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        
        return `${slug}-${id}`;
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: mockPost.name,
                text: mockPost.description,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Đã sao chép link bài viết!');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="blog-detail-container">
            <Container>
                {/* Breadcrumb */}
                <Breadcrumb className="blog-breadcrumb">
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                        Trang chủ
                    </Breadcrumb.Item>
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/blog-test" }}>
                        Blog Test
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>
                        {mockPost.name}
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
                                        onClick={() => navigate('/blog-test')}
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

                                <h1 className="article-title">{mockPost.name}</h1>
                                
                                <p className="article-description">{mockPost.description}</p>

                                <div className="article-meta">
                                    <div className="meta-item">
                                        <FaCalendarAlt className="meta-icon" />
                                        <span>{formatDate(mockPost.created_at)}</span>
                                    </div>
                                    <div className="meta-item">
                                        <FaEye className="meta-icon" />
                                        <span>{mockPost.views || 0} lượt xem</span>
                                    </div>
                                    {mockPost.is_featured && (
                                        <Badge className="featured-badge">
                                            ⭐ Bài viết nổi bật
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="article-image">
                                <img 
                                    src={mockPost.avatar} 
                                    alt={mockPost.name}
                                    className="img-fluid"
                                />
                            </div>

                            {/* Content */}
                            <div 
                                className="article-content"
                                dangerouslySetInnerHTML={{ __html: mockPost.content }}
                            />
                        </article>
                    </Col>

                    <Col lg={4}>
                        {/* Sidebar */}
                        <div className="blog-sidebar">
                            {/* Related Posts */}
                            <Card className="sidebar-card">
                                <Card.Header className="sidebar-header">
                                    <h5>Bài viết liên quan</h5>
                                </Card.Header>
                                <Card.Body>
                                    {mockRelatedPosts.map(relatedPost => (
                                        <div key={relatedPost.id} className="related-post">
                                            <Link 
                                                to={`/blog-test/${createSlug(relatedPost.name, relatedPost.id)}`}
                                                className="related-post-link"
                                            >
                                                <div className="related-post-image">
                                                    <img 
                                                        src={relatedPost.avatar} 
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

                            {/* Back to Blog */}
                            <Card className="sidebar-card">
                                <Card.Body className="text-center">
                                    <h6>Khám phá thêm</h6>
                                    <p className="text-muted">
                                        Đọc thêm những bài viết hữu ích khác
                                    </p>
                                    <Button 
                                        as={Link} 
                                        to="/blog-test" 
                                        variant="primary"
                                        className="w-100"
                                    >
                                        Xem tất cả bài viết
                                    </Button>
                                </Card.Body>
                            </Card>

                            {/* Demo Info */}
                            <Card className="sidebar-card">
                                <Card.Body className="text-center">
                                    <h6 className="text-warning">🚀 Demo Mode</h6>
                                    <p className="text-muted small">
                                        Đây là trang demo với dữ liệu mẫu. 
                                        Để sử dụng đầy đủ, vui lòng kết nối database.
                                    </p>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BlogDetailTest;
