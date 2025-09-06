# Order Stock Update Documentation

## Tổng quan
Khi trạng thái thanh toán của đơn hàng (`payment_status`) chuyển thành `"completed"`, hệ thống sẽ tự động trừ số lượng sản phẩm trong kho.

## Các thay đổi đã thực hiện

### 1. Model Product (api/src/models/Product.js)
Thêm 2 method mới:

#### `updateStock(productId, quantity)`
- **Mục đích**: Trừ số lượng sản phẩm khi bán
- **Tham số**: 
  - `productId`: ID sản phẩm
  - `quantity`: Số lượng cần trừ
- **Trả về**: `true` nếu thành công, `false` nếu không đủ hàng
- **SQL**: `UPDATE ec_products SET number = number - ? WHERE id = ? AND number >= ?`

#### `restoreStock(productId, quantity)`
- **Mục đích**: Hoàn trả số lượng sản phẩm khi hủy đơn
- **Tham số**:
  - `productId`: ID sản phẩm  
  - `quantity`: Số lượng cần hoàn trả
- **Trả về**: `true` nếu thành công
- **SQL**: `UPDATE ec_products SET number = number + ? WHERE id = ?`

### 2. Order Controller (api/src/controllers/admin/orderController.js)

#### Method `update()`
Thêm logic kiểm tra thay đổi `payment_status`:

```javascript
// Trường hợp 1: payment_status chuyển từ khác -> "completed"
if (existingOrder.payment_status !== 'completed' && orderData.payment_status === 'completed') {
    // Trừ số lượng sản phẩm
    for (const product of newOrder.products) {
        await Product.updateStock(product.id, product.qty);
    }
}

// Trường hợp 2: payment_status chuyển từ "completed" -> khác
else if (existingOrder.payment_status === 'completed' && orderData.payment_status !== 'completed') {
    // Hoàn trả số lượng sản phẩm
    for (const product of existingOrder.products) {
        await Product.restoreStock(product.id, product.qty);
    }
}
```

#### Method `updateStatus()`
Tương tự như `update()`, thêm logic xử lý khi cập nhật trạng thái qua endpoint riêng.

## API Endpoints

### PUT /api/v1/admin/order/:id
Cập nhật đơn hàng và tự động xử lý stock khi `payment_status` thay đổi.

**Request Body:**
```json
{
    "payment_status": "completed",
    "status": "processing",
    "user_id": 1,
    "payment_method_id": 1,
    "total_amount": 1000000,
    "shipping_fee": 50000,
    "products": [
        {
            "id": 1,
            "quantity": 2
        },
        {
            "id": 2, 
            "quantity": 1
        }
    ]
}
```

### POST /api/v1/admin/order/update-status/:id
Cập nhật chỉ trạng thái đơn hàng.

**Request Body:**
```json
{
    "status": "completed",
    "payment_status": "completed"
}
```

## Luồng xử lý

1. **Khi payment_status chuyển thành "completed":**
   - Hệ thống lấy danh sách sản phẩm trong đơn hàng
   - Với mỗi sản phẩm, gọi `Product.updateStock(productId, quantity)`
   - Kiểm tra xem có đủ hàng không (`number >= quantity`)
   - Nếu đủ hàng: trừ số lượng (`number = number - quantity`)
   - Nếu không đủ hàng: log warning, không cập nhật

2. **Khi payment_status chuyển từ "completed" về trạng thái khác:**
   - Hệ thống lấy danh sách sản phẩm từ đơn hàng cũ
   - Với mỗi sản phẩm, gọi `Product.restoreStock(productId, quantity)`
   - Cộng lại số lượng (`number = number + quantity`)

## Logging
Hệ thống sẽ log các thông tin sau:
- Khi payment_status thay đổi
- Khi cập nhật stock thành công/thất bại
- Khi không đủ hàng để trừ
- Các lỗi xảy ra trong quá trình xử lý

## Test Cases

### Test 1: Cập nhật payment_status thành completed
```bash
# Kiểm tra số lượng sản phẩm trước khi update
GET /api/v1/admin/products/1

# Cập nhật đơn hàng
PUT /api/v1/admin/order/6
{
    "payment_status": "completed",
    ...
}

# Kiểm tra số lượng sản phẩm sau khi update (phải giảm)
GET /api/v1/admin/products/1
```

### Test 2: Hoàn trả khi hủy đơn
```bash
# Cập nhật payment_status từ completed về pending
PUT /api/v1/admin/order/6
{
    "payment_status": "pending",
    ...
}

# Kiểm tra số lượng sản phẩm (phải tăng lại)
GET /api/v1/admin/products/1
```

## Lưu ý quan trọng

1. **Kiểm tra số lượng**: Method `updateStock` sẽ kiểm tra `number >= quantity` trước khi trừ
2. **Transaction safety**: Nên wrap trong transaction để đảm bảo tính nhất quán
3. **Error handling**: Lỗi cập nhật stock không làm fail toàn bộ update order
4. **Logging**: Tất cả thao tác đều được log để debug
5. **Idempotent**: Cùng một thay đổi payment_status không bị xử lý nhiều lần

## Cấu trúc Database

### Bảng ec_products
- `number`: Số lượng sản phẩm trong kho (int)

### Bảng ec_orders  
- `payment_status`: enum('pending', 'completed', 'refunding', 'refunded', 'fraud', 'failed')

### Bảng ec_transactions
- `order_id`: ID đơn hàng
- `product_id`: ID sản phẩm
- `qty`: Số lượng sản phẩm trong đơn hàng
