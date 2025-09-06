import React, { useState } from 'react';
import { Modal, Button, Alert, Table, Badge } from 'react-bootstrap';
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import apiOrderService from "../../../../api/apiOrderService";
import toastr from "toastr";

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getStatusBadge = (status) => {
    const statusMap = {
        'pending': { variant: 'warning', text: 'Chờ xử lý' },
        'processing': { variant: 'info', text: 'Đang xử lý' },
        'completed': { variant: 'success', text: 'Hoàn thành' },
        'canceled': { variant: 'danger', text: 'Đã hủy' },
        'returned': { variant: 'secondary', text: 'Đã trả hàng' }
    };
    const statusInfo = statusMap[status] || { variant: 'secondary', text: status };
    return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
};

const getPaymentStatusBadge = (paymentStatus) => {
    const statusMap = {
        'pending': { variant: 'warning', text: 'Chờ thanh toán' },
        'completed': { variant: 'success', text: 'Đã thanh toán' },
        'refunding': { variant: 'info', text: 'Đang hoàn tiền' },
        'refunded': { variant: 'secondary', text: 'Đã hoàn tiền' },
        'fraud': { variant: 'danger', text: 'Gian lận' },
        'failed': { variant: 'danger', text: 'Thất bại' }
    };
    const statusInfo = statusMap[paymentStatus] || { variant: 'secondary', text: paymentStatus };
    return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
};

const UserOrderModal = ({ show, onHide, order, refreshOrders }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Kiểm tra xem có thể hủy đơn hàng không
    const canCancelOrder = () => {
        if (!order) return false;
        return order.payment_status !== 'completed' && 
               order.status !== 'completed' && 
               order.status !== 'canceled';
    };

    const handleCancelOrder = async () => {
        setIsLoading(true);
        try {
            await apiOrderService.cancelOrder(order.id);
            toastr.success('Đơn hàng đã được hủy thành công');
            setShowCancelConfirm(false);
            onHide();
            if (refreshOrders) {
                refreshOrders();
            }
        } catch (error) {
            console.error('Error canceling order:', error);
            toastr.error(error.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng');
        } finally {
            setIsLoading(false);
        }
    };

    if (!order) return null;

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đơn hàng #{order.code}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Thông tin đơn hàng */}
                    <div className="mb-4">
                        <h6>Thông tin đơn hàng</h6>
                        <div className="row">
                            <div className="col-md-6">
                                <p><strong>Mã đơn hàng:</strong> {order.code}</p>
                                <p><strong>Khách hàng:</strong> {order.user?.name}</p>
                                <p><strong>Số điện thoại:</strong> {order.user?.phone}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Trạng thái:</strong> {getStatusBadge(order.status)}</p>
                                <p><strong>Thanh toán:</strong> {getPaymentStatusBadge(order.payment_status)}</p>
                                <p><strong>Tổng tiền:</strong> {formatCurrency(order.amount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Cảnh báo nếu không thể hủy */}
                    {!canCancelOrder() && (
                        <Alert variant="info">
                            <FaExclamationTriangle className="me-2" />
                            {order.payment_status === 'completed' 
                                ? 'Không thể hủy đơn hàng đã thanh toán'
                                : order.status === 'completed'
                                ? 'Không thể hủy đơn hàng đã hoàn thành'
                                : 'Đơn hàng đã được hủy'
                            }
                        </Alert>
                    )}

                    {/* Danh sách sản phẩm */}
                    <h6>Sản phẩm đã đặt</h6>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.products?.map((product, idx) => (
                                <tr key={product.id}>
                                    <td>{idx + 1}</td>
                                    <td>{product.name}</td>
                                    <td>{product.qty}</td>
                                    <td>{formatCurrency(product.price)}</td>
                                    <td>{formatCurrency(product.price * product.qty)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* Tổng cộng */}
                    <div className="text-end">
                        <p><strong>Phí vận chuyển:</strong> {formatCurrency(order.shipping_amount || 0)}</p>
                        <h5><strong>Tổng cộng:</strong> {formatCurrency(order.amount)}</h5>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Đóng
                    </Button>
                    {canCancelOrder() && (
                        <Button 
                            variant="danger" 
                            onClick={() => setShowCancelConfirm(true)}
                            disabled={isLoading}
                        >
                            <FaTimes className="me-2" />
                            Hủy đơn hàng
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Modal xác nhận hủy đơn hàng */}
            <Modal show={showCancelConfirm} onHide={() => setShowCancelConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận hủy đơn hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning">
                        <FaExclamationTriangle className="me-2" />
                        Bạn có chắc chắn muốn hủy đơn hàng <strong>#{order.code}</strong> không?
                    </Alert>
                    <p>Hành động này không thể hoàn tác.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelConfirm(false)}>
                        Không
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleCancelOrder}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Có, hủy đơn hàng'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UserOrderModal;
