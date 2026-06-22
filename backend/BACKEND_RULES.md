# BACKEND RULES — Booking Bàn / Phòng Nội Bộ

## 1. Mục tiêu backend

Backend là nguồn sự thật cuối cùng của hệ thống booking bàn/phòng.

Backend chịu trách nhiệm:

```txt
- Xác thực đăng nhập.
- Quản lý accessToken và refreshToken.
- Phân quyền theo role.
- Quản lý user.
- Quản lý chi nhánh.
- Quản lý bàn/phòng.
- Quản lý booking.
- Chống đặt trùng bàn/phòng.
- Tự động chuyển booking thành no_show nếu khách không đến sau 30 phút.
- Trả dữ liệu cho frontend để hiển thị sơ đồ bàn/phòng.
```

Tính năng chính của dự án:

```txt
Khi nhân viên vào app, frontend sẽ hiển thị ngay sơ đồ bàn/phòng.
Nếu bàn/phòng có lịch booking đang chờ khách tới, bàn/phòng đó đổi màu và hiển thị thông tin nhanh:
- Tên khách hàng.
- Số điện thoại nếu có.
- Ngày đặt.
- Giờ khách dự kiến đến.
- Nhân viên tạo booking.
```

Backend không được để frontend tự quyết định bàn/phòng nào đã được booking. Frontend chỉ hiển thị theo dữ liệu backend trả về.

---

## 2. Công nghệ backend

Dự án dùng:

```txt
Backend: NodeJS + ExpressJS
Database: MongoDB Atlas
ODM: Mongoose
Auth: JWT accessToken + refreshToken
Password hash: bcrypt
```

Các thư viện nên dùng:

```txt
express
mongoose
dotenv
bcrypt
jsonwebtoken
cookie-parser
cors
helmet
express-rate-limit
node-cron
```

---

## 3. Cấu trúc thư mục backend

Backend phải giữ cấu trúc rõ ràng:

```txt
backend/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── branchController.js
│   │   ├── resourceController.js
│   │   └── bookingController.js
│   │
│   ├── models/
│   │   ├── RefreshToken.js
│   │   ├── User.js
│   │   ├── Branch.js
│   │   ├── Resource.js
│   │   └── Booking.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── branchRoutes.js
│   │   ├── resourceRoutes.js
│   │   └── bookingRoutes.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validateMiddleware.js
│   │
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   ├── branchValidator.js
│   │   ├── resourceValidator.js
│   │   └── bookingValidator.js
│   │
│   ├── utils/
│   │   ├── tokenService.js
│   │   ├── dateTime.js
│   │   ├── bookingStatus.js
│   │   └── response.js
│   │
│   ├── jobs/
│   │   └── autoCancelBookings.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

Quy tắc:

```txt
server.js chỉ dùng để kết nối database và chạy server.
app.js dùng để cấu hình express, middleware và routes.
controllers xử lý request/response.
models chứa Mongoose schema.
routes chỉ khai báo endpoint và gắn middleware/controller.
middlewares chứa auth, role, validate, error handler.
validators chứa rule validate dữ liệu đầu vào.
utils chứa hàm dùng lại.
jobs chứa tác vụ chạy nền như auto-cancel no_show.
```

---

## 4. Vai trò người dùng

Hệ thống có 3 role:

```txt
admin
manager
employee
```

Ý nghĩa:

```txt
admin    = quản trị toàn bộ hệ thống.
manager  = quản lý chi nhánh, nhân viên và booking trong chi nhánh.
employee = nhân viên thao tác booking trên sơ đồ bàn/phòng.
```

Quy tắc phân quyền:

```txt
Backend luôn kiểm tra quyền cuối cùng.
Không tin role gửi từ frontend.
Không tin branchId, userId, employeeId gửi từ frontend nếu có thể lấy từ token.
Frontend chỉ ẩn/hiện giao diện, không phải bảo mật thật.
```

---

## 5. User Model

Schema tham khảo:

```js
{
  fullName: String,
  username: String,
  email: String,
  passwordHash: String,
  phone: String,

  role: "admin" | "manager" | "employee",

  status: "pending" | "active" | "blocked" | "deleted",

  branchId: ObjectId,

  createdBy: ObjectId,
  approvedBy: ObjectId,
  approvedAt: Date,

  lastLoginAt: Date,

  isDeleted: Boolean,

  createdAt: Date,
  updatedAt: Date
}
```

Trạng thái user:

```txt
pending = tài khoản mới đăng ký, chờ admin duyệt.
active = tài khoản đang hoạt động.
blocked = tài khoản bị khóa.
deleted = tài khoản đã xóa mềm.
```

Quy tắc:

```txt
Không lưu password thường.
Mật khẩu phải hash bằng bcrypt.
Không trả passwordHash về frontend.
Người tự đăng ký không được tự chọn role.
Tài khoản tự đăng ký mặc định role = employee.
Tài khoản tự đăng ký mặc định status = pending.
Login chỉ cho phép user status = active.
Admin được duyệt tài khoản pending.
Admin được khóa/mở khóa tài khoản.
Admin được đổi role.
Admin được gán chi nhánh.
Nên soft delete user.
```

Index đề xuất:

```txt
email unique
username unique
role
status
branchId
isDeleted
```

---

## 6. Branch Model

Schema tham khảo:

```js
{
  name: String,
  code: String,
  address: String,
  phone: String,

  status: "active" | "inactive",

  isDeleted: Boolean,

  createdAt: Date,
  updatedAt: Date
}
```

Quy tắc:

```txt
Mỗi manager thuộc một chi nhánh.
Mỗi employee thuộc một chi nhánh.
Mỗi resource thuộc một chi nhánh.
Booking phải gắn với chi nhánh.
Chỉ admin được tạo/sửa/xóa chi nhánh.
DELETE nên là soft delete hoặc đổi status inactive.
```

Index đề xuất:

```txt
code unique
status
isDeleted
```

---

## 7. Resource Model

Resource đại diện cho bàn hoặc phòng có thể được booking.

Schema tham khảo:

```js
{
  branchId: ObjectId,

  name: String,
  code: String,

  type: "table" | "room",

  capacity: Number,

  description: String,

  status: "active" | "maintenance" | "inactive",

  locationLabel: String,

  layout: {
    floor: String,
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    rotation: Number
  },

  createdBy: ObjectId,

  isDeleted: Boolean,

  createdAt: Date,
  updatedAt: Date
}
```

Giải thích:

```txt
type = table hoặc room.
status = trạng thái vật lý của bàn/phòng.
layout = tọa độ để frontend vẽ sơ đồ bàn/phòng.
```

Quy tắc rất quan trọng:

```txt
Không lưu trạng thái đã đặt/chưa đặt trực tiếp trong Resource.
Resource.status chỉ là trạng thái vật lý: active, maintenance, inactive.
Bàn/phòng có đang được booking hay không phải tính từ Booking.
Mỗi resource code phải unique trong cùng một branch.
Resource maintenance hoặc inactive không được đặt.
Nên soft delete resource.
```

Index đề xuất:

```txt
branchId
type
status
branchId + code unique
isDeleted
```

---

## 8. Booking Model

Booking là dữ liệu quyết định bàn/phòng có đang được giữ chỗ hay không.

Schema tham khảo:

```js
{
  branchId: ObjectId,

  resourceId: ObjectId,

  employeeId: ObjectId,

  employeeNameSnapshot: String,

  customerName: String,
  customerPhone: String,

  bookingCreatedAt: Date,

  expectedArrivalTime: Date,

  arrivalDeadline: Date,

  actualArrivalTime: Date,

  startTime: Date,
  endTime: Date,

  numberOfGuests: Number,

  note: String,

  status:
    "reserved" |
    "arrived" |
    "completed" |
    "cancelled" |
    "no_show" |
    "expired",

  cancelReason: String,
  cancelledBy: ObjectId,
  cancelledAt: Date,

  createdBy: ObjectId,
  updatedBy: ObjectId,

  isDeleted: Boolean,

  createdAt: Date,
  updatedAt: Date
}
```

Giải thích trạng thái:

```txt
reserved = đã booking, đang chờ khách tới.
arrived = khách đã tới và nhận bàn/phòng.
completed = booking hoàn tất nếu sau này cần dùng.
cancelled = booking bị hủy thủ công.
no_show = khách không đến sau 30 phút.
expired = booking hết hạn nếu sau này cần dùng.
```

Workflow chính:

```txt
Khi nhân viên tạo booking trên bàn/phòng:
reserved được tạo.

Khi nhân viên bấm "Khách đã nhận bàn":
reserved -> arrived.

