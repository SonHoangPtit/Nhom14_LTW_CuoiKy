# Hệ Thống Quản Lý Nhà Trọ (Đề 4 - Nhóm 14)

Ứng dụng web Fullstack (MongoDB, Express.js, React, Node.js) hỗ trợ quản lý dãy trọ, phòng trọ, hợp đồng thuê, tính tiền điện nước tự động, yêu cầu sửa chữa và thống kê doanh thu.

## Tài khoản Demo (Dữ liệu mẫu)

Chạy lệnh `node seed.js` trong thư mục `server` để khởi tạo dữ liệu mẫu với các tài khoản sau:

| Vai trò | Họ và tên | Email | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Chủ trọ** (`landlord`) | Nguyễn Văn Chủ | `chutro@gmail.com` | `123456` | Toàn quyền quản lý dãy, phòng, hợp đồng, hóa đơn, thống kê |
| **Người thuê** (`tenant`) | Trần Minh Tuấn | `nguoithue1@gmail.com` | `123456` | Thuê phòng P101 & P202 (có hóa đơn đã thanh toán & đang nợ) |
| **Người thuê** (`tenant`) | Lê Thị Mai | `nguoithue2@gmail.com` | `123456` | Thuê phòng P102 |
| **Người thuê** (`tenant`) | Phạm Hoàng Nam | `nguoithue3@gmail.com` | `123456` | Thuê phòng P201 |

## Hướng dẫn cài đặt và chạy dự án

### 1. Chạy Backend (`server`)
```bash
cd server
npm install
node seed.js    # Khởi tạo dữ liệu mẫu vào MongoDB
npm run dev     # Chạy server tại http://localhost:5000