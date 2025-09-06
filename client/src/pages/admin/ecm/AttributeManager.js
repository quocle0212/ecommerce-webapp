import React, { useState, useEffect } from 'react';
import {Container, Row, Col, Button, Pagination, Breadcrumb, Nav} from 'react-bootstrap';
import {Link, useSearchParams} from "react-router-dom";
import apiAttributeService from '../../../api/apiAttributeService';
import {FaPlusCircle} from "react-icons/fa";
import ModelConfirmDeleteData from "../../components/model-delete/ModelConfirmDeleteData";
import {createSlug} from "../../../helpers/formatters";
import AttributeTable from "../components/attribute/AttributeTable";
import DataModal from "../components/attribute/DataModal";
import apiUpload from '../../../api/apiUpload';
import PaginationPage from '../../../components/common/PaginationPage';

const AttributeManager = () => {
    const [attributes, setAttributes] = useState([]);
    const [meta, setMeta] = useState({ total: 0, total_page: 1, page: 1, page_size: 10 });
    const [editingCategory, setEditingCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchCriteria, setSearchCriteria] = useState({
        name: searchParams.get('name') || '',
    });

    const fetchCategoriesWithParams = async (params) => {
        try {
            const response = await apiAttributeService.getLists(params);
            setAttributes(response.data.data);
            setMeta(response.data.meta);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        const params = Object.fromEntries([...searchParams]);
        fetchCategoriesWithParams({ ...params, page: params.page || 1, page_size: params.page_size || 10 });
    }, [searchParams]);

    const handlePageChange = (newPage) => {
        setSearchParams({ ...searchCriteria, page: newPage });
    };

    const handleAddEditCategory = async (values) => {
        setLoading(true);
        try {
            console.info("===========[handleAddEditCategory] ===========[values] : ",values);
            values = {
                ...values,
                slug : createSlug(values.name)
            }
			

            if (editingCategory) {
                const response = await apiAttributeService.update(editingCategory.id, {...editingCategory, ...values});
                const params = Object.fromEntries([...searchParams]);
                fetchCategoriesWithParams({ ...params, page: params.page || 1, page_size: params.page_size || 10 });
            } else {
                const response = await apiAttributeService.add(values);
                const params = Object.fromEntries([...searchParams]);
                fetchCategoriesWithParams({ ...params, page: params.page || 1, page_size: params.page_size || 10 });
            }
            setEditingCategory(null);
            setShowCategoryModal(false);
        } catch (error) {
            console.error("Error adding/updating category:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteData = async () => {
        try {
            await apiAttributeService.delete(categoryToDelete.id);

        } catch (error) {
            console.error("Error deleting category:", error);
        } finally {

        }
        const params = Object.fromEntries([...searchParams]);
        await fetchCategoriesWithParams({...params, page: params.page || 1, page_size: params.page_size || 10});
        setShowDeleteModal(false);
    };

    const openCategoryModal = (category = null) => {
        setEditingCategory(category);
        setShowCategoryModal(true);
    };

    return (
        <Container>
            <Row className="gutters mt-3">
                <Col xl={12}>
                    <Breadcrumb>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/admin/ecommerce/categories">Thuộc tính</Nav.Link>
                        </Nav.Item>
                        <Breadcrumb.Item active>Index</Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>
            <Row className="gutters">
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2>Quản lý thuộc tính</h2>
                        <div>
                            <Button size={'sm'} variant="primary" onClick={() => openCategoryModal(null)}>
                                Thêm mới <FaPlusCircle className={'mx-1'} />
                            </Button>
                        </div>
                    </div>
                    <AttributeTable
                        attributes={attributes}
                        openCategoryModal={openCategoryModal}
                        setCategoryToDelete={setCategoryToDelete}
                        setShowDeleteModal={setShowDeleteModal}
                    />
                    {meta && meta.total > 0 && (
                       <PaginationPage meta={meta} handlePageChange={handlePageChange}/>
                    )}
                </Col>
            </Row>

            {showCategoryModal && <DataModal
                showCategoryModal={showCategoryModal}
                setShowCategoryModal={setShowCategoryModal}
                editingCategory={editingCategory}
                handleAddEditCategory={handleAddEditCategory}
                loading={loading}
            />}

            <ModelConfirmDeleteData
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                handleDeleteData={handleDeleteData}
            />
        </Container>
    );
};

export default AttributeManager;
