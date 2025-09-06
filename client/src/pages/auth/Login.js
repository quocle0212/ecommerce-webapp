import React, { startTransition, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "../site/style/Login.css";
import { loginUser, logout } from "../../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import bgImage from "../../assets/images/bg-login.jpg";
import toastr from "toastr";
import slideService from "../../api/slideService";
import { LOGO } from "../../helpers/constant";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { handlePostLoginRedirect } from "../../helpers/authHelpers";
import { loadCartFromBackend } from "../../redux/slices/cartSlice";


const Login = () => {
	const initialValues = {
		email: "",
		password: "",
	};

	const [showPassword, setShowPassword] = useState(false);

	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { loading, error, isAuthenticated } = useSelector(
		(state) => state.auth
	); // Add isAuthenticated
	const [slides, setSlides] = useState([]);

	// Lấy URL của hình ảnh từ slides (sử dụng hình ảnh đầu tiên trong danh sách)
	const backgroundImageUrl = LOGO; //slides.length > 0 ? slides[0].avatar : "";

	useEffect(() => {
		dispatch(logout());
	}, []);

	useEffect(() => {}, [isAuthenticated, navigate]);

	useEffect(() => {
		// Hàm gọi API để lấy danh sách slide
		const fetchSlides = async () => {
			try {
				const response = await slideService.getListsGuest({
					page_site: "auth",
				});
				setSlides(response.data.data);
			} catch (error) {
				console.error("Error fetching slides:", error);
			}
		};

		fetchSlides();
	}, []);

	const validationSchema = Yup.object({
		email: Yup.string()
			.email("Email không đúng định dạng")
			.required("Email không được để trống"),
		password: Yup.string()
			.min(6, "Mật khẩu phải >= 6 ký tự")
			.required("Mật khẩu không được để trống"),
	});
    const onSubmit = async (values, {setSubmitting}) => {
        try {
            const result = await dispatch(loginUser(values));
            if (loginUser?.fulfilled.match(result)) {
                let response = await unwrapResult(result);
                console.info(
                    "===========[userLogin] ===========[response math] : ",
                    response
                );
                if (response.user.user_type === "ADMIN") {
                    navigate("/admin");
                } else {
                    // ✅ Load giỏ hàng từ backend sau khi login thành công
                    startTransition(() => {
                        dispatch(loadCartFromBackend());
                    });
                    // Sử dụng helper để xử lý chuyển hướng sau login
                    handlePostLoginRedirect(navigate, "/");
                }
            } else {
                console.info("===========[] ===========[FAIL ROI] : ");
                setSubmitting(false);
            }
            return true;
        } catch (err) {
            console.info("===========[err] ===========[FAIL ROI] : ");
            toastr.error("Sai thông tin hoạc tài khoản không hợp lệ", "Error");
            setSubmitting(false);
        }
    };

	return (
		<div className="hebekery-auth-container">
			<Row className="no-gutter min-vh-100">
				<Col md={6} className="d-none d-md-flex">
					<div className="hebekery-brand-section w-100">
						{/* <img
							src={backgroundImageUrl || bgImage}
							alt="HeBekery Logo"
							className="hebekery-brand-logo"
						/> */}
						<h1 className="hebekery-brand-title">HomeLife Store</h1>
						<p className="hebekery-brand-subtitle">
							Chào mừng bạn đến với HomeLife Store - nơi mang đến những sản phẩm đồ gia dụng chất lượng cao,
							phục vụ mọi nhu cầu trong gia đình bạn.
						</p>
					</div>
				</Col>
				<Col md={6} className="d-flex align-items-center justify-content-center">
					<div className="hebekery-auth-form w-100" style={{ maxWidth: '600px' }}>
						<h2 className="hebekery-auth-title">Đăng nhập</h2>
						<p className="hebekery-auth-subtitle">
							Chào mừng bạn quay trở lại!
						</p>
						{error && error.trim() && (
							<div className="hebekery-alert">{error}</div>
						)}
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={onSubmit}
					>
						{({ isSubmitting }) => (
							<Form>
								<div className="hebekery-form-group">
									<label className="hebekery-form-label">
										Email
									</label>
									<Field
										name="email"
										type="email"
										className="hebekery-form-control"
										placeholder="Nhập email của bạn"
									/>
									<ErrorMessage
										name="email"
										component="div"
										className="hebekery-error-message"
									/>
								</div>
								<div className="hebekery-form-group">
									<label className="hebekery-form-label">
										Mật khẩu
									</label>
									<div className="hebekery-input-group">
										<Field
											name="password"
											type={showPassword ? "text" : "password"}
											className="hebekery-form-control"
											placeholder="Nhập mật khẩu"
										/>
										<div
											className="hebekery-input-group-append"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
										</div>
									</div>
									<ErrorMessage
										name="password"
										component="div"
										className="hebekery-error-message"
									/>
								</div>
								<button
									type="submit"
									className="hebekery-btn-primary"
									disabled={isSubmitting || loading}
								>
									{loading ? "Đang đăng nhập..." : "Đăng nhập"}
								</button>
								<div className="hebekery-auth-links">
									<p>
										Bạn chưa có tài khoản?
										<Link
											to="/register"
											className="hebekery-auth-link"
											onClick={(e) => {
												e.preventDefault();
												startTransition(() => {
													navigate("/register");
												});
											}}
										>
											{" "}Đăng ký tại đây
										</Link>
									</p>
									<p>
										<Link
											to="/forgot-password"
											className="hebekery-auth-link"
											onClick={(e) => {
												e.preventDefault();
												startTransition(() => {
													navigate("/forgot-password");
												});
											}}
										>
											Quên mật khẩu?
										</Link>
									</p>
									<p>
										<Link
											to="/"
											className="hebekery-auth-link"
											onClick={(e) => {
												e.preventDefault();
												startTransition(() => {
													navigate("/");
												});
											}}
										>
											← Về trang chủ
										</Link>
									</p>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</Col>
		</Row>
	</div>
);
};

export default Login;
