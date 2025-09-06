import React, {startTransition, useEffect, useState} from 'react';
import { Container, Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { FaShoppingCart, FaBars, FaChevronDown, FaUser } from 'react-icons/fa';
import {Link, useNavigate} from "react-router-dom";
import '../style/style_header.css';
import {useDispatch, useSelector} from "react-redux";
import {logout} from "../../../redux/slices/authSlice";
import {clearCartOnLogout} from "../../../redux/slices/cartSlice";

import categoryService from '../../../api/categoryService';

const Header = ({information, isAuthenticated, handleBookingShow}) => {
    const itemCount = useSelector((state) => state.cart.itemCount);
    const cartLoading = useSelector((state) => state.cart.loading);
    const user = useSelector((state) => state.auth.user);

    // ✅ DEBUG: Log cart count changes
    useEffect(() => {
        console.log('=== HEADER CART COUNT UPDATE ===');
        console.log('isAuthenticated:', isAuthenticated);
        console.log('itemCount:', itemCount);
        console.log('cartLoading:', cartLoading);
        console.log('user:', user?.name);
    }, [itemCount, isAuthenticated, user, cartLoading]);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        dispatch(clearCartOnLogout()); // Xóa giỏ hàng trước khi logout
        dispatch(logout());
        startTransition(() => {
            navigate("/login");
        });
    };

    // ✅ Function kiểm tra đăng nhập trước khi vào cart
    const handleCartClick = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            startTransition(() => {
                navigate("/login");
            });
        } else {
            startTransition(() => {
                navigate("/cart");
            });
        }
    };

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

	useEffect(() => {
        getCategories();
	}, []);

    const getCategories = async () => {
        try {
            setLoading(true);
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
            );

            const apiPromise = categoryService.getListsGuest({page: 1, page_size: 10});

            const response = await Promise.race([apiPromise, timeoutPromise]);

            if(response?.data?.data) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Set default categories if API fails
            setCategories([
                {id: 1, name: 'Dụng cụ bếp', slug: 'dung-cu-bep'},
                {id: 2, name: 'Đồ gia dụng', slug: 'do-gia-dung'},
                {id: 3, name: 'Nội thất', slug: 'noi-that'},
                {id: 4, name: 'Điện tử', slug: 'dien-tu'},
                {id: 5, name: 'Đồ trang trí', slug: 'do-trang-tri'}
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <header className={'fixed-header'}>
            {/* Top notification bar */}
            <div className="top-notification">
                Miễn phí vận chuyển đơn hàng từ 500k - Giao hàng toàn quốc
            </div>

            {/* Main navbar */}
            <Navbar className="main-navbar" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/" onClick={(e) => {
                        e.preventDefault();
                        startTransition(() => {
                            navigate("/");
                        });
                    }} className="brand-logo">
                        <span className="brand-text">HomeLife Store</span>
                    </Navbar.Brand>

                    {/* Mobile menu toggle */}
                    <button className="mobile-menu-toggle d-lg-none">
                        <FaBars />
                    </button>

                    {/* Desktop navigation */}
                    <div className="nav-menu d-none d-lg-flex">
                        <Nav.Link as={Link} to="/about" className="nav-link-item">
                            VỀ CHÚNG TÔI
                        </Nav.Link>

                        <Dropdown className="nav-dropdown">
                            <Dropdown.Toggle as="a" className="nav-link-item dropdown-toggle-custom">
                                SẢN PHẨM <FaChevronDown className="dropdown-arrow" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-custom">
                                {loading ? (
                                    <Dropdown.Item disabled>Đang tải...</Dropdown.Item>
                                ) : (
                                    categories.slice(0, 8).map((category) => (
                                        <Dropdown.Item key={category.id} as={Link} to={`/c/${category.slug}`}>
                                            {category.name.toUpperCase()}
                                        </Dropdown.Item>
                                    ))
                                )}
                            </Dropdown.Menu>
                        </Dropdown>

            

                        <Nav.Link as={Link} to="/blog" className="nav-link-item">
                            BLOG
                        </Nav.Link>

                        <Nav.Link as={Link} to="/contact" className="nav-link-item">
                            Liên hệ
                        </Nav.Link>
                    </div>

                    {/* Header actions - Hebekery style */}
                    <div className="hebekery-header-actions">
                        {/* User icon */}
                        {isAuthenticated ? (
                            <Dropdown align="end" className="hebekery-user-dropdown">
                                <Dropdown.Toggle as="div" className="hebekery-user-icon">
                                    <FaUser />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/user/profile">Thông tin cá nhân</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/user/orders">Đơn hàng của tôi</Dropdown.Item>
                                    {user?.user_type === "ADMIN" && (
                                        <Dropdown.Item as={Link} to="/admin">Quản trị</Dropdown.Item>
                                    )}
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>Đăng xuất</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <Link
                                to="/login"
                                className="hebekery-user-icon"
                                onClick={(e) => {
                                    e.preventDefault();
                                    startTransition(() => {
                                        navigate("/login");
                                    });
                                }}
                            >
                                <FaUser />
                            </Link>
                        )}

                        {/* Cart icon - luôn hiển thị, kiểm tra đăng nhập khi click */}
                        <a href="/cart" className="hebekery-cart-icon" onClick={handleCartClick}>
                            <FaShoppingCart />
                        {isAuthenticated && (
                                cartLoading ? (
                                    <span className="hebekery-cart-badge loading">...</span>
                                ) : (
                                    itemCount > 0 && (
                                    <span className="hebekery-cart-badge">{itemCount}</span>
                                    )
                                )
                                )}
                        </a>
                    </div>
                </Container>
            </Navbar>

            {/* Mobile header */}
            <Navbar bg="primary" variant="light" expand="lg" className="d-lg-none">
                <Container>
                    <div className="d-flex w-100 justify-content-between align-items-center">
                        <Button variant="link" className="text-white mobile-menu-toggle">
                            <FaBars/>
                        </Button>

                        {/* Cart icon mobile - luôn hiển thị, kiểm tra đăng nhập khi click */}
                        <a href="/cart" className="cart-icon text-white" onClick={handleCartClick}>
                            <FaShoppingCart/>
                        {isAuthenticated && (
                                cartLoading ? (
                                    <span className="cart-badge loading">...</span>
                                ) : (
                                    itemCount > 0 && (
                                    <span className="cart-badge">{itemCount}</span>
                                    )
                                )
                                )}
                        </a>
                    </div>
                </Container>
            </Navbar>
        </header>
    );
};

export default Header;
