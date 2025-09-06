import React, {useEffect, useState} from 'react';
import {Breadcrumb, Button, Card, Col, Container, Form, Nav, Row, Alert, Spinner, Modal} from "react-bootstrap";
import {Link} from "react-router-dom";
import './style/Profile.css';
import userService from "../../api/userService";
import apiUpload from "../../api/apiUpload";
import {toast} from "react-toastify";
import { onErrorUser } from '../../helpers/formatters';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [avatar, setAvatar] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [activeTab, setActiveTab] = useState('update-info');
    
    // State cho modal đổi mật khẩu
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        // Gọi API lấy thông tin người dùng
        const fetchUserData = async () => {
            try {
                const response = await userService.getProfile();
                setUser(response.data);
                setPreviewAvatar(response.data.avatar); // Hiển thị avatar hiện tại
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = async (e)  => {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            try {
                const response = await apiUpload.uploadImage(file);
                setAvatar(response.data);
                setPreviewAvatar(response.data)
            } catch (error) {
                console.error("Error uploading image:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveChanges = async () => {
        const updatedData = {
            name: user.name,
            email: user.email,
            avatar: avatar || user.avatar,
            phone: user.phone
        };

        try {
            setLoading(true);
            await userService.updateProfile(updatedData);
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Cập nhật thông tin thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Mật khẩu mới không khớp!");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }

        try {
            setPasswordLoading(true);
            // Gọi API đổi mật khẩu (cần implement API này)
            // await userService.changePassword(passwordData);
            toast.success("Đổi mật khẩu thành công!");
            setShowChangePasswordModal(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error("Đổi mật khẩu thất bại!");
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container className="profile-container">
            {/* Header */}
            <Row className="gutters mt-3">
                <Col xl={12}>
                    <div className="profile-header">
                        <h2 className="profile-title">Quản lý tài khoản</h2>
                        <p className="profile-subtitle">Cập nhật thông tin và quản lý lịch làm việc</p>
                    </div>
                </Col>
            </Row>

            {/* Navigation Tabs */}
            <Row className="mt-4">
                <Col xl={12}>
                    <Nav variant="tabs" className="profile-tabs">
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'update-info'}
                                onClick={() => setActiveTab('update-info')}
                                className={activeTab === 'update-info' ? 'active-tab' : ''}
                            >
                                Cập nhật thông tin
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'register-schedule'}
                                onClick={() => setActiveTab('register-schedule')}
                                className={activeTab === 'register-schedule' ? 'active-tab' : ''}
                            >
                                Đăng ký lịch làm việc
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'manage-schedule'}
                                onClick={() => setActiveTab('manage-schedule')}
                                className={activeTab === 'manage-schedule' ? 'active-tab' : ''}
                            >
                                Quản lý lịch làm việc
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
            </Row>

            {/* Content */}
            <Row className="mt-4">
                <Col xl={12}>
                    <Card className="profile-card">
                        <Card.Body>
                            {activeTab === 'update-info' && (
                                <>
                                    <h4 className="section-title">Thông tin người dùng</h4>
                                    
                                    {/* Avatar Section */}
                                    <div className="avatar-section">
                                        <div className="avatar-container">
                                            <img
                                                src={previewAvatar || 'https://via.placeholder.com/150'}
                                                alt="Avatar" 
                                                onError={onErrorUser}
                                                className="profile-avatar"
                                            />
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <Form className="profile-form">
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Họ và tên</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={user.name}
                                                        onChange={handleInputChange}
                                                        className="profile-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={user.email}
                                                        onChange={handleInputChange}
                                                        readOnly
                                                        className="profile-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        
                                        <Row>
                                            <Col md={12}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label>Số điện thoại</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="phone"
                                                        value={user.phone}
                                                        onChange={handleInputChange}
                                                        className="profile-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Hidden file input for avatar */}
                                        <Form.Group className="mb-4" style={{display: 'none'}}>
                                            <Form.Control type="file" onChange={handleAvatarChange} id="avatar-upload" />
                                        </Form.Group>

                                        {/* Action Buttons */}
                                        <div className="profile-actions">
                                            <Button 
                                                variant="primary" 
                                                onClick={handleSaveChanges} 
                                                disabled={loading}
                                                className="save-btn"
                                            >
                                                {loading ? "Đang lưu..." : "Lưu thay đổi"}
                                            </Button>
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={() => setShowChangePasswordModal(true)}
                                                className="change-password-btn"
                                            >
                                                Đổi mật khẩu
                                            </Button>
                                        </div>
                                    </Form>
                                </>
                            )}

                            {activeTab === 'register-schedule' && (
                                <div className="tab-content">
                                    <h4 className="section-title">Đăng ký lịch làm việc</h4>
                                    <p>Chức năng đăng ký lịch làm việc sẽ được cập nhật sau.</p>
                                </div>
                            )}

                            {activeTab === 'manage-schedule' && (
                                <div className="tab-content">
                                    <h4 className="section-title">Quản lý lịch làm việc</h4>
                                    <p>Chức năng quản lý lịch làm việc sẽ được cập nhật sau.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Change Password Modal */}
            <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>🔒 Đổi mật khẩu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info" className="password-alert">
                        <strong>Lưu ý:</strong> Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                    </Alert>
                    
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu cũ *</Form.Label>
                            <Form.Control
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordInputChange}
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu mới *</Form.Label>
                            <Form.Control
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordInputChange}
                                placeholder="Nhập mật khẩu mới"
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Xác nhận mật khẩu mới *</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordInputChange}
                                placeholder="Nhập lại mật khẩu mới"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowChangePasswordModal(false)}
                    >
                        Hủy
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                    >
                        {passwordLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Profile;
