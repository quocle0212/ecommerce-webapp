import React, { startTransition, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../site/style/Login.css";
import { loginUser, logout } from "../../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import bgImage from "../../assets/images/bg-login.jpg";
import toastr from "toastr";
import slideService from "../../api/slideService";
import userService from "../../api/userService";
import { LOGO } from "../../helpers/constant";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";


const ResetPassword = () => {
	const initialValues = {
		password: "",
		confirmPassword: "",
	};

	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { loading, error } = useSelector((state) => state.auth);
	const [slides, setSlides] = useState([]);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const { token } = useParams();
	const backgroundImageUrl = LOGO; // slides.length > 0 ? slides[0].avatar : "";

	useEffect(() => {
		dispatch(logout()); // Đảm bảo người dùng đã đăng xuất
	}, [dispatch]);

	useEffect(() => {
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
		password: Yup.string()
			.min(8, "Mật khẩu phải có ít nhất 8 ký tự")
			.matches(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
				"Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
			)
			.required("Mật khẩu không được để trống"),
		confirmPassword: Yup.string()
			.oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
			.required("Xác nhận mật khẩu không được để trống"),
	});

	const onSubmit = async (values, { setSubmitting }) => {
		try {
			const newData = {
				...values,
				token: token,
			};
			console.info("===========[] ===========[newData] : ", newData);
			const response = await userService.resetPassword(newData);
			toastr.success(
				"Đổi mật khẩu thành công, xin vui lòng đăng nhập",
				"Thông báo"
			);
			navigate("/login");
			setSubmitting(false);
		} catch (err) {
			toastr.error("Sai thông tin hoặc tài khoản không hợp lệ.", "Error");
			setSubmitting(false);
		}
	};

	return (
		<div className="hebekery-auth-container">
			<Row className="no-gutter min-vh-100">
				<Col md={6} className="d-none d-md-flex">
					<div className="hebekery-brand-section w-100">
						<h1 className="hebekery-brand-title">HomeLife Store</h1>
						<p className="hebekery-brand-subtitle">
							Tạo mật khẩu mới cho tài khoản của bạn để tiếp tục mua sắm những sản phẩm đồ gia dụng chất lượng cao.
						</p>
					</div>
				</Col>
				<Col md={6} className="d-flex align-items-center justify-content-center">
					<div className="hebekery-auth-form w-100" style={{ maxWidth: '600px' }}>
						<h2 className="hebekery-auth-title">Đặt lại mật khẩu</h2>
						<p className="hebekery-auth-subtitle">
							Nhập mật khẩu mới cho tài khoản của bạn
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
											Mật khẩu mới
										</label>
										<div className="hebekery-input-group">
											<Field
												name="password"
												type={showPassword ? "text" : "password"}
												className="hebekery-form-control"
												placeholder="Nhập mật khẩu mới"
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
									<div className="hebekery-form-group">
										<label className="hebekery-form-label">
											Xác nhận mật khẩu
										</label>
										<div className="hebekery-input-group">
											<Field
												name="confirmPassword"
												type={showConfirmPassword ? "text" : "password"}
												className="hebekery-form-control"
												placeholder="Nhập lại mật khẩu mới"
											/>
											<div
												className="hebekery-input-group-append"
												onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											>
												{showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
											</div>
										</div>
										<ErrorMessage
											name="confirmPassword"
											component="div"
											className="hebekery-error-message"
										/>
									</div>
									<button
										type="submit"
										className="hebekery-btn-primary"
										disabled={isSubmitting || loading}
									>
										{loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
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

export default ResetPassword;
