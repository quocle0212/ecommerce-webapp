import React, { startTransition, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../site/style/Login.css";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../../redux/slices/authSlice";
import bgImage from "../../assets/images/bg-login.jpg";
import toastr from "toastr";
import slideService from "../../api/slideService";
import { LOGO } from "../../helpers/constant";

const Register = () => {
	const initialValues = {
		email: "",
		name: "",
		password: "",
		confirmPassword: "",
		role: "customer",
	};
	const dispatch = useDispatch();
	const { loading, error } = useSelector((state) => state.auth);
	const navigate = useNavigate();
	const [slides, setSlides] = useState([]);
	const backgroundImageUrl =  LOGO // slides.length > 0 ? slides[0].avatar : "";

	// Clear error khi component mount
	useEffect(() => {
		dispatch(clearError());
	}, [dispatch]);

	const validationSchema = Yup.object({
		email: Yup.string()
			.email("Email không hợp lệ")
			.required("Email không được để trống"),
		name: Yup.string()
			.matches(/^[\p{L}\s]+$/u, "Tên chỉ được chứa chữ cái, không chứa ký tự đặc biệt và số")

			.required("Tên không được để trống"),
		password: Yup.string()
			.min(6, "Mật khẩu ít nhất 6 ký tự")
			.matches(/[a-z]/, "Mật khẩu có ít nhất 1 chữ thường") // Kiểm tra có ít nhất 1 chữ thường
			.matches(/[A-Z]/, "Mật khẩu có ít nhất 1 chữ in hoa") // Kiểm tra có ít nhất 1 chữ in hoa
			.matches(/\d/, "Mật khẩu có ít nhất 1 chữ số") // Kiểm tra có ít nhất 1 số
			.required("Mật khẩu không được để trống"),
		confirmPassword: Yup.string()
			.oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
			.required("Mật khẩu xác nhận không được để trống"),
	});

	const onSubmit = async (values, { setSubmitting, setErrors }) => {
		console.log("=== REGISTER SUBMIT START ===");
		const result = await dispatch(registerUser(values));
		console.log("=== REGISTER RESULT ===", result);

		if (registerUser.fulfilled.match(result)) {
			console.log("=== REGISTER SUCCESS ===");
			toastr.success(
				"Đăng ký thành công, xin vui lòng kiểm tra email để kích hoạt tài khoản",
				"Success"
			);
			navigate("/login");
		} else {
			console.log("=== REGISTER ERROR ===");
			console.log("result.payload:", result.payload);
			console.log("result.error:", result.error);

			// Lấy thông báo lỗi từ result.payload
			const errorMessage = result.payload?.message || result.error?.message || "Đăng ký thất bại, vui lòng thử lại.";
			console.log("errorMessage:", errorMessage);

			setErrors({ submit: errorMessage });
			toastr.error(errorMessage, "Lỗi");
		}
		setSubmitting(false);
	};

	// useEffect(() => {
	// 	// Hàm gọi API để lấy danh sách slide
	// 	const fetchSlides = async () => {
	// 		try {
	// 			const response = await slideService.getListsGuest({
	// 				page_site: "auth",
	// 			});
	// 			setSlides(response.data.data);
	// 		} catch (error) {
	// 			console.error("Error fetching slides:", error);
	// 		}
	// 	};

	// 	fetchSlides();
	// }, []);

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
							Tham gia cộng đồng HomeLife Store để khám phá những sản phẩm đồ gia dụng chất lượng cao
							và nhận được những ưu đãi đặc biệt dành riêng cho thành viên.
						</p>
					</div>
				</Col>
				<Col md={6} className="d-flex align-items-center justify-content-center">
					<div className="hebekery-auth-form w-100" style={{ maxWidth: '600px' }}>
						<h2 className="hebekery-auth-title">Đăng ký tài khoản</h2>
						<p className="hebekery-auth-subtitle">
							Tạo tài khoản mới để bắt đầu mua sắm
						</p>
						{error && (
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
											Họ và tên
										</label>
										<Field
											name="name"
											type="text"
											className="hebekery-form-control"
											placeholder="Nhập họ và tên"
										/>
										<ErrorMessage
											name="name"
											component="div"
											className="hebekery-error-message"
										/>
									</div>
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
										<Field
											name="password"
											type="password"
											className="hebekery-form-control"
											placeholder="Nhập mật khẩu"
										/>
										<ErrorMessage
											name="password"
											component="div"
											className="hebekery-error-message"
										/>
									</div>
									<div className="hebekery-form-group">
										<label className="hebekery-form-label">
											Xác nhận mật khẩu
										</label>
										<Field
											name="confirmPassword"
											type="password"
											className="hebekery-form-control"
											placeholder="Nhập lại mật khẩu"
										/>
										<ErrorMessage
											name="confirmPassword"
											component="div"
											className="hebekery-error-message"
										/>
									</div>
									<button
										type="submit"
										className="hebekery-btn-primary"
										disabled={isSubmitting}
									>
										{isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
									</button>
									<div className="hebekery-auth-links">
										<p>
											Bạn đã có tài khoản?
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

export default Register;
