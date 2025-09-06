// Test script để kiểm tra API update order với payment_status = completed
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3014/api/v1';

// Thông tin test (cần thay đổi theo môi trường thực tế)
const TEST_ORDER_ID = 6; // ID đơn hàng để test
const AUTH_TOKEN = 'your_auth_token_here'; // Token xác thực admin

async function testOrderUpdate() {
    try {
        console.log('=== Testing Order Update API ===');
        
        // 1. Lấy thông tin đơn hàng hiện tại
        console.log(`\n1. Getting current order info for ID: ${TEST_ORDER_ID}`);
        
        const getOrderResponse = await axios.get(`${API_BASE_URL}/admin/order/${TEST_ORDER_ID}`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const currentOrder = getOrderResponse.data.data;
        console.log('Current order:', JSON.stringify(currentOrder, null, 2));
        console.log(`Current payment_status: ${currentOrder.payment_status}`);
        
        // 2. Lấy thông tin số lượng sản phẩm hiện tại
        console.log('\n2. Getting current product stocks:');
        for (const product of currentOrder.products) {
            try {
                const productResponse = await axios.get(`${API_BASE_URL}/admin/products/${product.id}`, {
                    headers: {
                        'Authorization': `Bearer ${AUTH_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`Product ID ${product.id}: current stock = ${productResponse.data.data.number}, order qty = ${product.qty}`);
            } catch (error) {
                console.log(`Could not get product ${product.id} info:`, error.message);
            }
        }
        
        // 3. Cập nhật payment_status thành completed
        console.log('\n3. Updating payment_status to completed...');
        
        const updateData = {
            ...currentOrder,
            payment_status: 'completed',
            // Đảm bảo có đầy đủ thông tin cần thiết
            user_id: currentOrder.user_id,
            payment_method_id: currentOrder.payment_method_id,
            total_amount: currentOrder.amount,
            shipping_fee: currentOrder.shipping_amount,
            products: currentOrder.products.map(p => ({
                id: p.id,
                quantity: p.qty
            }))
        };
        
        const updateResponse = await axios.put(`${API_BASE_URL}/admin/order/${TEST_ORDER_ID}`, updateData, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Update response:', updateResponse.data);
        
        // 4. Kiểm tra số lượng sản phẩm sau khi update
        console.log('\n4. Checking product stocks after update:');
        for (const product of currentOrder.products) {
            try {
                const productResponse = await axios.get(`${API_BASE_URL}/admin/products/${product.id}`, {
                    headers: {
                        'Authorization': `Bearer ${AUTH_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`Product ID ${product.id}: new stock = ${productResponse.data.data.number}`);
            } catch (error) {
                console.log(`Could not get product ${product.id} info:`, error.message);
            }
        }
        
        console.log('\n=== Test completed successfully ===');
        
    } catch (error) {
        console.error('API Test error:', error.response?.data || error.message);
    }
}

// Hướng dẫn sử dụng
console.log(`
=== Order Stock Update API Test ===

Trước khi chạy test, hãy:
1. Đảm bảo server đang chạy tại ${API_BASE_URL}
2. Thay đổi TEST_ORDER_ID = ${TEST_ORDER_ID} thành ID đơn hàng thực tế
3. Thay đổi AUTH_TOKEN thành token admin hợp lệ
4. Đảm bảo đơn hàng có payment_status khác 'completed'

Để chạy test: node test_api_order.js
`);

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
    // Uncomment dòng dưới để chạy test
    // testOrderUpdate();
    console.log('Please update AUTH_TOKEN and TEST_ORDER_ID before running the test');
}

module.exports = { testOrderUpdate };
