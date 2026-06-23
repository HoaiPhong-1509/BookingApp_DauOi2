# FRONTEND RULES — ReactJS + Vite Booking Bàn / Phòng Nội Bộ

## 1. Mục tiêu frontend

Frontend là phần quan trọng nhất về trải nghiệm sử dụng của nhân viên.

Khi nhân viên đăng nhập vào app, màn hình đầu tiên phải là:

```txt
Sơ đồ bàn/phòng của chi nhánh.
```

Trên sơ đồ:

```txt
- Bàn/phòng chưa có booking đang chờ khách tới sẽ có màu bình thường.
- Bàn/phòng đang có booking sẽ có màu khác nổi bật hơn.
- Bàn/phòng có booking phải hiển thị nhanh thông tin khách bên cạnh hoặc ngay trên card bàn/phòng.
```

Thông tin nhanh cần hiển thị:

```txt
Tên khách hàng.
Số điện thoại nếu có.
Ngày đặt.
Giờ khách dự kiến đến.
Nhân viên tạo booking.
```

Nhân viên có thể thao tác trực tiếp trên sơ đồ:

```txt
Click bàn/phòng mã T001.
Mở form nhập thông tin khách booking.
Bấm xác nhận.
Bàn/phòng đổi màu.
Thông tin booking hiện ngay bên cạnh bàn/phòng trên sơ đồ.
```

Đây là tính năng chính của dự án. AI không được thiết kế frontend theo kiểu chỉ có bảng danh sách booking khô cứng.

---

## 2. Công nghệ frontend

Dự án dùng:

```txt
Frontend: ReactJS + Vite
Routing: react-router-dom
API client: axios
State management: Zustand hoặc React Context
```

Không dùng NextJS.

Lý do:

```txt
App booking nội bộ nhỏ.
Không cần SEO.
Không cần SSR.
Không cần routing theo file.
ReactJS + Vite nhẹ, nhanh và dễ code.
```

---

## 3. Cấu trúc thư mục frontend

Cấu trúc bắt buộc:

```txt
frontend/
│
├── src/
│   ├── api/
│   │   ├── axiosClient.js
│   │   ├── authApi.js
│   │   ├── userApi.js
│   │   ├── branchApi.js
│   │   ├── resourceApi.js
│   │   └── bookingApi.js
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   │
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   │
│   │   ├── map/
│   │   │   ├── ResourceMap.jsx
│   │   │   ├── ResourceNode.jsx
│   │   │   ├── ResourceTooltip.jsx
│   │   │   ├── ResourceLegend.jsx
│   │   │   └── BookingQuickInfo.jsx
│   │   │
│   │   ├── booking/
│   │   │   ├── BookingModal.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   ├── BookingDetailModal.jsx
│   │   │   └── BookingStatusBadge.jsx
│   │   │
│   │   ├── resource/
│   │   ├── branch/
│   │   └── user/
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── PendingApprovalPage.jsx
│   │   ├── BlockedPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── BookingListPage.jsx
│   │   ├── UserManagementPage.jsx
│   │   ├── BranchManagementPage.jsx
│   │   └── ResourceManagementPage.jsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleRoute.jsx
│   │
│   ├── stores/
│   │   ├── authStore.js
│   │   ├── bookingStore.js
│   │   └── mapStore.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useResourceMap.js
│   │   ├── useBookings.js
│   │   ├── useResources.js
│   │   └── useBranches.js
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── formatPhone.js
│   │   ├── bookingStatus.js
│   │   ├── resourceStatus.js
│   │   └── role.js
│   │
│   ├── constants/
│   │   ├── roles.js
│   │   ├── userStatus.js
│   │   ├── bookingStatus.js
│   │   ├── resourceStatus.js
│   │   └── routes.js
│   │
│   ├── styles/
│   │   ├── global.css
│   │   └── resourceMap.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── vite.config.js
```

Quy tắc:

```txt
Không gọi API trực tiếp lộn xộn trong component.
API phải gom vào src/api.
Component sơ đồ bàn/phòng đặt trong src/components/map.
Component booking đặt trong src/components/booking.
Trang chính đặt trong src/pages.
Không đưa secret backend vào frontend.
```

