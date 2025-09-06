import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FaSearch, FaUndo } from 'react-icons/fa';
import categoryService from '../../../../api/categoryService';
import brandService from '../../../../api/brandService';

const ProductSearchForm = ({ searchCriteria, handleSearch, handleResetSearch, handleSearchSubmit }) => {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // Lấy danh sách danh mục và nhãn hiệu khi component được mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesResponse, brandsResponse] = await Promise.all([
                    categoryService.getLists(),
                    brandService.getLists()
                ]);
                setCategories(categoriesResponse.data.data);
                setBrands(brandsResponse.data.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <Form className="mb-4 p-3 border rounded bg-light">
            <Row>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên sản phẩm</Form.Label>
                        <Form.Control
                            type="text"
                            value={searchCriteria.name || ''}
                            onChange={(e) => handleSearch(e.target.value, 'name')}
                            placeholder="Nhập tên sản phẩm"
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Danh mục</Form.Label>
                        <Form.Select
                            value={searchCriteria.category_id || ''}
                            onChange={(e) => handleSearch(e.target.value, 'category_id')}
                        >
                            <option value="">Tất cả</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nhãn hiệu</Form.Label>
                        <Form.Select
                            value={searchCriteria.brand_id || ''}
                            onChange={(e) => handleSearch(e.target.value, 'brand_id')}
                        >
                            <option value="">Tất cả</option>
                            {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Giá từ</Form.Label>
                        <Form.Control
                            type="number"
                            value={searchCriteria.price_from || ''}
                            onChange={(e) => handleSearch(e.target.value, 'price_from')}
                            placeholder="Giá từ"
                        />
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

export default ProductSearchForm;
