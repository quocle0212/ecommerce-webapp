// Test script để kiểm tra Cart API
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1'; // Sửa path đúng với backend

async function testCartAPI() {
    console.log('=== TESTING CART API ===');
    
    try {
        // Test 1: POST /cart/add
        console.log('\n1. Testing POST /cart/add...');
        
        const testData = {
            userId: 1,
            productId: 1,
            quantity: 1,
            price: 100000
        };
        
        console.log('Test data:', testData);
        
        const response = await axios.post(`${API_BASE_URL}/cart/add`, testData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Success! Response:', response.data);
        
        // Test 2: GET /cart/:userId
        console.log('\n2. Testing GET /cart/1...');
        const getResponse = await axios.get(`${API_BASE_URL}/cart/1`);
        console.log('✅ Cart data:', getResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });
        
        if (error.code === 'ECONNREFUSED') {
            console.error('🔴 Backend server is not running!');
            console.log('Please run: cd ../api && npm start');
        }
    }
}

// Chạy test
testCartAPI(); 