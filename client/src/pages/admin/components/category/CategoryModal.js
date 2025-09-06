import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Form, Button } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {FaSave, FaTimes} from "react-icons/fa";
import apiUpload from '../../../../api/apiUpload';

const DEFAULT_AVATAR = '/images/default-category.png';

const CategoryModal = ({
                           showCategoryModal,
                           setShowCategoryModal,
                           closeCategoryModal,
                           editingCategory,
                           handleAddEditCategory,
                           loading
                       }) => {
    const [categoryImage, setCategoryImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (editingCategory) {
            setCategoryImage(editingCategory.avatar);
            setImagePreview(editingCategory.avatar);
        } else {
            setCategoryImage(null);
            setImagePreview(null);
        }
    }, [editingCategory, showCategoryModal]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Tạo preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            try {
                // Upload ảnh lên server
                const uploadResponse = await apiUpload.uploadImageResponse(file);
                if (uploadResponse) {
                    setCategoryImage(uploadResponse);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    };

    const handleSubmit = (values) => {
        const categoryData = {
            ...values,
            avatar: categoryImage
        };
        handleAddEditCategory(categoryData);
    };

    const handleCloseModal = () => {
        setCategoryImage(null);
        setImagePreview(null);
        if (closeCategoryModal) {
            closeCategoryModal();
        } else {
            setShowCategoryModal(false);
        }
    };

    return (
        <Modal show={showCategoryModal} onHide={handleCloseModal} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{editingCategory ? 'Cập nhật danh mục' : 'Thêm mới danh mục'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={{
                        name: editingCategory?.name || '',
                        description: editingCategory?.description || '',
                    }}
                    validationSchema={Yup.object({
                        name: Yup.string().required('Tên danh mục không được để trống'),
                        description: Yup.string().required('Mô tả không được để trống'),
                    })}
                    onSubmit={handleSubmit}
                >
                    {({ handleSubmit: formikSubmit }) => (
                        <Form onSubmit={formikSubmit}>
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ảnh danh mục</Form.Label>
                                        <div className="category-image-preview mb-2">
                                            <img
                                                src={imagePreview || categoryImage || DEFAULT_AVATAR}
                                                alt="Category"
                                                className="img-fluid rounded"
                                                style={{
                                                    width: '100%',
                                                    height: '200px',
                                                    objectFit: 'cover',
                                                    border: '1px solid #dee2e6'
                                                }}
                                            />
                                        </div>
                                        <Form.Control
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                        <Form.Text className="text-muted">
                                            Chọn ảnh đại diện cho danh mục (JPG, PNG)
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tên danh mục</Form.Label>
                                        <Field name="name" className="form-control" />
                                        <ErrorMessage name="name" component="div" className="text-danger" />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Mô tả</Form.Label>
                                        <Field name="description" className="form-control" as="textarea" rows={5} />
                                        <ErrorMessage name="description" component="div" className="text-danger" />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={handleCloseModal}
                                    disabled={loading}
                                >
                                    <FaTimes className="me-2" />
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading}
                                >
                                    <FaSave className="me-2" />
                                    {loading ? 'Đang xử lý...' : (editingCategory ? 'Cập nhật' : 'Thêm mới')}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default CategoryModal;
