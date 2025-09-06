import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaEye } from 'react-icons/fa';
import './BlogList.css';

const BlogTest = () => {
    // Mock data for testing
    const mockPosts = [
        {
            id: 1,
            name: '10 Mẹo Hay Giúp Tiết Kiệm Điện Trong Gia Đình',
            slug: '10-meo-hay-giup-tiet-kiem-dien-trong-gia-dinh',
            description: 'Khám phá những cách đơn giản nhưng hiệu quả để giảm hóa đơn tiền điện hàng tháng cho gia đình bạn.',
            avatar: 'https://via.placeholder.com/400x200/1976d2/ffffff?text=Tiết+Kiệm+Điện',
            is_featured: 1,
            views: 156,
            created_at: '2024-01-15T10:30:00Z'
        },
        {
            id: 2,
            name: 'Cách Chọn Nồi Cơm Điện Phù Hợp Cho Gia Đình',
            slug: 'cach-chon-noi-com-dien-phu-hop-cho-gia-dinh',
            description: 'Hướng dẫn chi tiết cách lựa chọn nồi cơm điện phù hợp với nhu cầu và số lượng thành viên trong gia đình.',
            avatar: 'https://via.placeholder.com/400x200/4caf50/ffffff?text=Nồi+Cơm+Điện',
            is_featured: 0,
            views: 89,
            created_at: '2024-01-10T14:20:00Z'
        },
        {
            id: 3,
            name: 'Xu Hướng Trang Trí Nhà Cửa 2024',
            slug: 'xu-huong-trang-tri-nha-cua-2024',
            description: 'Cập nhật những xu hướng trang trí nội thất mới nhất năm 2024 để ngôi nhà bạn luôn hiện đại và ấn tượng.',
            avatar: 'https://via.placeholder.com/400x200/ff9800/ffffff?text=Trang+Trí+2024',
            is_featured: 1,
            views: 234,
            created_at: '2024-01-08T09:15:00Z'
        },
        {
            id: 4,
            name: 'Hướng Dẫn Vệ Sinh Máy Giặt Tại Nhà',
            slug: 'huong-dan-ve-sinh-may-giat-tai-nha',
            description: 'Cách vệ sinh máy giặt đơn giản tại nhà để máy luôn hoạt động hiệu quả và quần áo được giặt sạch.',
            avatar: 'https://via.placeholder.com/400x200/9c27b0/ffffff?text=Vệ+Sinh+Máy+Giặt',
            is_featured: 0,
            views: 167,
            created_at: '2024-01-05T16:45:00Z'
        },
        {
            id: 5,
            name: 'Top 5 Đồ Gia Dụng Thông Minh Đáng Mua Nhất 2024',
            slug: 'top-5-do-gia-dung-thong-minh-dang-mua-nhat-2024',
            description: 'Danh sách những sản phẩm đồ gia dụng thông minh hữu ích nhất mà mọi gia đình nên có trong năm 2024.',
            avatar: 'https://via.placeholder.com/400x200/f44336/ffffff?text=Đồ+Thông+Minh',
            is_featured: 1,
            views: 312,
            created_at: '2024-01-03T11:30:00Z'
        },
        {
            id: 6,
            name: 'Bí Quyết Sắp Xếp Tủ Bếp Gọn Gàng',
            slug: 'bi-quyet-sap-xep-tu-bep-gon-gang',
            description: 'Những mẹo hay giúp bạn sắp xếp tủ bếp một cách khoa học và gọn gàng, tối ưu hóa không gian.',
            avatar: 'https://via.placeholder.com/400x200/607d8b/ffffff?text=Sắp+Xếp+Bếp',
            is_featured: 0,
            views: 98,
            created_at: '2024-01-01T08:00:00Z'
        }
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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

    return (
        <div className="blog-container">
            <Container>
                {/* Header */}
                <div className="blog-header">
                    <h1 className="blog-title">📝 Blog HomeLife Store</h1>
                    <p className="blog-subtitle">Khám phá những bài viết hữu ích về đồ gia dụng và cuộc sống</p>
                </div>

                {/* Posts Grid */}
                <Row>
                    {mockPosts.map(post => (
                        <Col key={post.id} lg={4} md={6} className="mb-4">
                            <Card className="blog-card h-100">
                                <div className="blog-image-wrapper">
                                    <Card.Img
                                        variant="top"
                                        src={post.avatar}
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
                                            to={`/blog/${createSlug(post.name, post.id)}`}
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

                {/* Info Message */}
                <div className="mt-5 p-4 bg-light rounded">
                    <h5 className="text-center text-primary">🚀 Blog Demo</h5>
                    <p className="text-center mb-0">
                        Đây là trang demo cho hệ thống blog. Dữ liệu hiển thị là dữ liệu mẫu. 
                        Để sử dụng đầy đủ chức năng, vui lòng chạy migration database và khởi động API server.
                    </p>
                </div>
            </Container>
        </div>
    );
};

export default BlogTest;
