import React, { useState, useEffect } from 'react';
import {Container, Row, Col, ButtonGroup, Dropdown, Table, Pagination, Button} from 'react-bootstrap';
import { useSearchParams } from "react-router-dom";
import OrderBreadcrumbs from './components/order/OrderBreadcrumbs';
import apiOrderService from "./../../api/apiOrderService";
import {FaEdit, FaListUl, FaSearch} from "react-icons/fa";
import OrderDetailsModal from './components/order/OrderDetailsModal';
import UserOrderModal from './components/order/UserOrderModal';
import OrderSearchForm from './components/order/OrderSearchForm';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [meta, setMeta] = useState({ total: 0, total_page: 1, page: 1, page_size: 10 });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderToUpdate, setOrderToUpdate] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // State quản lý tiêu chí tìm kiếm
    const [searchCriteria, setSearchCriteria] = useState({
        code: searchParams.get('code') || '',
        status: searchParams.get('status') || '',
        payment_status: searchParams.get('payment_status') || '',
    });

    // Hàm để gọi lại API và tải danh sách đơn hàng mới nhất
    const refreshOrders = async () => {
        const params = Object.fromEntries([...searchParams]);
        await fetchOrdersWithParams({ ...params, page: params.page || 1, page_size: params.page_size || 10 });
    };

    const fetchOrdersWithParams = async (params) => {
        try {
            console.log('Fetching orders with params:', params);
            console.log('Token in localStorage:', localStorage.getItem('token'));
            const response = await apiOrderService.getLists(params);
            console.log('Orders response:', response);
            setOrders(response.data.data);
            setMeta(response.data.meta);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        refreshOrders();
    }, [searchParams]);

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };



    const handlePageChange = (newPage) => {
        const currentParams = Object.fromEntries([...searchParams]);
        setSearchParams({ ...currentParams, page: newPage });
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
            code: '',
            status: '',
            payment_status: '',
        });
        setSearchParams({ page: 1, page_size: 10 });
    };

    const handleUpdateOrderClick = (order) => {
        // User chỉ có thể xem chi tiết và hủy đơn hàng (nếu được phép)
        setOrderToUpdate(order);
    };

    const getVariant = (status) => {
        switch (status) {
            case 'pending':
                return 'primary';
            case 'completed':
                return 'success';
            case 'canceled':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    return (
        <Container>
            <Row className="gutters mt-3">
                <Col xl={12}>
                    <OrderBreadcrumbs />
                </Col>
            </Row>
            <Row className="gutters">
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2>Quản lý đơn hàng</h2>
                        {/*<Button size="sm" variant="primary" onClick={() => setOrderToUpdate({})}>*/}
                        {/*    Thêm mới <FaPlusCircle className="mx-1" />*/}
                        {/*</Button>*/}
                    </div>

                    {/* Form tìm kiếm */}
                    <OrderSearchForm
                        searchCriteria={searchCriteria}
                        handleSearch={handleSearch}
                        handleResetSearch={handleResetSearch}
                        handleSearchSubmit={handleSearchSubmit}
                    />
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Mã ĐH</th>
                            <th>Khách hàng</th>
                            <th>SĐT</th>
                            <th>Tổng tiền</th>
                            <th>PT Thanh toán</th>
                            <th>Trạng thái TT</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order, idx) => (

                            <tr key={order.id} style={{ cursor: 'pointer' }}>
                                <td onClick={() => handleOrderClick(order)}>{idx + 1}</td>
                                <td onClick={() => handleOrderClick(order)}>{order.code}</td>
                                <td onClick={() => handleOrderClick(order)}>{JSON.parse(order.meta_data)?.user_name}</td>
                                <td onClick={() => handleOrderClick(order)}>{JSON.parse(order.meta_data)?.user_phone}</td>
                                <td onClick={() => handleOrderClick(order)}>{formatCurrency(order.sub_total)}</td>
                                <td onClick={() => handleOrderClick(order)}>{order?.payment_name ?? "COD"}</td>
                                <td onClick={() => handleOrderClick(order)}>{order.payment_status}</td>
                                <td onClick={() => handleOrderClick(order)}>
                                    <span className={`text-${getVariant(order.status)}`}>{order.status}</span>
                                </td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleOrderClick(order)}
                                        className="me-2"
                                        title="Xem chi tiết"
                                    >
                                        <FaListUl />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="warning"
                                        onClick={() => handleUpdateOrderClick(order)}
                                        title="Quản lý đơn hàng"
                                    >
                                        <FaEdit />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        <Pagination.First
                            onClick={() => handlePageChange(1)}
                            disabled={meta.page === 1}
                        />
                        <Pagination.Prev
                            onClick={() => handlePageChange(meta.page - 1)}
                            disabled={meta.page === 1}
                        />
                        {Array.from({ length: meta.total_page }, (_, index) => (
                            <Pagination.Item
                                key={index + 1}
                                active={index + 1 === meta.page}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next
                            onClick={() => handlePageChange(meta.page + 1)}
                            disabled={meta.page === meta.total_page}
                        />
                        <Pagination.Last
                            onClick={() => handlePageChange(meta.total_page)}
                            disabled={meta.page === meta.total_page}
                        />
                    </Pagination>
                </Col>
            </Row>

            <OrderDetailsModal
                show={showOrderModal}
                onHide={() => setShowOrderModal(false)}
                order={selectedOrder}
            />

            <UserOrderModal
                show={!!orderToUpdate}
                onHide={() => setOrderToUpdate(null)}
                order={orderToUpdate}
                refreshOrders={refreshOrders}
            />
        </Container>
    );
};

export default OrderManager;