Dashboard chính chỉ hiển thị các booking status = reserved.
Booking arrived không còn hiển thị trên sơ đồ dạng đang chờ.
Resource sau khi booking arrived sẽ trở lại trạng thái trống trên dashboard.
```

Quy tắc:

```txt
Một bàn/phòng không được có 2 booking reserved trùng giờ.
Không tin giờ từ frontend nếu chưa validate.
startTime phải nhỏ hơn endTime.
expectedArrivalTime phải hợp lệ.
arrivalDeadline = expectedArrivalTime + 30 phút.
bookingCreatedAt do backend tự tạo.
employeeId lấy từ token, không tin frontend.
employeeNameSnapshot nên lưu để lịch sử không bị sai khi user đổi tên.
Cancel không xóa record.
Nên soft delete nếu cần ẩn khỏi giao diện.
```

---

## 9. Chống đặt trùng giờ

Khi tạo booking mới, backend phải kiểm tra conflict.

Query cơ bản:

```js
const conflict = await Booking.findOne({
  resourceId,
  status: { $in: ["reserved"] },
  startTime: { $lt: newEndTime },
  endTime: { $gt: newStartTime },
  isDeleted: false
});
```

Ý nghĩa:

```txt
Có trùng giờ nếu:
booking cũ bắt đầu trước giờ kết thúc mới
và
booking cũ kết thúc sau giờ bắt đầu mới.
```

Khi update booking, phải loại trừ chính booking đang sửa:

```js
const conflict = await Booking.findOne({
  _id: { $ne: bookingId },
  resourceId,
  status: { $in: ["reserved"] },
  startTime: { $lt: newEndTime },
  endTime: { $gt: newStartTime },
  isDeleted: false
});
```

Lưu ý:

```txt
Theo workflow hiện tại, status arrived không hiển thị trên dashboard chờ.
Nếu backend muốn arrived vẫn chặn booking trong cùng khung giờ, có thể thêm arrived vào danh sách active status.
Mặc định hiện tại nên dùng reserved để chặn trùng booking chờ.
```

Backend phải thực hiện theo thứ tự:

```txt
1. Kiểm tra đăng nhập.
2. Kiểm tra quyền.
3. Validate input.
4. Kiểm tra resource tồn tại.
5. Kiểm tra resource active.
6. Kiểm tra resource thuộc branch hợp lệ.
7. Kiểm tra startTime < endTime.
8. Kiểm tra expectedArrivalTime hợp lệ.
9. Kiểm tra trùng giờ.
10. Tạo/cập nhật booking.
```

---

## 10. Auto-cancel no_show sau 30 phút

Yêu cầu:

```txt
Nếu khách không đến sau 30 phút kể từ expectedArrivalTime,
booking phải tự chuyển thành no_show.
```

Công thức:

```txt
arrivalDeadline = expectedArrivalTime + 30 phút
```

Điều kiện:

```txt
Nếu current server time > arrivalDeadline
và status = reserved
thì cập nhật status = no_show.
```

Triển khai MVP:

```txt
Dùng node-cron.
Chạy mỗi 1 phút hoặc 5 phút.
Tìm booking status = reserved và arrivalDeadline < hiện tại.
Update status = no_show.
Ghi cancelReason = AUTO_NO_SHOW_AFTER_30_MINUTES nếu có field này.
```

Quy tắc:

```txt
Không dùng frontend timer để tự hủy chính.
Auto-cancel phải chạy ở backend.
Job phải idempotent.
Không động vào booking đã arrived, completed, cancelled, no_show, expired.
```

---

## 11. Auth APIs

Base URL:

```txt
/api/auth
```

Endpoint hiện tại:

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me
POST /api/auth/logout
```

Không tự ý thêm `/logout-all` vào frontend/backend rules nếu người dùng không yêu cầu.

Quy tắc:

```txt
Register phải hash password.
Register mặc định role = employee.
Register mặc định status = pending.
Login chỉ cho user active.
Login từ chối pending, blocked, deleted.
Refresh dùng refreshToken theo cơ chế backend hiện tại.
Logout phải xóa/revoke refreshToken theo cơ chế backend hiện tại.
GET /me không trả passwordHash.
```

---

## 12. User APIs

Base URL:

```txt
/api/users
```

Endpoint tham khảo:

```txt
GET    /api/users
GET    /api/users/:id
POST   /api/users
PATCH  /api/users/:id
PATCH  /api/users/:id/status
PATCH  /api/users/:id/role
PATCH  /api/users/:id/branch
DELETE /api/users/:id
```

Chức năng:

