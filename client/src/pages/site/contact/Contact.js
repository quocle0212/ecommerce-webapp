import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.name || !formData.email || !formData.message) {
            setAlertType('danger');
            setAlertMessage('Vui lòng điền đầy đủ thông tin bắt buộc!');
            setShowAlert(true);
            return;
        }

        try {
            // Here you would typically send the data to your API
            console.log('Contact form data:', formData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setAlertType('success');
            setAlertMessage('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
            setShowAlert(true);
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            setAlertType('danger');
            setAlertMessage('Có lỗi xảy ra. Vui lòng thử lại sau!');
            setShowAlert(true);
        }
    };

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <section className="contact-hero">
                <Container>
                    <Row>
                        <Col lg={12} className="text-center">
                            <h1 className="contact-title">
                                Liên hệ với <span className="highlight">HomeLife Store</span>
                            </h1>
                            <p className="contact-subtitle">
                                Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh dưới đây.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Contact Info Section */}
            <section className="contact-info">
                <Container>
                    <Row>
                        <Col lg={3} md={6} className="mb-4">
                            <Card className="contact-card h-100">
                                <Card.Body className="text-center">
                                    <div className="contact-icon">
                                        <FaPhone />
                                    </div>
                                    <h5>Điện thoại</h5>
                                    <p>Hotline: <strong>1900 1234</strong></p>
                                    <p>Zalo: <strong>0987 654 321</strong></p>
                                    <small className="text-muted">8:00 - 22:00 (Hàng ngày)</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3} md={6} className="mb-4">
                            <Card className="contact-card h-100">
                                <Card.Body className="text-center">
                                    <div className="contact-icon">
                                        <FaEnvelope />
                                    </div>
                                    <h5>Email</h5>
                                    <p><strong>info@homelifestore.vn</strong></p>
                                    <p><strong>support@homelifestore.vn</strong></p>
                                    <small className="text-muted">Phản hồi trong 24h</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3} md={6} className="mb-4">
                            <Card className="contact-card h-100">
                                <Card.Body className="text-center">
                                    <div className="contact-icon">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <h5>Địa chỉ</h5>
                                    <p><strong>123 Đường ABC, Quận 1</strong></p>
                                    <p><strong>TP. Hồ Chí Minh</strong></p>
                                    <small className="text-muted">Showroom & Kho hàng</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3} md={6} className="mb-4">
                            <Card className="contact-card h-100">
                                <Card.Body className="text-center">
                                    <div className="contact-icon">
                                        <FaClock />
                                    </div>
                                    <h5>Giờ làm việc</h5>
                                    <p><strong>T2 - T6: 8:00 - 18:00</strong></p>
                                    <p><strong>T7 - CN: 8:00 - 17:00</strong></p>
                                    <small className="text-muted">Nghỉ các ngày lễ</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Contact Form & Map Section */}
            <section className="contact-form-section">
                <Container>
                    <Row>
                        <Col lg={8} className="mb-5">
                            <Card className="contact-form-card">
                                <Card.Body>
                                    <h3 className="form-title">Gửi tin nhắn cho chúng tôi</h3>
                                    <p className="form-subtitle">
                                        Điền thông tin vào form dưới đây, chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể.
                                    </p>
                                    
                                    {showAlert && (
                                        <Alert 
                                            variant={alertType} 
                                            onClose={() => setShowAlert(false)} 
                                            dismissible
                                        >
                                            {alertMessage}
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Họ và tên *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập họ và tên"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Email *</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập địa chỉ email"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Số điện thoại</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập số điện thoại"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Chủ đề</Form.Label>
                                                    <Form.Select
                                                        name="subject"
                                                        value={formData.subject}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Chọn chủ đề</option>
                                                        <option value="product-inquiry">Hỏi về sản phẩm</option>
                                                        <option value="order-support">Hỗ trợ đơn hàng</option>
                                                        <option value="warranty">Bảo hành</option>
                                                        <option value="partnership">Hợp tác kinh doanh</option>
                                                        <option value="other">Khác</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Nội dung tin nhắn *</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                placeholder="Nhập nội dung tin nhắn..."
                                                required
                                            />
                                        </Form.Group>
                                        <Button type="submit" className="contact-submit-btn">
                                            Gửi tin nhắn
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4}>
                            <Card className="map-card">
                                <Card.Body>
                                    <h5>Vị trí showroom</h5>
                                    <div className="map-container">
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326002932!2d106.69975731533414!3d10.776530192318146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3332a4d9%3A0x6d1b49e8b3c7e4a!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIFRQLkhDTQ!5e0!3m2!1svi!2s!4v1635123456789!5m2!1svi!2s"
                                            width="100%"
                                            height="300"
                                            style={{ border: 0, borderRadius: '10px' }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="HomeLife Store Location"
                                        ></iframe>
                                    </div>
                                </Card.Body>
                            </Card>

                            <Card className="social-card mt-4">
                                <Card.Body>
                                    <h5>Kết nối với chúng tôi</h5>
                                    <div className="social-links">
                                        <a href="#" className="social-link facebook">
                                            <FaFacebookF />
                                            <span>Facebook</span>
                                        </a>
                                        <a href="#" className="social-link instagram">
                                            <FaInstagram />
                                            <span>Instagram</span>
                                        </a>
                                        <a href="#" className="social-link youtube">
                                            <FaYoutube />
                                            <span>YouTube</span>
                                        </a>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <Container>
                    <Row>
                        <Col lg={12} className="text-center mb-5">
                            <h2 className="section-title">Câu hỏi thường gặp</h2>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={6} className="mb-4">
                            <Card className="faq-card">
                                <Card.Body>
                                    <h6>Làm thế nào để đặt hàng?</h6>
                                    <p>Bạn có thể đặt hàng trực tuyến qua website hoặc gọi hotline 1900 1234. Chúng tôi hỗ trợ nhiều hình thức thanh toán tiện lợi.</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={6} className="mb-4">
                            <Card className="faq-card">
                                <Card.Body>
                                    <h6>Thời gian giao hàng là bao lâu?</h6>
                                    <p>Đơn hàng trong nội thành TP.HCM: 1-2 ngày. Đơn hàng tỉnh thành khác: 2-5 ngày làm việc tùy theo khu vực.</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={6} className="mb-4">
                            <Card className="faq-card">
                                <Card.Body>
                                    <h6>Chính sách đổi trả như thế nào?</h6>
                                    <p>Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày với sản phẩm còn nguyên vẹn, chưa sử dụng và có hóa đơn mua hàng.</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={6} className="mb-4">
                            <Card className="faq-card">
                                <Card.Body>
                                    <h6>Có hỗ trợ bảo hành không?</h6>
                                    <p>Tất cả sản phẩm đều được bảo hành theo chính sách của nhà sản xuất. Chúng tôi hỗ trợ bảo hành tại showroom hoặc qua đối tác.</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Contact;
