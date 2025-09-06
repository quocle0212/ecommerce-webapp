# 🛒 E-commerce Webapp - Gia Dụng

Một ứng dụng thương mại điện tử hoàn chỉnh được xây dựng bằng **Node.js**, **React.js** và **MySQL**, chuyên bán các sản phẩm gia dụng với đầy đủ tính năng hiện đại.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

## 📋 Mục lục

- [✨ Tính năng](#-tính-năng)
- [🏗️ Kiến trúc](#️-kiến-trúc)
- [🚀 Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [📦 Cài đặt](#-cài-đặt)
- [🔧 Cấu hình](#-cấu-hình)
- [🏃‍♂️ Chạy ứng dụng](#️-chạy-ứng-dụng)
- [📁 Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [🔌 API Documentation](#-api-documentation)
- [📱 Tính năng chính](#-tính-năng-chính)
- [🛠️ Phát triển](#️-phát-triển)
- [🤝 Đóng góp](#-đóng-góp)
- [📄 License](#-license)

## ✨ Tính năng

### 👥 **Người dùng**
- 🔐 Đăng ký, đăng nhập, quên mật khẩu
- 👤 Quản lý profile cá nhân
- 🛒 Giỏ hàng thông minh với Real-time updates
- 📦 Theo dõi đơn hàng
- ⭐ Đánh giá và review sản phẩm
- 🔍 Tìm kiếm và lọc sản phẩm nâng cao

### 👨‍💼 **Admin**
- 📊 Dashboard với thống kê chi tiết
- 🏷️ Quản lý sản phẩm, danh mục, thương hiệu
- 📋 Quản lý đơn hàng và trạng thái
- 👥 Quản lý người dùng
- 📝 Quản lý bài viết/blog
- 🎨 Quản lý slide và banner
- ⚙️ Cài đặt thông tin website

### 🛒 **E-commerce**
- 🏪 Giao diện shop hiện đại, responsive
- 💳 Tích hợp thanh toán
- 📱 Thông báo SMS qua Twilio
- 📧 Gửi email tự động
- ☁️ Lưu trữ hình ảnh trên Cloudinary
- 🔄 Real-time communication với Socket.io

## 🏗️ Kiến trúc

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│    (MySQL)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
    ┌───▼───┐               ┌───▼───┐               ┌───▼───┐
    │ Redux │               │ REST  │               │ MySQL │
    │ Store │               │  API  │               │ Pool  │
    └───────┘               └───────┘               └───────┘
```

## 🚀 Công nghệ sử dụng

### 🔧 **Backend**
- **Node.js** (v16.14+) - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Primary database
- **MongoDB** - Secondary database (optional)
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer + Cloudinary** - File upload & storage
- **Swagger** - API documentation
- **Nodemailer** - Email service
- **Twilio** - SMS service

### 🎨 **Frontend**
- **React.js** (v18.3.1) - UI library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Bootstrap 5** - CSS framework
- **Axios** - HTTP client
- **Formik + Yup** - Form handling & validation
- **Chart.js** - Data visualization
- **React Toastify** - Notifications

### 🗄️ **Database & Storage**
- **MySQL** - Relational database
- **Cloudinary** - Image/video storage
- **Local Storage** - File uploads

## 📦 Cài đặt

### 📋 **Yêu cầu hệ thống**
- Node.js >= 16.14
- MySQL >= 8.0
- npm hoặc yarn

### 🔽 **Clone Repository**
```bash
git clone https://github.com/quocle0212/ecommerce-webapp.git
cd ecommerce-webapp
```

### 📱 **Cài đặt Backend**
```bash
cd api
npm install
```

### 🖥️ **Cài đặt Frontend**
```bash
cd client
npm install
```

## 🏃‍♂️ Chạy ứng dụng

### 🔧 **Development Mode**

**Backend:**
```bash
cd api
npm run dev    # Chạy với nodemon
# hoặc
npm start      # Chạy bình thường
```

**Frontend:**
```bash
cd client
npm start      # Chạy development server
```

### 🌐 **URLs**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

### 🏗️ **Production Build**
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../api
npm start
```

## 📁 Cấu trúc thư mục

```
ecommerce-webapp/
├── 📁 api/                          # Backend Node.js
│   ├── 📁 src/
│   │   ├── 📁 config/              # Cấu hình (DB, Cloudinary, Swagger)
│   │   ├── 📁 controllers/         # Controllers (Admin, Auth, User, Guest)
│   │   ├── 📁 middleware/          # Middleware (Auth, Upload, Validation)
│   │   ├── 📁 models/              # Models (MySQL)
│   │   ├── 📁 repositories/        # Data Access Layer
│   │   ├── 📁 routes/              # API Routes
│   │   ├── 📁 services/            # Business Logic
│   │   ├── 📁 utils/               # Utilities
│   │   └── 📄 server.js            # Entry point
│   ├── 📁 database/                # Database dumps
│   ├── 📁 uploads/                 # File uploads
│   └── 📄 package.json
│
├── 📁 client/                       # Frontend React.js
│   ├── 📁 public/                  # Static files
│   ├── 📁 src/
│   │   ├── 📁 api/                 # API Services
│   │   ├── 📁 components/          # Reusable Components
│   │   ├── 📁 pages/               # Page Components
│   │   │   ├── 📁 admin/           # Admin Pages
│   │   │   ├── 📁 auth/            # Authentication Pages
│   │   │   ├── 📁 site/            # Public Pages
│   │   │   └── 📁 user/            # User Dashboard Pages
│   │   ├── 📁 redux/               # State Management
│   │   ├── 📁 routes/              # Route Configuration
│   │   ├── 📁 helpers/             # Helper Functions
│   │   └── 📄 App.js               # Main App Component
│   └── 📄 package.json
│
└── 📄 README.md                     # Documentation
```

## 🔌 API Documentation

API được document bằng **Swagger/OpenAPI 3.0** và có thể truy cập tại:
```
http://localhost:5000/api-docs
```

### 🔗 **Main Endpoints**

#### 🔐 **Authentication**
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/forgot-password` - Quên mật khẩu

#### 🛒 **Products**
- `GET /api/v1/products` - Lấy danh sách sản phẩm
- `GET /api/v1/products/:id` - Chi tiết sản phẩm
- `POST /api/v1/admin/product` - Tạo sản phẩm (Admin)

#### 📦 **Orders**
- `POST /api/v1/order` - Tạo đơn hàng
- `GET /api/v1/order` - Lấy danh sách đơn hàng
- `PUT /api/v1/admin/order/:id` - Cập nhật đơn hàng (Admin)

#### 🛒 **Cart**
- `POST /api/v1/cart/add` - Thêm vào giỏ hàng
- `GET /api/v1/cart/:userId` - Lấy giỏ hàng
- `PUT /api/v1/cart/item/:itemId` - Cập nhật số lượng

## 📱 Tính năng chính

### 🏪 **Giao diện Shop**
- Hiển thị sản phẩm với pagination
- Tìm kiếm và lọc theo danh mục, giá, thương hiệu
- Xem chi tiết sản phẩm với hình ảnh carousel
- Sản phẩm liên quan và đề xuất

### 🛒 **Giỏ hàng & Thanh toán**
- Thêm/xóa/cập nhật sản phẩm trong giỏ hàng
- Tính toán tổng tiền tự động
- Checkout với thông tin giao hàng
- Tích hợp thanh toán online

### 👤 **Quản lý tài khoản**
- Profile cá nhân với avatar upload
- Lịch sử đơn hàng
- Theo dõi trạng thái giao hàng
- Đánh giá sản phẩm đã mua

### 📊 **Admin Dashboard**
- Thống kê doanh thu theo ngày/tháng
- Quản lý đơn hàng với nhiều trạng thái
- CRUD sản phẩm với upload hình ảnh
- Quản lý danh mục và thương hiệu
- Quản lý người dùng và phân quyền

## 🛠️ Phát triển

### 🧪 **Testing**
```bash
# Backend tests
cd api
npm test

# Frontend tests
cd client
npm test
```

### 🔍 **Debug**
- Backend: Sử dụng nodemon để auto-reload
- Frontend: React DevTools
- Database: MySQL Workbench hoặc phpMyAdmin

### 📝 **Code Style**
- ESLint cho JavaScript
- Prettier cho formatting
- Conventional Commits cho git messages

## 🤝 Đóng góp

1. **Fork** repository
2. **Clone** về máy local
3. Tạo **branch** mới cho feature: `git checkout -b feature/ten-tinh-nang`
4. **Commit** thay đổi: `git commit -m 'Add: tính năng mới'`
5. **Push** branch: `git push origin feature/ten-tinh-nang`
6. Tạo **Pull Request**

### 📋 **Quy tắc đóng góp**
- Tuân thủ code style đã định
- Viết test cho code mới
- Cập nhật documentation nếu cần
- Sử dụng conventional commits
---

## 🌟 Screenshots

### 🏠 **Trang chủ**
![Homepage](docs/images/homepage.png)

### 🛒 **Sản phẩm**
![Products](docs/images/products.png)

### 📊 **Admin Dashboard**
![Admin Dashboard](docs/images/admin-dashboard.png)

---

## 🚀 **Roadmap**

- [ ] 📱 Mobile App (React Native)
- [ ] 🔔 Push Notifications
- [ ] 💬 Live Chat Support
- [ ] 🌍 Multi-language Support
- [ ] 📊 Advanced Analytics
- [ ] 🔄 Inventory Management
- [ ] 🎁 Coupon System
- [ ] ⭐ Wishlist Feature
