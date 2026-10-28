# Naming

- Biến và props phía **TS**: **camelCase**.
- Tên file: `ten-file.ts` (kebab-case) — kể cả file chỉ export 1 class cũng theo cú pháp này, không đặt theo PascalCase.
- Ngoài phần mở rộng thật của loại file (`.ts`, hoặc `.d.ts` cho declaration file), **không** được có dấu chấm nào khác trong tên file. Phần hậu tố mô tả loại (api/model/controller/service/route/middleware...) nối bằng dấu gạch ngang, không phải dấu chấm.
  - Sai: `user.model.ts`, `user.controller.ts`, `auth.middleware.ts`
  - Đúng: `user-model.ts`, `user-controller.ts`, `auth-middleware.ts`
- Tên thư mục: `ten-thu-muc` (kebab-case). Thư mục gom các file cùng chức năng thì đặt tên **số nhiều** (vd. `models/`, `routes/`, `middlewares/`, `controllers/`... — trừ khi bản thân danh từ đã ở dạng không đếm được).
- Tên file, tên thư mục, tên class: phải là **danh từ**.
- Tên function: phải là **động từ**.
- Function khai báo bằng **arrow function**, không dùng `function` thông thường.
- Ưu tiên **`export const`** hơn `export default`, kể cả khi file chỉ export duy nhất 1 giá trị.