---

## 4. Route frontend

Route đề xuất:

```txt
/login
/register
/pending-approval
/blocked
/dashboard
/bookings
/users
/branches
/resources
```

Phân quyền route:

```txt
/dashboard:
- admin
- manager
- employee

/bookings:
- admin
- manager
- employee

/users:
- admin

/branches:
- admin

/resources:
- admin
- manager nếu backend cho phép
```

Nếu user chưa đăng nhập:

```txt
Chuyển về /login.
```

Nếu user pending:

```txt
Chuyển đến /pending-approval.
```

Nếu user blocked:

```txt
Chuyển đến /blocked.
```

Nếu user không đủ quyền:

```txt
Chuyển về /dashboard hoặc trang 403.
```

---

## 5. Auth frontend

Auth APIs hiện tại:

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me
POST /api/auth/logout
```

Không tự ý thêm `/logout-all` vào frontend.

Login flow:

```txt
1. User nhập email/password.
2. Frontend gọi POST /api/auth/login.
3. Backend trả accessToken và set refreshToken cookie nếu đang dùng cookie.
4. Frontend lưu accessToken trong authStore.
5. Gọi GET /api/auth/me để lấy user.
6. Nếu user active → vào /dashboard.
7. Nếu user pending → /pending-approval.
8. Nếu user blocked → /blocked.
```

Reload flow:

```txt
1. Khi app mở lại, gọi /api/auth/refresh nếu chưa có accessToken.
2. Nếu refresh thành công, lưu accessToken mới.
3. Gọi /api/auth/me.
4. Nếu thành công, cho vào app.
5. Nếu thất bại, chuyển về /login.
```

Logout flow:

```txt
1. Gọi POST /api/auth/logout.
2. Clear authStore.
3. Chuyển về /login.
```

---

## 6. Axios client

Bắt buộc có:

```txt
src/api/axiosClient.js
```

Nhiệm vụ:

```txt
Cấu hình baseURL từ VITE_API_URL.
Bật withCredentials nếu backend dùng refreshToken httpOnly cookie.
Gắn Authorization: Bearer accessToken.
Tự xử lý lỗi 401.
Gọi /api/auth/refresh khi accessToken hết hạn.
Retry request cũ nếu refresh thành công.
Logout nếu refresh thất bại.
```

Quy tắc:

```txt
Không để component tự xử lý refresh token.
Không gọi axios trực tiếp trong component nếu đã có api layer.
Không lưu refreshToken trong localStorage.
AccessToken có thể lưu trong memory/store.
```

File .env frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. Auth store

Frontend nên dùng Zustand hoặc React Context.

Auth store cần lưu:

```txt
user
accessToken
isAuthenticated
isLoading
```

Function cần có:

```txt
login
register
logout
fetchMe
refreshSession
setAccessToken
clearAuth
```

User object nên có:

```txt
_id
fullName
email
role
status
branchId
```

Không lưu:

```txt
passwordHash
refreshToken
secret
```

---

## 8. Dashboard là màn hình chính

Sau khi đăng nhập thành công, user phải vào:

```txt
/dashboard
```

Dashboard phải ưu tiên hiển thị:

```txt
Sơ đồ bàn/phòng.
```

Không được thiết kế dashboard chỉ là bảng thống kê.

Dashboard cần có:

```txt
Bộ chọn chi nhánh nếu user là admin.
Bộ lọc ngày.
Bộ lọc khung giờ nếu cần.
Sơ đồ bàn/phòng.
Legend màu trạng thái.
Nút refresh dữ liệu.
Thông tin nhanh booking trên từng bàn/phòng.
```

Với employee/manager thuộc một chi nhánh:

```txt
Tự load sơ đồ chi nhánh của user.
Không bắt chọn chi nhánh nếu không cần.
```

Với admin:

```txt
Có thể chọn chi nhánh để xem sơ đồ.
```

---

## 9. Resource Map

Component chính:

```txt
ResourceMap.jsx
```

Nhiệm vụ:

```txt
Nhận danh sách resource từ API.
Vẽ bàn/phòng theo layout x, y, width, height, rotation.
Hiển thị màu theo trạng thái.
Cho phép click trực tiếp vào bàn/phòng.
Mở modal tạo booking hoặc xem booking.
```

Resource object từ API map nên có:

```js
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
```

Nếu chưa có layout:

```txt
Frontend có thể hiển thị dạng grid card tạm thời.
Sau này khi có layout thì chuyển sang sơ đồ tọa độ.
```

---

## 10. Màu trạng thái trên sơ đồ

Frontend phải có legend giải thích màu.

Trạng thái đề xuất:

```txt
Trống/có thể đặt:
- Resource active
- Không có currentBooking
- Cho click để tạo booking

