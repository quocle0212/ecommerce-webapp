import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FaSearch, FaUndo } from 'react-icons/fa';

const OrderSearchForm = ({ searchCriteria, handleSearch, handleResetSearch, handleSearchSubmit }) => {
    return (
        <Form className="mb-4 p-3 border rounded bg-light">
            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Mã đơn hàng</Form.Label>
                        <Form.Control
                            type="text"
                            value={searchCriteria.code || ''}
                            onChange={(e) => handleSearch(e.target.value, 'code')}
                            placeholder="Nhập mã đơn hàng"
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Trạng thái đơn hàng</Form.Label>
                        <Form.Select
                            value={searchCriteria.status || ''}
                            onChange={(e) => handleSearch(e.target.value, 'status')}
                        >
                            <option value="">Tất cả</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Trạng thái thanh toán</Form.Label>
                        <Form.Select
                            value={searchCriteria.payment_status || ''}
                            onChange={(e) => handleSearch(e.target.value, 'payment_status')}
                        >
                            <option value="">Tất cả</option>
                            <option value="pending">Chờ thanh toán</option>
                            <option value="completed">Đã thanh toán</option>
                            <option value="refunding">Đang hoàn tiền</option>
                            <option value="refunded">Đã hoàn tiền</option>
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

export default OrderSearchForm;