```txt
Admin duyệt tài khoản pending.
Admin khóa tài khoản active thành blocked.
Admin mở khóa tài khoản blocked thành active.
Admin đổi role.
Admin gán chi nhánh.
Admin xóa mềm user.
```

Quy tắc:

```txt
Admin quản lý tất cả user.
Manager chỉ quản lý trong chi nhánh nếu backend cho phép.
Employee không được truy cập API quản lý user.
Không trả passwordHash.
DELETE là soft delete.
Không cho user tự đổi role/status/branch của chính mình nếu không được phép.
```

---

## 13. Branch APIs

Base URL:

```txt
/api/branches
```

Endpoint tham khảo:

```txt
GET    /api/branches
GET    /api/branches/:id
POST   /api/branches
PATCH  /api/branches/:id
DELETE /api/branches/:id
```

Quy tắc:

```txt
Chỉ admin được tạo/sửa/xóa chi nhánh.
Manager/employee chỉ xem chi nhánh liên quan nếu cần.
DELETE là soft delete hoặc đổi status inactive.
Không xóa cứng chi nhánh nếu còn dữ liệu liên quan.
```

---

## 14. Resource APIs

Base URL:

```txt
/api/resources
```

Endpoint tham khảo:

```txt
GET    /api/resources
GET    /api/resources/:id
POST   /api/resources
PATCH  /api/resources/:id
DELETE /api/resources/:id
GET    /api/resources/availability
GET    /api/resources/map
```

Endpoint quan trọng cho frontend sơ đồ:

```txt
GET /api/resources/map?branchId=&date=&fromTime=&toTime=
```

Endpoint này nên trả về danh sách resource kèm booking reserved hiện tại nếu có.

Response gợi ý:

```js
{
  "success": true,
  "message": "Lấy sơ đồ bàn/phòng thành công",
  "data": [
    {
      "_id": "resourceId",
      "name": "Bàn 001",
      "code": "T001",
      "type": "table",
      "capacity": 4,
      "status": "active",
      "locationLabel": "Tầng 1",
      "layout": {
        "floor": "1",
        "x": 120,
        "y": 80,
        "width": 90,
        "height": 70,
        "rotation": 0
      },
      "currentBooking": {
        "_id": "bookingId",
        "customerName": "Nguyễn Văn A",
        "customerPhone": "090xxxxxxx",
        "expectedArrivalTime": "2026-06-22T18:30:00.000Z",
        "startTime": "2026-06-22T18:30:00.000Z",
        "endTime": "2026-06-22T20:00:00.000Z",
        "status": "reserved",
        "employeeNameSnapshot": "Nhân viên 1"
      }
    }
  ]
}
```

Quy tắc:

```txt
Resource active và không có currentBooking => có thể đặt.
Resource active và có currentBooking reserved => đổi màu, hiển thị thông tin booking.
Resource maintenance/inactive => không cho đặt.
Không lưu currentBooking trong Resource, chỉ populate/tính khi trả API.
```

---

## 15. Booking APIs

Base URL:

```txt
/api/bookings
```

Endpoint tham khảo:

```txt
GET    /api/bookings
GET    /api/bookings/:id
POST   /api/bookings
PATCH  /api/bookings/:id
PATCH  /api/bookings/:id/cancel
PATCH  /api/bookings/:id/arrived
PATCH  /api/bookings/:id/complete
DELETE /api/bookings/:id
```

Endpoint quan trọng:

```txt
POST /api/bookings
```

Dùng khi nhân viên click vào bàn/phòng trên sơ đồ và tạo booking.

Payload tham khảo:

```js
{
  "resourceId": "resourceId",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "090xxxxxxx",
  "expectedArrivalTime": "2026-06-22T18:30:00.000Z",
  "startTime": "2026-06-22T18:30:00.000Z",
  "endTime": "2026-06-22T20:00:00.000Z",
  "numberOfGuests": 4,
  "note": "Khách yêu cầu gần cửa sổ"
}
```

Backend tự lấy:

```txt
employeeId từ token.
employeeNameSnapshot từ user hiện tại.
branchId từ resource hoặc từ user branch hợp lệ.
bookingCreatedAt = current server time.
arrivalDeadline = expectedArrivalTime + 30 phút.
status = reserved.
```

Endpoint xác nhận khách tới:

```txt
PATCH /api/bookings/:id/arrived
```

Khi gọi endpoint này:

