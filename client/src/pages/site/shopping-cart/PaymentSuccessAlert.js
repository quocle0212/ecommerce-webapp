import React, { useEffect, useState, startTransition } from 'react';
import { Container, Button, Spinner } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toastr from "toastr";

const PaymentSuccessAlert = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);

    return (
        <Container className="text-center py-5">
            <FaCheckCircle size={80} className="text-success mb-4" />
            <h1 className="mb-3">Thông báo!</h1>
            <p>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ để xác nhận đơn hàng sớm nhất.</p>
            <Button
                variant="primary"
                onClick={() => {
                    startTransition(() => {
                        navigate('/');
                    });
                    }}
                className="mt-3"
            >
                Quay lại trang chủ
            </Button>
        </Container>
    );
};

export default PaymentSuccessAlert;
