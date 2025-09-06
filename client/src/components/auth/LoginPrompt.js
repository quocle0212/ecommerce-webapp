import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaLock, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

const LoginPrompt = ({ show, onHide, title, message, redirectPath = null }) => {
    const handleLoginClick = () => {
        // Lưu đường dẫn để chuyển hướng sau khi login
        if (redirectPath) {
            localStorage.setItem('returnUrl', redirectPath);
        }
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title className="d-flex align-items-center">
                    <FaLock className="me-2" />
                    {title || 'Yêu cầu đăng nhập'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center py-4">
                <div className="mb-3">
                    <FaLock size={48} className="text-primary mb-3" />
                </div>
                <h5 className="mb-3">
                    {message || 'Vui lòng đăng nhập để tiếp tục'}
                </h5>
                <p className="text-muted">
                    Bạn cần có tài khoản để sử dụng tính năng này. 
                    Đăng nhập ngay để có trải nghiệm mua sắm tốt nhất!
                </p>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-center">
                <Button 
                    variant="outline-secondary" 
                    onClick={onHide}
                    className="me-2"
                >
                    Để sau
                </Button>
                <Link 
                    to="/login" 
                    className="btn btn-primary me-2"
                    onClick={handleLoginClick}
                >
                    <FaSignInAlt className="me-2" />
                    Đăng nhập
                </Link>
                <Link 
                    to="/register" 
                    className="btn btn-success"
                    onClick={onHide}
                >
                    <FaUserPlus className="me-2" />
                    Đăng ký
                </Link>
            </Modal.Footer>
        </Modal>
    );
};

export default LoginPrompt; 