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
import userService from "../../api/userService";
import { LOGO } from "../../helpers/constant";

const ForgotPassword = () => {
	const initialValues = {
		email: "",
	};

	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { loading, error, isAuthenticated } = useSelector(
		(state) => state.auth
	); // Add isAuthenticated
	const [slides, setSlides] = useState([]);

	// Lấy URL của hình ảnh từ slides (sử dụng hình ảnh đầu tiên trong danh sách)
	const backgroundImageUrl = slides.length > 0 ? slides[0].avatar : "";

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
	});

	const onSubmit = async (values, { setSubmitting }) => {
		try {
			const response = await userService.forgotPassword(values);
			console.info(
				"===========[userService.forgotPassword] ===========[response] : ",
				response
			);
			toastr.success(
				"Thông tin xác nhận đã gủi vào email của bạn, xin vui lòng kiểm hòm thư",
				"Thông báo"
			);
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
							src={LOGO}
							alt="HeBekery Logo"
							className="hebekery-brand-logo"
						/> */}
						<h1 className="hebekery-brand-title">HomeLife Store</h1>
						<p className="hebekery-brand-subtitle">
							Đừng lo lắng! Chúng tôi sẽ giúp bạn khôi phục lại mật khẩu
							để tiếp tục trải nghiệm mua sắm tại HomeLife Store.
						</p>
					</div>
				</Col>
				<Col md={6} className="d-flex align-items-center justify-content-center">
					<div className="hebekery-auth-form w-100" style={{ maxWidth: '600px' }}>
						<h2 className="hebekery-auth-title">Quên mật khẩu?</h2>
						<p className="hebekery-auth-subtitle">
							Nhập email để nhận liên kết đặt lại mật khẩu
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
									<button
										type="submit"
										className="hebekery-btn-primary"
										disabled={isSubmitting || loading}
									>
										{loading ? "Đang xử lý..." : "Gửi liên kết đặt lại"}
									</button>
									<div className="hebekery-auth-links">
										<p>
											Nhớ mật khẩu?
											<Link
												to="/login"
												className="hebekery-auth-link"
												onClick={(e) => {
													e.preventDefault();
													startTransition(() => {
														navigate("/login");
													});
												}}
											>
												{" "}Đăng nhập tại đây
											</Link>
										</p>
										<p>
											Chưa có tài khoản?
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

export default ForgotPassword;