Đang có booking:
- Resource active
- Có currentBooking status = reserved
- Đổi màu nổi bật
- Hiển thị thông tin khách nhanh

Bảo trì:
- Resource status = maintenance
- Disable click tạo booking

Không hoạt động:
- Resource status = inactive
- Disable click tạo booking
```

Không được nhầm:

```txt
Resource.status không phải trạng thái đã đặt.
currentBooking mới quyết định bàn/phòng đang có booking hay không.
```

Class CSS gợi ý:

```txt
resource-node
resource-node--available
resource-node--reserved
resource-node--maintenance
resource-node--inactive
resource-node--selected
```

---

## 11. Resource Node

Component:

```txt
ResourceNode.jsx
```

Mỗi bàn/phòng cần hiển thị:

```txt
Mã bàn/phòng, ví dụ T001.
Tên bàn/phòng.
Sức chứa nếu cần.
Icon/table/room nếu cần.
Trạng thái màu.
Thông tin booking nhanh nếu có.
```

Nếu resource có currentBooking:

```txt
Hiển thị:
- Tên khách.
- Giờ khách đến.
- Ngày đặt.
- SĐT nếu có.
```

Ví dụ hiển thị nhanh:

```txt
T001
Nguyễn Văn A
18:30 - 22/06
090xxxxxxx
```

Nếu resource không có currentBooking:

```txt
Hiển thị:
T001
Trống
```

Nếu maintenance:

```txt
T001
Bảo trì
```

---

## 12. Click vào bàn/phòng

Khi nhân viên click vào resource:

### Trường hợp 1: Resource active và chưa có currentBooking

Mở modal tạo booking:

```txt
BookingModal
```

Modal tự điền:

```txt
Resource code.
Resource name.
Branch.
Nhân viên hiện tại.
```

Nhân viên nhập:

```txt
Tên khách hàng.
Số điện thoại nếu có.
Số khách nếu cần.
Ngày đặt/ngày khách đến.
Giờ khách dự kiến đến.
Giờ bắt đầu giữ bàn/phòng.
Giờ kết thúc giữ bàn/phòng.
Ghi chú nếu có.
```

Bấm xác nhận:

```txt
Gọi POST /api/bookings.
Nếu thành công:
- Đóng modal.
- Reload resource map.
- Bàn/phòng đổi màu.
- Hiện thông tin booking cạnh bàn/phòng.
```

### Trường hợp 2: Resource active và có currentBooking

Mở quick detail hoặc popover:

```txt
Tên khách.
SĐT.
Giờ khách đến.
Giờ bắt đầu/kết thúc.
Nhân viên tạo.
Ghi chú.
```

Hành động:

```txt
Khách đã nhận bàn.
Hủy booking.
Xem chi tiết.
```

### Trường hợp 3: Resource maintenance/inactive

Không cho tạo booking.

Hiển thị thông báo:

```txt
Bàn/phòng này đang bảo trì hoặc không hoạt động.
```

---

## 13. Booking Modal

Component:

```txt
BookingModal.jsx
BookingForm.jsx
```

Form tạo booking phải có:

```txt
Bàn/phòng được chọn.
Tên nhân viên.
Tên khách hàng.
Số điện thoại khách hàng nếu có.
Số lượng khách nếu cần.
Ngày khách đến.
Giờ khách dự kiến đến.
Giờ bắt đầu giữ bàn/phòng.
Giờ kết thúc giữ bàn/phòng.
Ghi chú nếu có.
```

Quy tắc:

```txt
Tên nhân viên lấy từ user đang đăng nhập.
Không cho nhân viên tự nhập employeeId.
Không cho tự nhập branchId nếu có thể lấy từ resource/user.
Không cho đặt resource maintenance/inactive.
Frontend chỉ validate cơ bản.
Backend vẫn validate cuối cùng.
```

Validate frontend:

```txt
Tên khách không được rỗng nếu backend yêu cầu.
Giờ bắt đầu phải nhỏ hơn giờ kết thúc.
Số khách phải lớn hơn 0 nếu có.
Giờ khách đến phải nằm trong khoảng hợp lệ nếu backend yêu cầu.
```

Khi backend báo trùng giờ:

```txt
Hiển thị lỗi rõ:
Bàn/phòng này đã có booking trong khung giờ đã chọn.
```

---

## 14. Sau khi tạo booking thành công

Sau khi POST /api/bookings thành công:

```txt
Không chỉ hiện toast rồi đứng yên.
Bắt buộc cập nhật lại sơ đồ.
```

Có 2 cách:

```txt
1. Gọi lại API /api/resources/map.
2. Hoặc cập nhật state local currentBooking cho resource vừa tạo.
```

Khuyến nghị MVP:

```txt
Gọi lại API /api/resources/map để đảm bảo dữ liệu đúng từ backend.
```

Kết quả UI:

```txt
Bàn/phòng vừa đặt đổi màu.
Thông tin khách hiện cạnh bàn/phòng.
```

---

## 15. Khách đã nhận bàn

Khi nhân viên bấm:

```txt
Khách đã nhận bàn
```

Frontend gọi:

```txt
PATCH /api/bookings/:id/arrived
```

Sau khi thành công:

```txt
Đóng popover/modal.
Reload lại sơ đồ.
Booking đó không còn currentBooking trên sơ đồ.
Bàn/phòng trở về trạng thái trống/có thể đặt.
```

Quy tắc:

```txt
Không xóa booking khỏi database.
Không tự chuyển trạng thái ở frontend mà không gọi backend.
Không hiển thị arrived như booking đang chờ trên dashboard chính.
```

---

## 16. Hủy booking

Khi nhân viên bấm:

```txt
Hủy booking
```

Frontend cần confirm:

```txt
Bạn có chắc muốn hủy booking này không?
```

Có thể nhập lý do hủy nếu backend hỗ trợ.

Gọi API:

```txt
PATCH /api/bookings/:id/cancel
```

Sau khi thành công:

```txt
Reload sơ đồ.
Bàn/phòng trở lại trạng thái trống/có thể đặt.
Booking không còn hiển thị trên dashboard chờ.
```

---

## 17. Booking quick info

Component:

```txt
BookingQuickInfo.jsx
```

Hiển thị nhanh bên cạnh hoặc bên trong resource node.

Thông tin bắt buộc:

```txt
Tên khách.
Giờ khách dự kiến đến.
Ngày đặt/ngày khách đến.
```

Thông tin nếu có:

```txt
Số điện thoại.
Số khách.
Nhân viên tạo.
Ghi chú ngắn.
```

Không nên hiển thị quá nhiều làm rối sơ đồ.

Nếu cần đầy đủ:

```txt
Click để mở BookingDetailModal.
```

---

## 18. Resource legend

Component:

```txt
ResourceLegend.jsx
```

Bắt buộc có chú thích màu:

```txt
Trống / Có thể đặt.
Đang có booking.
Bảo trì.
Không hoạt động.
```

Legend giúp nhân viên nhìn là hiểu ngay.

---

## 19. Auto-refresh dashboard

Vì có thể nhiều nhân viên cùng đặt booking, dashboard phải tự cập nhật.

MVP dùng polling:

```txt
Cứ 10 - 30 giây gọi lại /api/resources/map.
```

Quy tắc:

```txt
Không polling quá nhanh.
Khi component unmount phải clear interval.
Nếu API lỗi, hiện thông báo nhẹ.
Không làm crash app.
```

Sau này có thể dùng Socket.IO, nhưng MVP chưa cần.

---

## 20. Booking List Page

Trang:

```txt
/bookings
```

Dùng để xem danh sách/lịch sử booking, không phải màn hình chính.

Bộ lọc:

```txt
Ngày.
Khoảng ngày.
Chi nhánh.
Bàn/phòng.
Trạng thái.
Tên khách.
Số điện thoại.
Nhân viên tạo.
```

Bảng hiển thị:

```txt
Tên khách.
SĐT.
Bàn/phòng.
Chi nhánh.
Giờ khách đến.
Giờ bắt đầu.
Giờ kết thúc.
Nhân viên tạo.
Trạng thái.
Hành động.
```

Lưu ý:

```txt
Dashboard là sơ đồ bàn/phòng.
Booking list chỉ là trang phụ để tra cứu/lọc lịch sử.
```

---

## 21. User Management Page

Trang:

```txt
/users
```

Chỉ admin được vào.

Chức năng:

```txt
Xem danh sách tài khoản.
Duyệt tài khoản pending.
Khóa tài khoản active thành blocked.
Mở khóa tài khoản blocked thành active.
Đổi role.
Gán chi nhánh.
Xóa mềm.
```

Status user đang dùng:

```txt
pending
active
blocked
deleted
```

Không dùng locked.

---

## 22. Branch Management Page

Trang:

```txt
/branches
```

Chỉ admin được vào.

Chức năng:

```txt
Xem danh sách chi nhánh.
Tạo chi nhánh.
Sửa chi nhánh.
Đổi trạng thái active/inactive.
Xóa mềm.
```

---

## 23. Resource Management Page

Trang:

```txt
/resources
```

Dùng để quản lý bàn/phòng.

Chức năng:

```txt
Xem danh sách bàn/phòng.
Tạo bàn/phòng.
Sửa bàn/phòng.
Đổi trạng thái active/maintenance/inactive.
Xóa mềm bàn/phòng.
Cập nhật layout vị trí bàn/phòng nếu có.
```

Form resource:

```txt
Chi nhánh.
Tên bàn/phòng.
Mã bàn/phòng.
Loại table/room.
Sức chứa.
Khu vực.
Mô tả.
Trạng thái.
Tọa độ layout nếu có.
```

---

## 24. API files

### authApi.js

Nên có:

```txt
login
register
refresh
me
logout
```

Không thêm logoutAll nếu không được yêu cầu.

### resourceApi.js

Nên có:

```txt
getResources
getResourceById
createResource
updateResource
deleteResource
getResourceMap
getAvailability
```

`getResourceMap` là API quan trọng nhất cho dashboard.

### bookingApi.js

Nên có:

```txt
getBookings
getBookingById
createBooking
updateBooking
cancelBooking
markBookingArrived
completeBooking
deleteBooking
```

### userApi.js

Nên có:

```txt
getUsers
getUserById
approveUser
blockUser
unblockUser
changeUserRole
assignUserBranch
deleteUser
```

### branchApi.js

Nên có:

```txt
getBranches
getBranchById
createBranch
updateBranch
deleteBranch
```

---

## 25. UI loading/error/empty

Mọi màn hình gọi API phải có:

```txt
Loading state.
Error state.
Empty state.
```

Ví dụ Dashboard:

```txt
Loading: Đang tải sơ đồ bàn/phòng...
Error: Không thể tải sơ đồ. Vui lòng thử lại.
Empty: Chưa có bàn/phòng nào trong chi nhánh này.
```

---

## 26. Toast và Confirm

Cần có thông báo:

```txt
Tạo booking thành công.
Bàn/phòng này đã có booking trong khung giờ đã chọn.
Hủy booking thành công.
Đã xác nhận khách nhận bàn.
Không có quyền thao tác.
Phiên đăng nhập hết hạn.
```

Các hành động nguy hiểm phải confirm:

```txt
Hủy booking.
Xóa resource.
Xóa user.
Khóa user.
Xóa chi nhánh.
```

---

## 27. Nguyên tắc thiết kế giao diện

Ưu tiên:

```txt
Nhanh.
Rõ.
Dễ thao tác.
Nhân viên nhìn vào biết bàn nào đang có booking.
Không cần quá đẹp ở MVP.
Không làm quá nhiều màn hình trước khi dashboard chạy tốt.
code dễ quản lý và thay đổi trong tương lai
```

Dashboard phải trả lời được ngay:

```txt
Bàn nào đang được booking?
Khách tên gì?
Khách đến lúc mấy giờ?
Số điện thoại là gì?
Ai tạo booking?
Có thể bấm vào bàn nào để đặt?
```

---

## 28. Thứ tự code frontend MVP

AI phải code theo thứ tự:

```txt
1. Setup ReactJS + Vite nếu chưa có.
2. Cài react-router-dom.
3. Cài axios.
4. Tạo cấu trúc thư mục frontend.
5. Tạo axiosClient.
6. Tạo authApi.
7. Tạo authStore.
8. Làm LoginPage.
9. Làm /refresh và /me để giữ đăng nhập.
10. Làm logout.
11. Làm ProtectedRoute.
12. Làm RoleRoute.
13. Làm MainLayout, Sidebar, Topbar.
14. Làm DashboardPage.
15. Làm resourceApi.getResourceMap.
16. Làm ResourceMap.
17. Làm ResourceNode.
18. Làm ResourceLegend.
19. Làm BookingQuickInfo.
20. Làm BookingModal.
21. Tạo booking từ thao tác click bàn/phòng.
22. Sau khi tạo booking, reload sơ đồ.
23. Làm nút "Khách đã nhận bàn".
24. Làm nút hủy booking.
25. Thêm auto-refresh dashboard.
26. Làm BookingListPage.
27. Làm UserManagementPage.
28. Làm BranchManagementPage.
29. Làm ResourceManagementPage.
30. Test toàn bộ flow.
```

Không được ưu tiên trang admin trước dashboard. Tính năng chính là sơ đồ bàn/phòng.

---

## 29. Test frontend bắt buộc

Phải test:

```txt
1. User active login vào /dashboard.
2. User pending không vào dashboard.
3. User blocked không vào dashboard.
4. AccessToken hết hạn thì gọi /refresh.
5. Refresh thất bại thì logout.
6. Dashboard load được sơ đồ bàn/phòng.
7. Bàn/phòng không có booking hiển thị trạng thái trống.
8. Bàn/phòng có booking reserved đổi màu.
9. Bàn/phòng có booking hiển thị tên khách, giờ, ngày, sdt nếu có.
10. Click bàn trống T001 mở modal tạo booking.
11. Tạo booking thành công thì T001 đổi màu và hiện thông tin.
12. Tạo booking trùng giờ thì hiện lỗi từ backend.
13. Click bàn có booking mở quick detail.
14. Bấm "Khách đã nhận bàn" thì bàn trở về trạng thái trống trên dashboard.
15. Bấm hủy booking thì bàn trở về trạng thái trống.
16. Employee không vào được /users.
17. Admin vào được /users.
18. Polling dashboard không gây lỗi khi rời trang.
```

---

## 30. Điều AI không được làm ở frontend

```txt
Không đổi ReactJS + Vite sang NextJS.
Không thiết kế dashboard chính thành bảng booking đơn thuần.
Không bỏ sơ đồ bàn/phòng.
Không tự ý thêm /logout-all.
Không lưu refreshToken trong localStorage.
Không gọi API trực tiếp rải rác trong component.
Không để frontend tự quyết định chống trùng giờ.
Không để frontend tự quyết định quyền thật sự.
Không dùng Resource.status làm trạng thái đã đặt.
Không hiển thị booking arrived như booking đang chờ trên dashboard.
Không bỏ reload/update sơ đồ sau khi tạo booking.
Không bỏ confirm khi hủy booking.
Không tự ý đổi user status blocked thành locked.
Không tự ý đổi role admin/manager/employee.
```

---

## 31. Tư duy cốt lõi frontend

```txt
Luôn thiết kế mobile first
Dashboard là sơ đồ bàn/phòng.
Nhân viên thao tác trực tiếp trên bàn/phòng.
Click bàn trống để tạo booking.
Tạo booking xong bàn đổi màu và hiện thông tin khách.
Click bàn có booking để xem nhanh/hủy/xác nhận khách đến.
Khách đã nhận bàn thì booking không còn hiển thị trên dashboard chờ.
Booking list chỉ là trang tra cứu phụ.
Admin pages là phần quản lý phụ.
Tính năng chính phải chạy tốt trước.
```
