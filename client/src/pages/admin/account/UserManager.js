import React, { useState, useEffect, use } from "react";
import {
	Container,
	Row,
	Col,
	Button,
	Breadcrumb,
	Nav,
	Pagination,
} from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import userService from "../../../api/userService";
import UserTable from "../components/user/UserTable";
import UserFormModal from "../components/user/UserFormModal";
import UserSearchModal from "../components/user/UserSearchModal";
import { FaPlusCircle } from "react-icons/fa";
import ModelConfirmDeleteUser from "../../components/model-delete/ModelConfirmDeleteUser";
import { DEFAULT_AVATAR } from "../../../helpers/StatusLabel";
import { toast } from "react-toastify";

const UserManager = () => {
	const [users, setUsers] = useState([]);
	const [meta, setMeta] = useState({
		total: 0,
		total_page: 1,
		page: 1,
		page_size: 10,
	});
	const [editingUser, setEditingUser] = useState(null);
	const [showUserModal, setShowUserModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);
	const [showSearchModal, setShowSearchModal] = useState(false);

	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();

	const [searchCriteria, setSearchCriteria] = useState({
		name: searchParams.get("name") || "",
		email: searchParams.get("email") || "",
		user_type: searchParams.get("user_type") || "",
	});

	const fetchUsersWithParams = async (params) => {
		try {
			const response = await userService.getLists(params);
			setUsers(response.data.data);
			setMeta(response.data.meta);
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	};

	useEffect(() => {
		const params = Object.fromEntries([...searchParams]);
		fetchUsersWithParams({
			...params,
			page: params.page || 1,
			page_size: params.page_size || 10,
		});
	}, [searchParams]);

	const handleSearch = (value, key) => {
		setSearchCriteria((prev) => ({ ...prev, [key]: value }));
	};

	const handleSearchSubmit = () => {
		const newParams = { ...searchCriteria, page: 1 };
		setSearchParams(newParams);
		setShowSearchModal(false);
	};

	const handleResetSearch = () => {
		setSearchCriteria({ name: "", email: "", user_type: "" });
		setSearchParams({});
		setShowSearchModal(false);
	};

	const handlePageChange = (newPage) => {
		setSearchParams({ ...searchCriteria, page: newPage });
	};

	const handleAddEditUser = async (values) => {
		try {
			const modelData = {
				...values,
				// avatar: DEFAULT_AVATAR
			};
			let response;
			if (editingUser) {
				response = await userService.update(editingUser.id, modelData);
			} else {
				response = await userService.add(modelData);
			}
			if (response?.status == "success") {
				toast.success("Thao tác thành công!");
				const params = Object.fromEntries([...searchParams]);
				await fetchUsersWithParams({
					...params,
					page: params.page || 1,
					page_size: params.page_size || 10,
				});
				setEditingUser(null);
				setShowUserModal(false);
			} else {
				toast.error(response?.message || "Thao tác thất bại!");
			}
		} catch (error) {
			toast.error(error?.message || "Thao tác thất bại!");

			console.error("Error adding/updating user:", error);
		}
	};

	const handleDeleteData = async () => {
		try {
			const response = await userService.delete(userToDelete.id);

			if (response?.status === "success") {
				// Hiển thị thông báo thành công với thông tin chi tiết
				const deletedData = response.data?.deletedData;
				let successMessage = "Xóa khách hàng thành công!";

				if (deletedData) {
					const details = [];
					if (deletedData.orders > 0) details.push(`${deletedData.orders} đơn hàng`);
					if (deletedData.transactions > 0) details.push(`${deletedData.transactions} giao dịch`);
					if (deletedData.votes > 0) details.push(`${deletedData.votes} đánh giá`);

					if (details.length > 0) {
						successMessage += ` Đã xóa: ${details.join(', ')}.`;
					}
				}

				toast.success(successMessage);

				const params = Object.fromEntries([...searchParams]);
				fetchUsersWithParams({
					...params,
					page: params.page || 1,
					page_size: params.page_size || 10,
				});
				setShowDeleteModal(false);
			} else {
				toast.error(response?.message || "Xóa thất bại!");
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			// Hiển thị thông báo lỗi từ API
			toast.error(error?.message || "Có lỗi xảy ra khi xóa khách hàng!");
		}
	};

	const openUserModal = (user = null) => {
		setEditingUser(user);
		setShowUserModal(true);
	};

	return (
		<Container>
			<Row className="gutters mt-3">
				<Col xl={12}>
					<Breadcrumb>
						<Nav.Item>
							<Nav.Link as={Link} to="/">
								Home
							</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link as={Link} to="/admin/users">
								Tài khoản
							</Nav.Link>
						</Nav.Item>
						<Breadcrumb.Item active>Index</Breadcrumb.Item>
					</Breadcrumb>
				</Col>
			</Row>
			<Row className="gutters">
				<Col>
					<div className="d-flex justify-content-between align-items-center mb-3">
						<h2>Quản lý tài khoản</h2>
						<div>
							<Button
								variant="secondary"
								className="me-2"
								size={"sm"}
								onClick={() => setShowSearchModal(true)}
							>
								<i className="fas fa-search me-1"></i> Tìm kiếm
							</Button>
							<Button
								variant="primary"
								size={"sm"}
								onClick={() => openUserModal(null)}
							>
								Thêm mới <FaPlusCircle className={"mx-1"} />
							</Button>
						</div>
					</div>

					<UserTable
						users={users}
						openUserModal={openUserModal}
						setUserToDelete={setUserToDelete}
						setShowDeleteModal={setShowDeleteModal}
					/>

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

			<UserFormModal
				showUserModal={showUserModal}
				setShowUserModal={setShowUserModal}
				editingUser={editingUser}
				handleAddEditUser={handleAddEditUser}
			/>

			<ModelConfirmDeleteUser
				showDeleteModal={showDeleteModal}
				setShowDeleteModal={setShowDeleteModal}
				handleDeleteData={handleDeleteData}
				userToDelete={userToDelete}
			/>

			<UserSearchModal
				showSearchModal={showSearchModal}
				setShowSearchModal={setShowSearchModal}
				searchCriteria={searchCriteria}
				handleSearch={handleSearch}
				handleResetSearch={handleResetSearch}
				handleSearchSubmit={handleSearchSubmit}
			/>
		</Container>
	);
};

export default UserManager;
