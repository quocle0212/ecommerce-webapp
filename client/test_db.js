// Test database connection và tables
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../api/.env' });

async function testDB() {
    console.log('=== TESTING DATABASE ===');
    
    try {
        // Test connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'test',
            port: process.env.DB_PORT || 3306,
        });
        
        console.log('✅ Database connected successfully');
        
        // Check if cart table exists
        const [cartRows] = await connection.query("SHOW TABLES LIKE 'cart'");
        console.log('Cart table exists:', cartRows.length > 0);
        
        // Check if cart_items table exists
        const [itemRows] = await connection.query("SHOW TABLES LIKE 'cart_items'");
        console.log('Cart_items table exists:', itemRows.length > 0);
        
        // If tables don't exist, create them
        if (cartRows.length === 0) {
            console.log('Creating cart table...');
            await connection.query(`
                CREATE TABLE cart (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_user_id (user_id)
                )
            `);
            console.log('✅ Cart table created');
        }
        
        if (itemRows.length === 0) {
            console.log('Creating cart_items table...');
            await connection.query(`
                CREATE TABLE cart_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    cart_id INT NOT NULL,
                    product_id INT NOT NULL,
                    quantity INT NOT NULL DEFAULT 1,
                    price DECIMAL(10,2) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_cart_id (cart_id),
                    INDEX idx_product_id (product_id),
                    UNIQUE KEY unique_cart_product (cart_id, product_id)
                )
            `);
            console.log('✅ Cart_items table created');
        }
        
        console.log('🎉 Database setup complete');
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database error:', error);
    }
}

testDB(); 