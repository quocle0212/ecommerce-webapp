import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FaSearch, FaUndo } from 'react-icons/fa';
import menuService from '../../../../api/menuService';

const ArticleSearchForm = ({ searchCriteria, handleSearch, handleResetSearch, handleSearchSubmit }) => {
    const [menus, setMenus] = useState([]);

    // Lấy danh sách menu khi component được mount
    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const response = await menuService.getLists();
                setMenus(response.data.data);
            } catch (error) {
                console.error("Error fetching menus:", error);
            }
        };
        fetchMenus();
    }, []);

    return (
        <Form className="mb-4 p-3 border rounded bg-light">
            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên bài viết</Form.Label>
                        <Form.Control
                            type="text"
                            value={searchCriteria.name || ''}
                            onChange={(e) => handleSearch(e.target.value, 'name')}
                            placeholder="Nhập tên bài viết"
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Chuyên mục</Form.Label>
                        <Form.Select
                            value={searchCriteria.menu_id || ''}
                            onChange={(e) => handleSearch(e.target.value, 'menu_id')}
                        >
                            <option value="">Tất cả</option>
                            {menus.map(menu => (
                                <option key={menu.id} value={menu.id}>
                                    {menu.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Trạng thái</Form.Label>
                        <Form.Select
                            value={searchCriteria.status || ''}
                            onChange={(e) => handleSearch(e.target.value, 'status')}
                        >
                            <option value="">Tất cả</option>
                            <option value="published">Đã xuất bản</option>
                            <option value="draft">Bản nháp</option>
                            <option value="pending">Chờ duyệt</option>
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

export default ArticleSearchForm;
