import React from 'react';
import {Table, Button, ButtonGroup, Dropdown} from 'react-bootstrap';
import {FaEdit, FaListUl, FaTrash} from "react-icons/fa";
import StatusLabel from "../../../../helpers/StatusLabel";
import moment from "moment/moment";

const DEFAULT_AVATAR = '/images/default-category.png';

const CategoryTable = ({ categories, openCategoryModal, setCategoryToDelete, setShowDeleteModal }) => {
    return (
        <Table striped bordered hover responsive="md" className="text-center align-middle">
            <thead className="table-light">
            <tr>
                <th>#</th>
                <th>Ảnh</th>
                <th className="text-start">Tên danh mục</th>
                <th className="text-start">Đường dẫn</th>
                <th className="text-start">Mô tả</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
            </tr>
            </thead>
            <tbody>
            {categories.map((category, index) => (
                <tr key={category?.id}>
                    <td>{index + 1}</td>
                    <td>
                        <img
                            src={category?.avatar || DEFAULT_AVATAR}
                            alt={category?.name}
                            style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '1px solid #dee2e6'
                            }}
                        />
                    </td>
                    <td className="text-start">{category?.name}</td>
                    <td className="text-start">{category?.slug}</td>
                    <td className="text-start">{category?.description}</td>
                    <td><StatusLabel status={category?.status} /></td>
                    <td>{moment(category?.created_at).format('DD-MM-YYYY')}</td>
                    <td>
                        <Button size="sm" variant="primary" onClick={() => openCategoryModal(category)} title="Cập nhật">
                            <FaEdit />
                        </Button>
                        <Button size="sm" className={'ms-2'} variant="danger" onClick={() => {
                            setCategoryToDelete(category);
                            setShowDeleteModal(true);
                        }} title="Xoá">
                            <FaTrash />
                        </Button>
                    </td>
                </tr>
            ))}
            </tbody>
        </Table>
    );
};

export default CategoryTable;
