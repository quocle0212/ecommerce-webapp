import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';
import './Footer.css';

const Footer = ({information}) => {
    return (
        <footer className="footer">
            <Container>
                <Row className="footer-main">
                    {/* HomeLife Store */}
                    <Col lg={4} md={6} className="footer-section">
                        <h5 className="footer-title">HOMELIFE STORE - ĐỒ GIA DỤNG</h5>
                        <div className="footer-contact-item">
                            <FaPhone className="footer-contact-icon" />
                            <span>{information?.contact_number || '1900 1234'}</span>
                        </div>
                        <div className="footer-contact-item">
                            <FaEnvelope className="footer-contact-icon" />
                            <span>{information?.email || 'info@homelifestore.vn'}</span>
                        </div>
                        <div className="footer-contact-item">
                            <FaMapMarkerAlt className="footer-contact-icon" />
                            <span>{information?.full_address || '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'}</span>
                        </div>
                        <div className="footer-business-info">
                            <p>CÔNG TY TNHH HOMELIFE STORE - MST: 0123456789</p>
                        </div>
                        <div className="footer-certifications">
                            <div className="cert-placeholder">
                                <span>Bộ Công Thương</span>
                            </div>
                            <div className="cert-placeholder">
                                <span>DMCA Protected</span>
                            </div>
                        </div>
                    </Col>

                    {/* Về HomeLife Store */}
                    <Col lg={4} md={6} className="footer-section">
                        <h5 className="footer-title">VỀ HOMELIFE STORE</h5>
                        <ul className="footer-links">
                            <li><a href="/about">Giới Thiệu</a></li>
                            <li><a href="/">Sản Phẩm</a></li>
                            <li><a href="/blog">Blog & Tin Tức</a></li>
                            <li><a href="/contact">Liên hệ</a></li>
                            <li><a href="/cart">Giỏ hàng</a></li>
                        </ul>
                    </Col>

                    {/* Hỗ trợ khách hàng */}
                    <Col lg={4} md={12} className="footer-section">
                        <h5 className="footer-title">HỖ TRỢ KHÁCH HÀNG</h5>
                        <ul className="footer-links">
                            <li><a href="/cau-hoi-thuong-gap">Câu hỏi thường gặp</a></li>
                            <li><a href="/chinh-sach-bao-mat">Chính sách bảo mật</a></li>
                            <li><a href="/chinh-sach-van-chuyen">Chính sách vận chuyển</a></li>
                            <li><a href="/chinh-sach-doi-tra">Chính sách đổi trả</a></li>
                            <li><a href="/chinh-sach-thanh-toan">Chính sách thanh toán</a></li>
                            <li><a href="/chinh-sach-diem-tong">Chính sách điểm tổng</a></li>
                        </ul>
                    </Col>
                </Row>

                {/* Social Media & Copyright */}
                <Row className="footer-bottom">
                    <Col md={12} className="text-center">
                        <div className="social-media">
                            <a href="#" className="social-link">
                                <FaFacebookF />
                            </a>
                            <a href="#" className="social-link">
                                <FaInstagram />
                            </a>
                            <a href="#" className="social-link">
                                <FaTiktok />
                            </a>
                            <a href="#" className="social-link">
                                <FaYoutube />
                            </a>
                        </div>
                        <div className="copyright">
                            <p>© Bản quyền thuộc về HOMELIFE STORE - Đồ gia dụng chất lượng cao</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
