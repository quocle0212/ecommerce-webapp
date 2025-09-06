import React from "react";
import { Form, Button } from "react-bootstrap";
import { FaCheckCircle, FaShoppingCart, FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../site/shopping-cart/Cart.css";

const CheckoutForm = ({
                          userInfo,
                          handleUserInfoChange,
                          shippingMethod,
                          setShippingMethod,
                          paymentMethods,
                          paymentMethod,
                          handlePaymentChange,
                          handleSubmit,
                          isLoading,
                          errors,
                      }) => {
    return (
        <div className="checkout-form">
            <h4>Thông tin vận chuyển</h4>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={userInfo.name}
                        onChange={handleUserInfoChange}
                        placeholder="Nhập họ và tên"
                        isInvalid={!!errors?.name}
                    />
                    {errors?.name && (
                        <Form.Control.Feedback type="invalid">
                            {errors.name}
                        </Form.Control.Feedback>
                    )}
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={userInfo.email}
                        onChange={handleUserInfoChange}
                        placeholder="Nhập email"
                        isInvalid={!!errors?.email}
                    />
                    {errors?.email && (
                        <Form.Control.Feedback type="invalid">
                            {errors.email}
                        </Form.Control.Feedback>
                    )}
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Điện thoại <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        type="text"
                        name="phone"
                        value={userInfo.phone}
                        onChange={handleUserInfoChange}
                        placeholder="Nhập số điện thoại (VD: 0901234567)"
                        isInvalid={!!errors?.phone}
                    />
                    {errors?.phone && (
                        <Form.Control.Feedback type="invalid">
                            {errors.phone}
                        </Form.Control.Feedback>
                    )}
                    <Form.Text className="text-muted">
                        Số điện thoại Việt Nam (10-11 chữ số, bắt đầu với 03, 05, 07, 08, 09)
                    </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Địa chỉ <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        type="text"
                        name="address"
                        value={userInfo.address}
                        onChange={handleUserInfoChange}
                        placeholder="Nhập địa chỉ giao hàng chi tiết"
                        isInvalid={!!errors?.address}
                    />
                    {errors?.address && (
                        <Form.Control.Feedback type="invalid">
                            {errors.address}
                        </Form.Control.Feedback>
                    )}
                    <Form.Text className="text-muted">
                        Vui lòng nhập địa chỉ chi tiết bao gồm số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố
                    </Form.Text>
                </Form.Group>

                <h4>Phương thức vận chuyển</h4>
                <Form.Group className="mb-3">
                    <Form.Check
                        type="radio"
                        label="Local Pickup - Miễn phí vận chuyển"
                        name="shippingMethod"
                        value="localPickup"
                        checked={shippingMethod === "localPickup"}
                        onChange={(e) => setShippingMethod(e.target.value)}
                    />
                    {/* <Form.Check
                        type="radio"
                        label="Flat Rate - $20.00"
                        name="shippingMethod"
                        value="flatRate"
                        checked={shippingMethod === "flatRate"}
                        onChange={(e) => setShippingMethod(e.target.value)}
                    /> */}
                </Form.Group>

                <h4>Phương thức thanh toán</h4>
                <Form.Group className="mb-3">
                    {paymentMethods.length > 0 ? (
                        paymentMethods.map((method) => (
                            <Form.Check
                                type="radio"
                                label={method.name}
                                name="paymentMethod"
                                value={method.id}
                                checked={paymentMethod === method.id}
                                onChange={() => handlePaymentChange(method.id)}
                                key={method.id}
                                isInvalid={!!errors?.paymentMethod}
                            />
                        ))
                    ) : (
                        <p>Đang tải phương thức thanh toán...</p>
                    )}
                    {errors?.paymentMethod && (
                        <div className="invalid-feedback d-block">
                            {errors.paymentMethod}
                        </div>
                    )}
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center">
                    <Link
                        className="font-italic text-white btn btn-danger"
                        to="/cart"
                    >
                        <FaShoppingCart className="me-2" />
                        Về giỏ hàng
                    </Link>
                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <FaSpinner className="me-2 spinner-border spinner-border-sm" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <FaCheckCircle className="me-2" />
                                Xác nhận Đặt hàng
                            </>
                        )}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default CheckoutForm;
