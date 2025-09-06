import React, { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";
import { Formik, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";
import apiUpload from "../../../../api/apiUpload";
import { SelectForm } from "../../../../components/common/SelectFormik";

const DataModal = ({
	showCategoryModal,
	setShowCategoryModal,
	editingCategory,
	handleAddEditCategory,
}) => {
	const [imagePreviews, setImagePreviews] = useState({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if(editingCategory?.values) {
			let imgs = editingCategory?.values?.reduce((newObj, item, index) => {
				newObj[index] = item?.image
				return newObj
			}, {});
			setImagePreviews(imgs)
		}
	}, [showCategoryModal])

	const handleImageChange = async (e, index, setFieldValue) => {
		const file = e.target.files[0];
		if (file) {
			setLoading(true);
			const response = await apiUpload.uploadImageResponse(file); // Gọi API upload ảnh
			setLoading(false);
			setImagePreviews({ ...imagePreviews, [index]: response }); // Lưu link ảnh
			setFieldValue(`values[${index}].image`, response);
		}
	};

	console.log(imagePreviews, editingCategory);

	return (
		<Modal
			show={showCategoryModal}
			onHide={() => setShowCategoryModal(false)}
			size="xl"
		>
			<Modal.Header closeButton>
				<Modal.Title>
					{editingCategory
						? "Cập nhật thuộc tính"
						: "Thêm mới thuộc tính"}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Formik
					initialValues={{
						name: editingCategory?.name || "",
						status: editingCategory?.status || "",
						values: editingCategory?.values || [
							{
								title: "",
								is_default: false,
								color: "#ffffff",
								image: "",
							},
						],
					}}
					validationSchema={Yup.object({
						name: Yup.string().required(
							"Tên thuộc tính không được để trống"
						),
						status: Yup.string().required(
							"Trạng thái không được để trống"
						),
						values: Yup.array()
							.of(
								Yup.object().shape({
									title: Yup.string().required(
										"Tên giá trị không được để trống"
									),
									is_default: Yup.boolean(),
									color: Yup.string()
										.required("Chọn màu")
										.test(
											"not-empty",
											"Màu không được để trống",
											(value) => !!value
										),
									image: Yup.mixed().nullable(),
								})
							)
							.test(
								"unique-default",
								"Phải có duy nhất một giá trị được chọn làm mặc định",
								(values) => {
									if (!values) return false;
									const defaultCount = values.filter(
										(v) => v.is_default
									).length;
									return defaultCount === 1;
								}
							),
					})}
					onSubmit={(values) => {
						console.log("Submitted Values:", values);
						handleAddEditCategory(values);
					}}
				>
					{({
						handleSubmit,
						setFieldValue,
						values,
						errors,
						touched,
					}) => (
						<Form onSubmit={handleSubmit}>
							<Row>
								<Col md={6} xs={12}>
									<Form.Group className="mb-3">
										<Form.Label>Tên thuộc tính</Form.Label>
										<Field
											name="name"
											className="form-control"
											placeholder="Tên thuộc tính"
										/>
										<ErrorMessage
											name="name"
											component="div"
											className="text-danger"
										/>
									</Form.Group>
								</Col>
								<Col  md={6} xs={12}>
									<Form.Group className="mb-3">
										<Form.Label>Trạng thái</Form.Label>
										<SelectForm
											name={"status"}
											options={[
												{
													value: "pending",
													label: "Pending",
												},
												{
													value: "draft",
													label: "Draft",
												},
												{
													value: "published",
													label: "Published",
												},
											]}
										/>
										<ErrorMessage
											name="status"
											component="div"
											className="text-danger"
										/>
									</Form.Group>
								</Col>
							</Row>

							<Form.Group className="mb-3">
								<FieldArray name="values">
									{({ remove, push }) => (
										<>
											<div className="d-flex justify-content-between align-items-center mb-2">
												<Form.Label className="mb-0">
													Giá trị thuộc tính
												</Form.Label>
												<Button
													size="sm"
													variant="success"
													onClick={() =>
														push({
															title: "",
															is_default: false,
															color: "#ffffff",
															image: "",
														})
													}
												>
													<FaPlus /> Thêm giá trị
												</Button>
											</div>

											<Row className="mb-2">
												<Col
													md={1}
													className="text-left fw-bold"
												>
													Default?
												</Col>
												<Col md={2} className="fw-bold">
													Title
												</Col>
												<Col
													md={1}
													className="text-left fw-bold"
												>
													Color
												</Col>
												<Col md={6} className="fw-bold">
													Image
												</Col>
												<Col
													md={1}
													className="text-left fw-bold"
												>
													Remove
												</Col>
											</Row>

											{values.values.map(
												(value, index) => (
													<Row
														key={index}
														className="mb-3 align-items-center"
													>
														<Col
															md={1}
															className="text-center"
														>
															<div className="form-check">
																<Field
																	type="radio"
																	name={`values[${index}].is_default`}
																	checked={
																		value.is_default
																	}
																	className="form-check-input"
																	onChange={() => {
																		values.values.forEach(
																			(
																				_,
																				i
																			) =>
																				setFieldValue(
																					`values[${i}].is_default`,
																					i ===
																						index
																				)
																		);
																	}}
																/>
																<label className="form-check-label"></label>
															</div>
														</Col>
														<Col md={2}>
															<Field
																name={`values[${index}].title`}
																placeholder="Tên"
																className="form-control"
															/>
															<ErrorMessage
																name={`values[${index}].title`}
																component="div"
																className="text-danger"
															/>
														</Col>
														<Col
															md={1}
															className="text-center"
														>
															<Field
																name={`values[${index}].color`}
																type="color"
																className="form-control form-control-color"
																value={
																	value.color ||
																	"#ffffff"
																}
																onChange={(e) =>
																	setFieldValue(
																		`values[${index}].color`,
																		e.target
																			.value ||
																			"#ffffff"
																	)
																}
															/>
															{errors?.values?.[
																index
															]?.color &&
																touched
																	?.values?.[
																	index
																]?.color && (
																	<div className="text-danger">
																		{
																			errors
																				.values[
																				index
																			]
																				.color
																		}
																	</div>
																)}
														</Col>
														<Col md={6}>
															<div className="input-group">
																<input
																	type="file"
																	accept="image/*"
																	onChange={(
																		e
																	) =>
																		handleImageChange(
																			e,
																			index,
																			setFieldValue
																		)
																	}
																	className="form-control"
																	id={`fileUpload${index}`}
																/>
																<label
																	className="input-group-text"
																	htmlFor={`fileUpload${index}`}
																>
																	Chọn ảnh
																</label>
															</div>
															{imagePreviews[
																index
															] && (
																<img
																	src={
																		imagePreviews[
																			index
																		] ||
																		values[
																			index
																		]?.image
																	}
																	alt="Preview"
																	style={{
																		width: "50px",
																		height: "50px",
																		marginTop:
																			"5px",
																	}}
																/>
															)}
														</Col>
														<Col
															md={1}
															className="text-center"
														>
															<Button
																variant="danger"
																size="sm"
																onClick={() =>
																	remove(
																		index
																	)
																}
															>
																<FaTrash />
															</Button>
														</Col>
													</Row>
												)
											)}
										</>
									)}
								</FieldArray>
								{errors.values &&
									typeof errors.values === "string" && (
										<div className="text-danger mt-2">
											{errors.values}
										</div>
									)}
							</Form.Group>

							<Button
								type="submit"
								size="sm"
								variant="primary"
								style={{ float: "right" }}
							>
								<FaSave className="me-2" />
								{editingCategory ? "Cập nhật" : "Thêm mới"}
							</Button>
						</Form>
					)}
				</Formik>
			</Modal.Body>
		</Modal>
	);
};

export default DataModal;
