# BookVeXeAPIs - API cho Hệ thống Đặt vé máy bay

Đây là dự án backend (API) cho một ứng dụng đặt vé máy bay, được xây dựng bằng Node.js, Express.js và MongoDB, với các tính năng thời gian thực sử dụng Socket.IO.

## Tính năng nổi bật

-   **Quản lý người dùng & Xác thực:**
    -   Đăng ký, đăng nhập, đăng xuất.
    -   Xác thực dựa trên JWT (Access Token & Refresh Token).
    -   Token được lưu trữ an toàn trong `HttpOnly Cookies`.
    -   Cập nhật thông tin người dùng (tên hiển thị, mật khẩu, ảnh đại diện).
    -   Phân quyền người dùng (Client, Admin).

-   **Quản lý chuyến bay:**
    -   Admin có thể tạo, cập nhật, xóa các chuyến bay.
    -   Người dùng có thể tìm kiếm chuyến bay theo điểm đi, điểm đến và ngày khởi hành.
    -   Xem chi tiết thông tin chuyến bay.

-   **Quản lý đặt vé:**
    -   Người dùng đã xác thực có thể đặt vé cho một chuyến bay.
    -   Xem lịch sử đặt vé của cá nhân.
    -   Xem chi tiết một đơn đặt vé.

-   **Tính năng thời gian thực (Real-time) với Socket.IO:**
    -   **Chọn ghế trực tiếp:** Khi người dùng chọn một ghế, ghế đó sẽ được tạm khóa và hiển thị là "đã chọn" cho những người dùng khác đang xem cùng chuyến bay. Ghế sẽ được giải phóng nếu người dùng ngắt kết nối hoặc chọn ghế khác.
    -   **Chat hỗ trợ trực tuyến:**
        -   Khách hàng (chưa đăng nhập) có thể bắt đầu cuộc trò chuyện với Admin.
        -   Admin nhận được thông báo và có thể trả lời tin nhắn trong thời gian thực.
        -   Quản lý các cuộc hội thoại (mở, đang hoạt động, đã đóng).
    -   **Thông báo (Notifications):** Người dùng nhận được thông báo tức thì (ví dụ: đặt vé thành công) qua một kênh socket riêng.

-   **Upload ảnh:**
    -   Người dùng có thể tải lên và thay đổi ảnh đại diện.
    -   Ảnh được lưu trữ trên dịch vụ Cloudinary.

## Công nghệ sử dụng

-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB
-   **Real-time:** Socket.IO
-   **Xác thực:** JSON Web Token (JWT)
-   **Upload file:** Multer, Cloudinary
-   **Validation:** Joi
-   **Môi trường:** `dotenv`

## Cấu trúc thư mục

Dự án được cấu trúc theo mô hình Layered Architecture để dễ dàng bảo trì và mở rộng.

```
.
├── src
│   ├── config          # Cấu hình (database, CORS, environment, socket.io)
│   ├── controllers     # Tầng xử lý request, gọi service và trả về response
│   ├── middlewares     # Các middleware (xác thực, xử lý lỗi, upload file)
│   ├── models          # Định nghĩa schema và tương tác với database
│   ├── providers       # Các nhà cung cấp dịch vụ bên ngoài (JWT, Cloudinary)
│   ├── routes          # Định nghĩa các API endpoints
│   ├── services        # Chứa business logic của ứng dụng
│   ├── sockets         # Xử lý các sự kiện socket.io
│   ├── utils           # Các hàm tiện ích (ApiError, formatters, validators)
│   └── validations     # Tầng kiểm tra và xác thực dữ liệu đầu vào
├── .env                # Biến môi trường (cần tự tạo)
└── server.js           # Điểm khởi đầu của ứng dụng
```

## API Endpoints

### v1

-   **`/v1/users`**: Các API liên quan đến người dùng.
    -   `POST /register`: Đăng ký tài khoản mới.
    -   `POST /login`: Đăng nhập.
    -   `DELETE /logout`: Đăng xuất.
    -   `GET /refresh_token`: Làm mới access token.
    -   `PUT /update`: Cập nhật thông tin người dùng.
-   **`/v1/flights`**: Các API liên quan đến chuyến bay.
    -   `POST /`: (Admin) Tạo chuyến bay mới.
    -   `GET /search`: Tìm kiếm chuyến bay.
    -   `GET /:id`: Lấy chi tiết chuyến bay.
-   **`/v1/bookings`**: Các API liên quan đến đặt vé.
    -   `POST /`: Tạo một đơn đặt vé mới.
    -   `GET /my-bookings`: Lấy danh sách vé đã đặt của người dùng.
    -   `GET /:id`: Lấy chi tiết một đơn đặt vé.
-   **`/v1/chat`**: Các API cho hệ thống chat.
    -   `POST /start`: Bắt đầu một cuộc hội thoại.
    -   `GET /open`: (Admin) Lấy các cuộc hội thoại đang mở.
    -   `GET /:conversationId/history`: Lấy lịch sử tin nhắn.
    -   `POST /:conversationId/message`: (Admin) Gửi tin nhắn qua REST.
-   **`/v1/noti`**: Các API cho thông báo.
    -   `GET /`: Lấy danh sách thông báo của người dùng.

## Cài đặt và Chạy dự án

1.  **Clone repository:**
    ```bash
    git clone <your-repository-url>
    cd bookvexeapis
    ```

2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```

3.  **Tạo file `.env`:**
    Tạo một file `.env` ở thư mục gốc và định nghĩa các biến môi trường cần thiết.
    ```env
    MONGO_DB=your_mongodb_connection_string
    DB_NAME=your_database_name
    LOCAL_DEV_APP_HOST=localhost
    LOCAL_DEV_APP_PORT=8017
    BUILD_MODE=dev

    # JWT
    ACCESS_TOKEN_SECRET_SIGNATURE=your_access_token_secret
    ACCESS_TOKEN_LIFE=1h
    REFRESH_TOKEN_SECRET_SIGNATURE=your_refresh_token_secret
    REFRESH_TOKEN_LIFE=14d

    # Cloudinary
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

4.  **Chạy server:**
    ```bash
    npm start
    ```
    Server sẽ chạy tại địa chỉ `http://localhost:8017` (hoặc port bạn đã cấu hình).
