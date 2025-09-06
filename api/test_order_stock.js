// Test script để kiểm tra logic cập nhật stock khi payment_status = completed
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

async function testStockUpdate() {
    try {
        console.log('=== Testing Stock Update Logic ===');
        
        // Test 1: Kiểm tra method updateStock
        console.log('\n1. Testing Product.updateStock method:');
        
        // Giả sử có sản phẩm ID = 1 với số lượng hiện tại
        const productId = 1;
        const quantityToReduce = 2;
        
        // Lấy số lượng hiện tại
        const product = await Product.findById(productId);
        if (product) {
            console.log(`Product ID ${productId} current stock: ${product.number}`);
            
            // Test updateStock
            const stockUpdated = await Product.updateStock(productId, quantityToReduce);
            console.log(`Stock update result: ${stockUpdated}`);
            
            // Kiểm tra số lượng sau khi update
            const updatedProduct = await Product.findById(productId);
            console.log(`Product ID ${productId} new stock: ${updatedProduct.number}`);
            
            // Test restoreStock
            console.log('\n2. Testing Product.restoreStock method:');
            const stockRestored = await Product.restoreStock(productId, quantityToReduce);
            console.log(`Stock restore result: ${stockRestored}`);
            
            // Kiểm tra số lượng sau khi restore
            const restoredProduct = await Product.findById(productId);
            console.log(`Product ID ${productId} restored stock: ${restoredProduct.number}`);
        } else {
            console.log(`Product ID ${productId} not found`);
        }
        
        console.log('\n=== Test completed ===');
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
    testStockUpdate().then(() => {
        console.log('Test finished');
        process.exit(0);
    }).catch(error => {
        console.error('Test failed:', error);
        process.exit(1);
    });
}

module.exports = { testStockUpdate };
