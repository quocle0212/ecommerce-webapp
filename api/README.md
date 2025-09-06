#Version

`node 16.14`

#SETTING
` SMS : https://console.twilio.com/`


npm start

#ECM
``` 
Luồng dữ liệu
1. Thêm sản phẩm và biến thể
Thêm sản phẩm vào ec_products:

Tên, mô tả, danh mục, thương hiệu, ảnh chính.
Thêm biến thể vào ec_product_variants:

Liên kết product_id, thông tin giá, số lượng.
Thêm thuộc tính và giá trị vào ec_attributes và ec_attribute_values:

Thuộc tính: Màu sắc, Size.
Giá trị: Tím, M.
Liên kết biến thể với giá trị thuộc tính (ec_variant_attributes):

Biến thể áo len màu tím, size M → lưu ID trong ec_variant_attributes.
2. Cập nhật giá hoặc số lượng của một biến thể
Tìm biến thể cần cập nhật trong bảng ec_product_variants dựa trên id hoặc sku.
Cập nhật giá, số lượng hoặc trạng thái.
3. Xóa sản phẩm
Khi xóa sản phẩm trong ec_products, tất cả biến thể (ec_product_variants) và liên kết (ec_variant_attributes) sẽ bị xóa nhờ ON DELETE CASCADE.

```
