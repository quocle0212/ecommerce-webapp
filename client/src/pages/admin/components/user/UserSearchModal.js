import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSearch, FaUndo } from 'react-icons/fa';

const UserSearchModal = ({ showSearchModal, setShowSearchModal, searchCriteria, handleSearch, handleResetSearch, handleSearchSubmit }) => {
    return (
        <Modal show={showSearchModal} onHide={() => setShowSearchModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Tìm kiếm người dùng</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Label>Họ tên</Form.Label>
                            <Form.Control
                                type="text"
                                value={searchCriteria.name || ''}
                                onChange={(e) => handleSearch(e.target.value, 'name')}
                                placeholder="Nhập tên người dùng"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={searchCriteria.email || ''}
                                onChange={(e) => handleSearch(e.target.value, 'email')}
                                placeholder="Nhập email"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Label>Vai trò</Form.Label>
                            <Form.Select
                                value={searchCriteria.user_type || ''}
                                onChange={(e) => handleSearch(e.target.value, 'user_type')}
                            >
                                <option value="">Tất cả</option>
                                <option value="USER">Người dùng</option>
                                <option value="ADMIN">Quản trị viên</option>
                                <option value="STAFF">Nhân viên</option>
                                <option value="SHIPPER">Người giao hàng</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowSearchModal(false)}>
                    Hủy
                </Button>
                <Button variant="warning" onClick={handleResetSearch} className="me-2">
                    <FaUndo className="me-1" /> Đặt lại
                </Button>
                <Button variant="primary" onClick={handleSearchSubmit}>
                    <FaSearch className="me-1" /> Tìm kiếm
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserSearchModal;
