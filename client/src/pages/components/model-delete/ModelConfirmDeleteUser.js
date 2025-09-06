import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { FaTrash, FaExclamationTriangle, FaCheck } from "react-icons/fa";

const ModelConfirmDeleteUser = ({ showDeleteModal, setShowDeleteModal, handleDeleteData, userToDelete }) => {
    return (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} size="md">
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <FaExclamationTriangle className="text-warning me-2" />
                    Xóa khách hàng
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant="warning" className="mb-3">
                    <FaExclamationTriangle className="me-2" />
                    <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
                </Alert>
                
                <div className="mb-3">
                    <p><strong>Bạn có chắc chắn muốn xóa khách hàng:</strong></p>
                    <div className="bg-light p-3 rounded">
                        <p className="mb-1"><strong>Tên:</strong> {userToDelete?.name}</p>
                        <p className="mb-0"><strong>Email:</strong> {userToDelete?.email}</p>
                    </div>
                </div>

                <Alert variant="danger" className="mb-0">
                    <h6 className="mb-2">Dữ liệu sẽ bị xóa vĩnh viễn:</h6>
                    <ul className="mb-0">
                        <li>Tất cả đơn hàng đã hoàn thành của khách hàng</li>
                        <li>Tất cả giao dịch liên quan</li>
                        <li>Tất cả đánh giá và nhận xét</li>
                        <li>Thông tin tài khoản khách hàng</li>
                    </ul>
                </Alert>
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => setShowDeleteModal(false)} 
                    className="d-flex align-items-center"
                >
                    <FaCheck className="me-1" /> Hủy bỏ
                </Button>
                <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={handleDeleteData} 
                    className="d-flex align-items-center"
                >
                    <FaTrash className="me-1"/> Xác nhận xóa
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModelConfirmDeleteUser;
