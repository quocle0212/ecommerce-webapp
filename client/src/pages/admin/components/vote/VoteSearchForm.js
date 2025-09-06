import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FaSearch, FaUndo } from 'react-icons/fa';

const VoteSearchForm = ({ searchCriteria, handleSearch, handleResetSearch, handleSearchSubmit }) => {
    return (
        <Form className="mb-4 p-3 border rounded bg-light">
            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên sản phẩm</Form.Label>
                        <Form.Control
                            type="text"
                            value={searchCriteria.product_name || ''}
                            onChange={(e) => handleSearch(e.target.value, 'product_name')}
                            placeholder="Nhập tên sản phẩm"
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên người dùng</Form.Label>
                        <Form.Control
                            type="text"
                            value={searchCriteria.user_name || ''}
                            onChange={(e) => handleSearch(e.target.value, 'user_name')}
                            placeholder="Nhập tên người dùng"
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Đánh giá</Form.Label>
                        <Form.Select
                            value={searchCriteria.rating || ''}
                            onChange={(e) => handleSearch(e.target.value, 'rating')}
                        >
                            <option value="">Tất cả</option>
                            <option value="1">1 sao</option>
                            <option value="2">2 sao</option>
                            <option value="3">3 sao</option>
                            <option value="4">4 sao</option>
                            <option value="5">5 sao</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
            <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={handleResetSearch}>
                    <FaUndo className="me-1" /> Đặt lại
                </Button>
                <Button variant="primary" onClick={handleSearchSubmit}>
                    <FaSearch className="me-1" /> Tìm kiếm
                </Button>
            </div>
        </Form>
    );
};

export default VoteSearchForm;
