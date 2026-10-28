# Console command (Commander)

CLI dùng [Commander](https://github.com/tj/commander.js). Entry: `src/cli.ts` — gọi `bootProviders()`
(`src/providers.ts`, init model + quan hệ mọi domain), tạo program rồi gọi `register*Commands(program)` của domain có command.

## Cấu trúc

```
src/cli.ts                                      ← entry
src/infras/console/                             ← kernel CLI dùng chung
  create-program.ts
  bootstrap-database.ts
  exit-code.ts
src/domains/<domain>/
  console/commands/*-command.ts                 ← định nghĩa Command
  providers/*-provider.ts                       ← boot*Provider + register*Commands
```

## Quy ước

- Command **mỏng**: ghi DB phải qua Action; đọc list/filter phức tạp qua Repository — không query/
  ghi Sequelize thẳng trong command khi đã có Action/Repository.
- Message log / lỗi trên CLI viết **tiếng Anh** ([code-style § Message](code-style.md#message)).
- Exit code tường minh: `EXIT_SUCCESS` / `EXIT_FAILURE` từ `infras/console/exit-code` — gán
  `process.exitCode`, không dựa vào việc có `console.error` hay không.
- Domain có command → `register*Commands` trong `providers/*-provider.ts`, gọi từ `src/cli.ts`.
- Cần DB → gọi `bootstrapDatabase()` đầu action. Model đã init sẵn nhờ `bootProviders()` ở `src/cli.ts`.

## Thêm command mới

1. Tạo `domains/<domain>/console/commands/<name>-command.ts` — factory trả về `Command`.
2. Đăng ký trong `register<Domain>Commands` của `domains/<domain>/providers/<domain>-provider.ts` bằng `program.addCommand(...)`.
3. Nếu domain chưa có trên CLI → thêm `boot<Domain>Provider()` vào `src/providers.ts` + gọi `register<Domain>Commands(program)` trong `src/cli.ts`.

## Chạy

```bash
npm run cli -- --help
npm run cli -- user:list
```
