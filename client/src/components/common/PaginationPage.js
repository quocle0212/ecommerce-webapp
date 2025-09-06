import React, { useState, useEffect } from "react";
import {
	Container,
	Row,
	Col,
	Button,
	Pagination,
	Breadcrumb,
	Nav,
} from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";

const PaginationPage = (props) => {
	return (
		<Pagination>
			<Pagination.First
				onClick={() => props.handlePageChange(1)}
				disabled={props.meta.page === 1}
			/>
			<Pagination.Prev
				onClick={() => props.handlePageChange(props.meta.page - 1)}
				disabled={props.meta.page === 1}
			/>
			{Array.from({ length: props.meta.total_page }, (_, index) => (
				<Pagination.Item
					key={index + 1}
					active={index + 1 === props.meta.page}
					onClick={() => props.handlePageChange(index + 1)}
				>
					{index + 1}
				</Pagination.Item>
			))}
			<Pagination.Next
				onClick={() => props.handlePageChange(props.meta.page + 1)}
				disabled={props.meta.page === props.meta.total_page}
			/>
			<Pagination.Last
				onClick={() => props.handlePageChange(props.meta.total_page)}
				disabled={props.meta.page === props.meta.total_page}
			/>
		</Pagination>
	);
};

export default PaginationPage;