```txt
status chuyển từ reserved sang arrived.
actualArrivalTime = current server time.
updatedBy = user hiện tại.
Booking không còn hiển thị trên dashboard chờ.
```

Endpoint hủy booking:

```txt
PATCH /api/bookings/:id/cancel
```

Khi hủy:

```txt
status = cancelled.
cancelledBy = user hiện tại.
cancelledAt = current server time.
cancelReason lưu nếu frontend gửi.
```

---

## 16. API danh sách và filter

Các API danh sách nên hỗ trợ:

```txt
page
limit
keyword
branchId
status
type
fromDate
toDate
resourceId
employeeId
customerPhone
```

Response pagination:

```js
{
  "success": true,
  "message": "Lấy danh sách thành công",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 17. Response format thống nhất

Thành công:

```js
{
  "success": true,
  "message": "Thao tác thành công",
  "data": {}
}
```

Lỗi:

```js
{
  "success": false,
  "message": "Có lỗi xảy ra",
  "errors": []
}
```

Không trả:

```txt
passwordHash
refreshToken raw nếu không cần
stack trace production
lỗi database thô
secret
```

---

## 18. Bảo mật

Quy tắc bắt buộc:

```txt
JWT secret nằm trong .env.
Mongo URI nằm trong .env.
Không commit .env.
Không allow mọi origin trong production.
Login/register có rate limit.
Refresh token nên dùng httpOnly cookie.
Không lưu refreshToken ở localStorage.
Không tin ObjectId từ frontend nếu chưa validate.
Không cho user tự set role/status/branch khi đăng ký.
Không cho frontend gửi employeeId rồi tin ngay.
```

File .env tham khảo, không tự ý đổi nếu dự án đã có sẵn:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_IDLE_DAYS=7
SESSION_ABSOLUTE_DAYS=30
CLIENT_URL=http://localhost:5173
```

---

## 19. Validate dữ liệu

Phải validate:

```txt
email đúng định dạng.
password đủ độ dài.
role thuộc enum admin/manager/employee.
user status thuộc enum pending/active/blocked/deleted.
resource status thuộc enum active/maintenance/inactive.
booking status thuộc enum reserved/arrived/completed/cancelled/no_show/expired.
MongoDB ObjectId hợp lệ.
Ngày giờ hợp lệ.
startTime < endTime.
expectedArrivalTime hợp lệ.
customerName không rỗng nếu bắt buộc.
customerPhone đúng định dạng nếu có.
resource tồn tại.
branch tồn tại.
resource thuộc đúng branch.
user có quyền thao tác với branch/resource/booking đó.
```

---

## 20. Điều AI không được làm ở backend

```txt
Không đổi ReactJS + Vite sang NextJS.
Không tự ý thêm /logout-all nếu người dùng không yêu cầu.
Không bỏ authMiddleware ở API cần đăng nhập.
Không bỏ roleMiddleware ở API cần phân quyền.
Không lưu password plain text.
Không trả passwordHash.
Không tin role/status/branchId từ frontend.
Không dùng hard delete nếu không được yêu cầu.
Không bỏ kiểm tra trùng giờ.
Không dùng frontend timer làm nguồn xử lý no_show chính.
Không nhét toàn bộ logic vào một file quá lớn.
Không tự ý đổi enum user status: pending/active/blocked/deleted.
Không tự ý đổi enum role: admin/manager/employee.
Không lưu trạng thái đã đặt trong Resource.
```

---

## 21. Mục tiêu chất lượng backend

```txt
Code rõ ràng.
Controller gọn.
Middleware rõ nhiệm vụ.
Model có index cần thiết.
Response thống nhất.
Validate đầy đủ.
Phân quyền chắc chắn.
Không lộ dữ liệu nhạy cảm.
Logic booking nằm ở backend.
API map trả dữ liệu thuận tiện cho frontend vẽ sơ đồ.
Có thể deploy production sau này.
```

---

## 22. Tư duy cốt lõi backend

```txt
Resource = bàn/phòng vật lý.
Booking = lịch giữ chỗ.
Dashboard = sơ đồ resource + booking reserved hiện tại.
Resource không tự biết mình đã được đặt.
Backend tính currentBooking từ Booking rồi trả cho frontend.
Khi tạo booking thành công, status = reserved.
Khi khách nhận bàn, status = arrived.
Dashboard chỉ còn hiển thị booking reserved.
Auto no_show do backend xử lý sau 30 phút.
```
