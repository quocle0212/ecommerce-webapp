const axios = require('axios');

const API_BASE = 'http://localhost:3000'; // Thay đổi port nếu cần

// Test data
const testData = {
    userId: 1, // Thay đổi user ID thực tế
    productId: 13, // Thay đổi product ID thực tế
    quantity: 2,
    price: 100.50
};

async function testCartAPI() {
    try {
        console.log('🔥 Testing Cart API...\n');

        // 1. Test Add to Cart
        console.log('1. Testing Add to Cart...');
        const addResponse = await axios.post(`${API_BASE}/cart/add`, testData);
        console.log('✅ Add to Cart Response:', addResponse.data);

        // 2. Test Get Cart
        console.log('\n2. Testing Get Cart...');
        const getResponse = await axios.get(`${API_BASE}/cart/${testData.userId}`);
        console.log('✅ Get Cart Response:', JSON.stringify(getResponse.data, null, 2));

        // 3. Test Add Same Product (should update quantity)
        console.log('\n3. Testing Add Same Product Again...');
        const addAgainResponse = await axios.post(`${API_BASE}/cart/add`, {
            ...testData,
            quantity: 1
        });
        console.log('✅ Add Again Response:', addAgainResponse.data);

        console.log('\n🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test Error:', error.response?.data || error.message);
    }
}

// Run test
testCartAPI(); 