import React, {useEffect, useState} from 'react';
import {Breadcrumb, Button, Col, Container, Dropdown, Image, Nav, Pagination, Row, Table} from 'react-bootstrap';
import productService from '../../../api/productService';
import {Link, useSearchParams} from "react-router-dom";
import ProductModal from '../components/product/ProductModal';
import DeleteConfirmationModal from '../components/product/ProductDeleteConfirmationModal';
import apiUpload from "../../../api/apiUpload";
import {FaEdit, FaPlusCircle, FaSearch, FaTrash} from "react-icons/fa";
import {createSlug} from "../../../helpers/formatters";
import { DEFAULT_AVATAR } from '../../../helpers/StatusLabel';
import ProductSearchForm from '../components/product/ProductSearchForm';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState({ total: 0, total_page: 1, page: 1, page_size: 10 });
    // Thêm state để theo dõi trang hiện tại
    const [currentPage, setCurrentPage] = useState(1);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewAlbumImages, setPreviewAlbumImages] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    // State quản lý tiêu chí tìm kiếm
    const [searchCriteria, setSearchCriteria] = useState({
        name: searchParams.get('name') || '',
        category_id: searchParams.get('category_id') || '',
        brand_id: searchParams.get('brand_id') || '',
        price_from: searchParams.get('price_from') || '',
    });

    const defaultImage = DEFAULT_AVATAR;

    const fetchProducts = async (params) => {
        try {
            const response = await productService.getLists(params);
            console.log("Products response:", response.data);
            console.log("Meta data:", response.data.meta);
            setProducts(response.data.data);
            setMeta(response.data.meta);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        const params = Object.fromEntries([...searchParams]);
        const page = Number(params.page) || 1;
        // Cập nhật currentPage từ searchParams để đảm bảo đồng bộ
        setCurrentPage(page);
        fetchProducts({ ...params, page: page, page_size: params.page_size || 10 });
    }, [searchParams]);

    const handleAddEditProduct = async (values) => {
        // const editorContent = quillRef.current.getEditor().getText();
        const productData = {
            ...values,
            price: Number(values.price, 10),
            avatar: productImage || editingProduct?.avatar || defaultImage,
            content: description,
            categoryId: values.category,
            brandId: values.brand,
            images: null,
            slug: createSlug(values.name)
        };
        try {

            // Upload từng ảnh trong mảng `values.album` và lấy link ảnh
            if (values.albumImages && values.albumImages.length > 0) {
                productData.images = await Promise.all(
                    values.albumImages.map(async (file) => {
                        const response = await apiUpload.uploadImage(file);
                        return response.data; // Giả sử `response.data` chứa link ảnh sau khi upload
                    })
                );
            }

            console.info("===========[] ===========[productData] : ",productData);

            if (editingProduct) {
                await productService.update(editingProduct.id, productData);
            } else {
                await productService.add(productData);
            }

            // Reset form và state
            setEditingProduct(null);
            setShowProductModal(false);
            setProductImage(null);
            setDescription('');
            setPreviewAlbumImages([]);

            // Reload danh sách sản phẩm với tham số hiện tại
            const currentParams = Object.fromEntries([...searchParams]);
            await fetchProducts({ ...currentParams, page: currentPage, page_size: currentParams.page_size || 10 });
        } catch (error) {
            console.error("Error adding/updating product:", error);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            try {
                const response = await apiUpload.uploadImage(file);
                setProductImage(response.data);
            } catch (error) {
                console.error("Error uploading image:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeleteProduct = async () => {
        try {
            await productService.delete(productToDelete.id);
            setShowDeleteModal(false);
            setProductToDelete(null);

            // Reload danh sách sản phẩm với tham số hiện tại
            const currentParams = Object.fromEntries([...searchParams]);
            await fetchProducts({ ...currentParams, page: currentPage, page_size: currentParams.page_size || 10 });
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    // const openProductModal = (product = null) => {
    //     setEditingProduct(product);
    //     setShowProductModal(true);
    //     if (product !== null) setProductImage(product.avatar);
    // };
    const openProductModal = (product = null) => {
        setEditingProduct(product);
        setShowProductModal(true);

        if (product !== null) {
            setProductImage(product.avatar);
            setDescription(product.description || '');
            // Nếu sản phẩm có album, chuyển album thành mảng đối tượng xem trước
            if (product.images) {
                setPreviewAlbumImages(
                    product.images.map((imageUrl) => ({
                        url: imageUrl,
                        file: null, // Để trống vì đây là ảnh đã tồn tại
                    }))
                );
            } else {
                setPreviewAlbumImages([]);
            }
        } else {
            // Reset form khi thêm mới
            setProductImage(null);
            setDescription('');
            setPreviewAlbumImages([]);
        }
    };


    const handlePageChange = (page) => {
        const params = { ...Object.fromEntries([...searchParams]), page };
        setSearchParams(params);
        // Cập nhật state currentPage để đảm bảo trạng thái active được cập nhật đúng
        setCurrentPage(Number(page));
        // Không cần gọi fetchProducts ở đây vì useEffect sẽ được kích hoạt khi searchParams thay đổi
    };

    const handlePageSizeChange = (eventKey) => {
        const pageSize = Number(eventKey);
        const params = { ...Object.fromEntries([...searchParams]), page_size: pageSize, page: 1 };
        setSearchParams(params);
        // Cập nhật currentPage về 1 khi thay đổi kích thước trang
        setCurrentPage(1);
        // Không cần gọi fetchProducts ở đây vì useEffect sẽ được kích hoạt khi searchParams thay đổi
    };

    // Hàm xử lý thay đổi giá trị tìm kiếm
    const handleSearch = (value, key) => {
        setSearchCriteria(prev => ({ ...prev, [key]: value }));
    };

    // Hàm xử lý submit form tìm kiếm
    const handleSearchSubmit = () => {
        const newParams = { ...searchCriteria, page: 1 };
        // Loại bỏ các tham số trống
        Object.keys(newParams).forEach(key => {
            if (!newParams[key]) delete newParams[key];
        });
        setSearchParams(newParams);
    };

    // Hàm xử lý reset form tìm kiếm
    const handleResetSearch = () => {
        setSearchCriteria({
            name: '',
            category_id: '',
            brand_id: '',
            price_from: '',
        });
        setSearchParams({ page: 1, page_size: 10 });
    };

    return (
        <Container>
            <Row className="gutters mt-3">
                <Col xl={12}>
                    <Breadcrumb>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/">Home</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/admin/ecommerce/product">Sản phẩm</Nav.Link>
                        </Nav.Item>
                        <Breadcrumb.Item active>Index</Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>
            <Row className="gutters">
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2>Quản lý sản phẩm</h2>
                        <Button size={'sm'} variant="primary" onClick={() => openProductModal(null)}>
                            Thêm mới <FaPlusCircle className={'mx-1'} />
                        </Button>
                    </div>

                    {/* Form tìm kiếm */}
                    <ProductSearchForm
                        searchCriteria={searchCriteria}
                        handleSearch={handleSearch}
                        handleResetSearch={handleResetSearch}
                        handleSearchSubmit={handleSearchSubmit}
                    />

                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Avatar</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Thương hiệu</th>
                            <th>Giá</th>
                            <th>SL</th>
                            <th>Nhãn</th>
                            <th style={{ width: '100px' }}>Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((product, index) => (
                            <tr key={product?.id}>
                                <td>{index + 1}</td>
                                <td>
                                    <Image src={product?.avatar || defaultImage} alt="Product avatar" rounded style={{ width: '50px', height: '50px' }} />
                                </td>
                                <td>{product?.name} <br /><span>{product?.slug}</span></td>
                                <td>{product?.category?.name}</td>
                                <td>{product?.brand?.name}</td>
                                <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product?.price)}</td>
                                <td>{product?.number}</td>
                                <td>
                                    {product?.labels && product.labels.length > 0 ? (
                                        product.labels.map((label) => (
                                            <span key={label.id} className="badge bg-secondary me-1">
                                                    {label.name}
                                                </span>
                                        ))
                                    ) : (
                                        <span className="text-muted">Chưa có nhãn</span>
                                    )}
                                </td>
                                <td style={{verticalAlign: 'middle'}}>
                                    <Button size="sm" variant="primary" onClick={() => openProductModal(product)} title="Cập nhật">
                                        <FaEdit />
                                    </Button>
                                    <Button size="sm" className={'ms-2'} variant="danger" onClick={() => { setProductToDelete(product); setShowDeleteModal(true); }} title="Xoá">
                                        <FaTrash />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <Dropdown onSelect={handlePageSizeChange}>
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                Hiển thị: {meta.page_size || 10}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey="10" active={meta.page_size === 10 || !meta.page_size}>10</Dropdown.Item>
                                <Dropdown.Item eventKey="20" active={meta.page_size === 20}>20</Dropdown.Item>
                                <Dropdown.Item eventKey="50" active={meta.page_size === 50}>50</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Pagination>
                            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                            <Pagination.Prev onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} />

                            {/* Hiển thị tối đa 5 trang xung quanh trang hiện tại */}
                            {(() => {
                                const totalPages = meta.total_page || 0;
                                // Sử dụng state currentPage thay vì meta.page
                                const delta = 2; // Số trang hiển thị ở mỗi bên của trang hiện tại

                                let pages = [];

                                // Luôn hiển thị trang đầu tiên
                                if (currentPage > delta + 1) {
                                    pages.push(
                                        <Pagination.Item key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>1</Pagination.Item>
                                    );
                                    if (currentPage > delta + 2) {
                                        pages.push(<Pagination.Ellipsis key="ellipsis1" />);
                                    }
                                }

                                // Tính toán phạm vi trang cần hiển thị
                                const startPage = Math.max(1, currentPage - delta);
                                const endPage = Math.min(totalPages, currentPage + delta);

                                // Thêm các trang trong phạm vi
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <Pagination.Item
                                            key={i}
                                            active={i === currentPage}
                                            onClick={() => handlePageChange(i)}
                                        >
                                            {i}
                                        </Pagination.Item>
                                    );
                                }

                                // Luôn hiển thị trang cuối cùng
                                if (currentPage < totalPages - delta) {
                                    if (currentPage < totalPages - delta - 1) {
                                        pages.push(<Pagination.Ellipsis key="ellipsis2" />);
                                    }
                                    pages.push(
                                        <Pagination.Item
                                            key={totalPages}
                                            active={currentPage === totalPages}
                                            onClick={() => handlePageChange(totalPages)}
                                        >
                                            {totalPages}
                                        </Pagination.Item>
                                    );
                                }

                                return pages;
                            })()}

                            <Pagination.Next onClick={() => handlePageChange(Math.min(currentPage + 1, meta.total_page))} disabled={currentPage === meta.total_page} />
                            <Pagination.Last onClick={() => handlePageChange(meta.total_page)} disabled={currentPage === meta.total_page} />
                        </Pagination>
                    </div>
                </Col>
            </Row>

            <ProductModal
                showProductModal={showProductModal}
                setShowProductModal={setShowProductModal}
                editingProduct={editingProduct}
                productImage={productImage}
                handleImageChange={handleImageChange}
                description={description}
                setDescription={setDescription}
                handleAddEditProduct={handleAddEditProduct}
                loading={loading}
                previewAlbumImages={previewAlbumImages}
                setPreviewAlbumImages={setPreviewAlbumImages}
            />

            <DeleteConfirmationModal
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                handleDeleteProduct={handleDeleteProduct}
            />
        </Container>
    );
};

export default ProductManager;
