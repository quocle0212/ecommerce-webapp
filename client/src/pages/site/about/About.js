import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaHome, FaUsers, FaAward, FaShippingFast, FaHandshake, FaLeaf } from 'react-icons/fa';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6}>
                            <h1 className="about-title">
                                Về <span className="highlight">HomeLife Store</span>
                            </h1>
                            <p className="about-subtitle">
                                Nơi mang đến những sản phẩm đồ gia dụng chất lượng cao, 
                                giúp bạn tạo nên một không gian sống hoàn hảo và tiện nghi.
                            </p>
                            <div className="about-stats">
                                <div className="stat-item">
                                    <h3>5+</h3>
                                    <p>Năm kinh nghiệm</p>
                                </div>
                                <div className="stat-item">
                                    <h3>10,000+</h3>
                                    <p>Khách hàng tin tưởng</p>
                                </div>
                                <div className="stat-item">
                                    <h3>1,000+</h3>
                                    <p>Sản phẩm chất lượng</p>
                                </div>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="about-hero-image">
                                <img 
                                    src="/images/about-hero.jpg" 
                                    alt="HomeLife Store" 
                                    className="img-fluid rounded"
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Story Section */}
            <section className="about-story">
                <Container>
                    <Row>
                        <Col lg={8} className="mx-auto text-center">
                            <h2 className="section-title">Câu chuyện của chúng tôi</h2>
                            <p className="story-text">
                                HomeLife Store được thành lập với sứ mệnh mang đến những sản phẩm đồ gia dụng 
                                chất lượng cao, thiết kế hiện đại và giá cả hợp lý. Chúng tôi hiểu rằng ngôi nhà 
                                không chỉ là nơi ở mà còn là không gian thể hiện phong cách sống và tạo nên những 
                                kỷ niệm đẹp cho gia đình.
                            </p>
                            <p className="story-text">
                                Với đội ngũ chuyên gia giàu kinh nghiệm và tâm huyết, chúng tôi không ngừng tìm kiếm 
                                và lựa chọn những sản phẩm tốt nhất từ các thương hiệu uy tín trong và ngoài nước. 
                                Mỗi sản phẩm đều được kiểm tra kỹ lưỡng về chất lượng trước khi đến tay khách hàng.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Values Section */}
            <section className="about-values">
                <Container>
                    <Row>
                        <Col lg={12} className="text-center mb-5">
                            <h2 className="section-title">Giá trị cốt lõi</h2>
                            <p className="section-subtitle">
                                Những giá trị mà chúng tôi luôn hướng tới trong mọi hoạt động
                            </p>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={4} md={6} className="mb-4">
                            <Card className="value-card h-100">
                                <Card.Body className="text-center">
                                    <div className="value-icon">
                                        <FaAward />
                                    </div>
                                    <h4>Chất lượng</h4>
                                    <p>
                                        Cam kết mang đến những sản phẩm chất lượng cao, 
                                        được kiểm tra kỹ lưỡng và đảm bảo độ bền.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4} md={6} className="mb-4">
                            <Card className="value-card h-100">
                                <Card.Body className="text-center">
                                    <div className="value-icon">
                                        <FaUsers />
                                    </div>
                                    <h4>Khách hàng là trung tâm</h4>
                                    <p>
                                        Luôn lắng nghe và đặt nhu cầu của khách hàng lên hàng đầu, 
                                        mang đến trải nghiệm mua sắm tuyệt vời.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4} md={6} className="mb-4">
                            <Card className="value-card h-100">
                                <Card.Body className="text-center">
                                    <div className="value-icon">
                                        <FaLeaf />
                                    </div>
                                    <h4>Thân thiện môi trường</h4>
                                    <p>
                                        Ưu tiên các sản phẩm thân thiện với môi trường, 
                                        góp phần bảo vệ hành tinh xanh.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Services Section */}
            <section className="about-services">
                <Container>
                    <Row>
                        <Col lg={12} className="text-center mb-5">
                            <h2 className="section-title">Dịch vụ của chúng tôi</h2>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={3} md={6} className="mb-4">
                            <div className="service-item text-center">
                                <div className="service-icon">
                                    <FaShippingFast />
                                </div>
                                <h5>Giao hàng nhanh</h5>
                                <p>Giao hàng toàn quốc trong 1-3 ngày</p>
                            </div>
                        </Col>
                        <Col lg={3} md={6} className="mb-4">
                            <div className="service-item text-center">
                                <div className="service-icon">
                                    <FaHandshake />
                                </div>
                                <h5>Bảo hành uy tín</h5>
                                <p>Chế độ bảo hành và đổi trả linh hoạt</p>
                            </div>
                        </Col>
                        <Col lg={3} md={6} className="mb-4">
                            <div className="service-item text-center">
                                <div className="service-icon">
                                    <FaHome />
                                </div>
                                <h5>Tư vấn thiết kế</h5>
                                <p>Hỗ trợ tư vấn bố trí không gian sống</p>
                            </div>
                        </Col>
                        <Col lg={3} md={6} className="mb-4">
                            <div className="service-item text-center">
                                <div className="service-icon">
                                    <FaUsers />
                                </div>
                                <h5>Hỗ trợ 24/7</h5>
                                <p>Đội ngũ chăm sóc khách hàng tận tình</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Mission Section */}
            <section className="about-mission">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6}>
                            <div className="mission-image">
                                <img 
                                    src="/images/mission.jpg" 
                                    alt="Sứ mệnh HomeLife Store" 
                                    className="img-fluid rounded"
                                />
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="mission-content">
                                <h2 className="section-title">Sứ mệnh của chúng tôi</h2>
                                <p>
                                    Tại HomeLife Store, chúng tôi tin rằng mỗi ngôi nhà đều xứng đáng có những 
                                    sản phẩm tốt nhất. Sứ mệnh của chúng tôi là:
                                </p>
                                <ul className="mission-list">
                                    <li>Mang đến những sản phẩm đồ gia dụng chất lượng cao với giá cả hợp lý</li>
                                    <li>Tạo ra trải nghiệm mua sắm thuận tiện và đáng tin cậy</li>
                                    <li>Hỗ trợ khách hàng tạo nên không gian sống lý tưởng</li>
                                    <li>Đóng góp vào việc nâng cao chất lượng cuộc sống của mọi gia đình Việt</li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Team Section */}
            <section className="about-team">
                <Container>
                    <Row>
                        <Col lg={12} className="text-center mb-5">
                            <h2 className="section-title">Đội ngũ của chúng tôi</h2>
                            <p className="section-subtitle">
                                Những con người tận tâm đằng sau thành công của HomeLife Store
                            </p>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={4} md={6} className="mb-4">
                            <Card className="team-card">
                                {/* <div className="team-image">
                                    <img src="/images/team-1.jpg" alt="CEO" className="img-fluid" />
                                </div> */}
                                <Card.Body className="text-center">
                                    <h5>Nguyễn Văn A</h5>
                                    <p className="team-position">Giám đốc điều hành</p>
                                    <p>10+ năm kinh nghiệm trong lĩnh vực bán lẻ đồ gia dụng</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4} md={6} className="mb-4">
                            <Card className="team-card">
                                {/* <div className="team-image">
                                    <img src="/images/team-2.jpg" alt="Product Manager" className="img-fluid" />
                                </div> */}
                                <Card.Body className="text-center">
                                    <h5>Trần Thị B</h5>
                                    <p className="team-position">Quản lý sản phẩm</p>
                                    <p>Chuyên gia về thiết kế nội thất và xu hướng đồ gia dụng</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4} md={6} className="mb-4">
                            <Card className="team-card">
                                {/* <div className="team-image">
                                    <img src="/images/team-3.jpg" alt="Customer Service" className="img-fluid" />
                                </div> */}
                                <Card.Body className="text-center">
                                    <h5>Lê Văn C</h5>
                                    <p className="team-position">Trưởng phòng chăm sóc khách hàng</p>
                                    <p>Đảm bảo mọi khách hàng đều có trải nghiệm tuyệt vời</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default About;
