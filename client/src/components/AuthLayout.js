import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';

const AuthLayout = () => {
    return (
        <Container fluid style={{ padding: '0' }}>
            <Outlet />
        </Container>
    );
};

export default AuthLayout;
