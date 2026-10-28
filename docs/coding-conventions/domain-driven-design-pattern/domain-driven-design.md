# Domain-driven design

Kiến trúc tách **domain nghiệp vụ**, **domain hạ tầng (`infras`)**, và **interface** (cổng HTTP).
Bám cấu trúc thật trong `src/domains/`, `src/infras/`, `src/interfaces/`.

Pattern chi tiết từng tầng: [entity](entity-pattern.md) · [data](data-pattern.md) ·
[action](action-pattern.md) · [repository](repository-pattern.md) — mục lục thư mục
[README](README.md).

## Tổng quan

```
src/
├── infras/                  ← Domain hạ tầng dùng chung (helper primitives)
│   └── utilities/           ← string, array, object, datetime, …
│
├── domains/                 ← CORE: nghiệp vụ, không biết HTTP
│   └── <domain>/            ← 1 bounded context (vd. user, post)
│       ├── actions/
│       ├── concerns/
│       ├── config/
│       ├── console/commands/
│       ├── contracts/
│       ├── data/
│       ├── entities/
│       ├── models/          ← init<Name>Model: ánh xạ entity ↔ bảng
│       ├── enums/
│       ├── events/
│       ├── jobs/
│       ├── listeners/
│       ├── providers/
│       ├── repositories/    ← query tái dùng (extends PostgresRepository)
│       ├── utilities/
│       └── value-objects/
│
└── interfaces/              ← CỔNG: HTTP / adapter bên ngoài
    └── <channel>/           ← 1 kênh giao tiếp (vd. admin-api)
        ├── controllers/
        ├── middlewares/
        └── routes/
```

- **`infras/`** — bản chất cũng là một domain, nhưng phục vụ **hạ tầng cơ bản** cho các domain
  khác (và interface nếu cần): helper xử lý string, array, object, datetime… Không chứa nghiệp
  vụ bounded context cụ thể.
- **`domains/`** — toàn bộ logic nghiệp vụ (ghi/đọc qua Action + Entity + Repository). Domain
  **không** import từ `interfaces/`.
- **`interfaces/`** — nhận request, auth/middleware, gọi Action/Repository của domain, trả response.
  Chỉ interface → domain (một chiều).
- Domain mẫu: `domains/user/` (đủ entity/model/data/action/repository/provider/command),
  `domains/post/`. Interface mẫu: `interfaces/admin-api/`.

## Phụ thuộc một chiều

```
interfaces/* ──gọi──▶ domains/* ──gọi──▶ infras/*
domains/*    ──✖──▶ interfaces/*     (cấm)
infras/*     ──✖──▶ domains/*        (cấm)
infras/*     ──✖──▶ interfaces/*     (cấm)
```

Controller/route nằm trong `interfaces/`, **không** tạo route/controller trong `domains/` hay
`infras/`.

## Infras (`src/infras/`) — domain hạ tầng

`infras` đứng ngang hàng về “là một domain”, nhưng **không** mang nghiệp vụ user/post…
Mọi thứ ở đây phải **generic**, tái dùng được bởi nhiều domain mà không biết domain nào đang gọi.

### Khi nào để vào `infras/`

- Helper thuần kiểu dữ liệu / thời gian / chuỗi / object / array (vd. `slugify`, `deepMerge`,
  `chunkArray`, `formatDateTime`).
- Utility không gắn 1 bounded context — nếu chỉ phục vụ 1 domain → để trong
  `domains/<domain>/utilities/`.

### Khi nào **không** để vào `infras/`

- Logic nghiệp vụ, Entity, Action, Repository của 1 domain.
- Shape response HTTP, middleware auth — thuộc `interfaces/`.
- Helper chỉ dùng trong 1 domain — giữ ở `domains/<domain>/utilities/`.

### Cấu trúc hiện tại

```
src/infras/
├── utilities/     ← helper primitives (string, array, object, datetime, …)
├── errors/        ← BadAction và lỗi hạ tầng dùng chung
├── database/      ← Sequelize / kết nối DB dùng chung
└── console/       ← kernel CLI (Commander program, exit code, bootstrap DB)
```

Có thể bổ sung tầng khác trong `infras/` khi thật cần (cùng tinh thần domain: chỉ tạo thư mục
đang dùng), miễn không kéo nghiệp vụ domain vào đây.

## Domain (`src/domains/<domain>/`)

Tên thư mục domain: **kebab-case** (vd. `user`, `blog-post`, `order-item`) — [naming](naming.md).

**Không bắt buộc đủ mọi thư mục con.** Chỉ tạo những tầng domain thật cần; không scaffold sẵn thư
mục rỗng “cho đủ bộ”.

### Vai trò từng tầng

| Thư mục                  | Vai trò                                                                                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entities/`              | Sequelize model (Active Record) — `declare` cột + getter/setter. Đọc qua `repositories/`, ghi chỉ trong `actions/`.                                                                            |
| `models/`                | `init<Name>Model()` — `X.init(...)` ánh xạ entity ↔ bảng (chỉ `type`), gọi trong `boot*Provider`.                                                                                              |
| `value-objects/`         | Giá trị bất biến, so sánh theo value (money, email, slug…).                                                                                                                                    |
| `data/`                  | Input DTO cho Action (create/update…) — thuần dữ liệu, không logic nghiệp vụ.                                                                                                                  |
| `actions/`               | 1 command nghiệp vụ = 1 Action (`make` + `execute` trả `T \| BadAction`). Mọi ghi dữ liệu đi qua đây — không viết logic ghi thẳng trong controller.                                            |
| `repositories/`          | Query tái dùng của entity — `extends PostgresRepository`, chỉ khai `model` + `query`.                                                                                                          |
| `contracts/`             | Interface/type mà domain expose cho chỗ khác bind (repository port, gateway…).                                                                                                                 |
| `enums/`                 | Enum / union const của domain.                                                                                                                                                                 |
| `events/` + `listeners/` | Event nội bộ domain + listener xử lý. Chỉ tạo khi thật sự phát/nghe event.                                                                                                                     |
| `jobs/`                  | Job chạy nền thuộc domain (queue).                                                                                                                                                             |
| `console/commands/`      | CLI command thuộc domain.                                                                                                                                                                      |
| `providers/`             | `boot<Domain>Provider()` (init model), `associate<Domain>Provider()` (quan hệ), `register<Domain>Commands(program)` (chỉ CLI). Thêm vào `src/providers.ts` → `bootProviders()`.                |
| `config/`                | Config riêng của domain (đọc từ env / file).                                                                                                                                                   |
| `concerns/`              | Mixin / helper nhỏ dùng chung giữa các class trong domain.                                                                                                                                     |
| `utilities/`             | Helper nhiều hàm public quanh 1 chủ đề **của domain này** — chỗ tạm khi chưa đủ rõ để thành Action riêng. Helper generic (string/array/object/datetime) → `infras/utilities/`, không để ở đây. |

### Action — cửa vào nghiệp vụ ghi

- Controller **không** ghi DB trực tiếp; gọi `SomeAction.make(...).execute()`.
- `execute()` trả `T | BadAction` — nơi gọi check `BadAction.isError` rồi return sớm ([code-style](code-style.md)).
- Nhận Entity / Data object qua constructor, không nhận id thô rồi tự load lại khi đã có entity.

### Repository — query tái dùng

- Mọi query đi qua Repository (`find*`, `getWhere`, `paginate`…); ghi bằng `catchDbError(entity.save())` trong Action.
- Implement: `repositories/<name>-repository.ts` `extends PostgresRepository` (`infras/database/`).
- Contract (nếu cần invert dependency) đặt ở `contracts/`; interface HTTP không biết driver DB.

### Provider

- Domain thuần logic, không có entity/command → **không tạo** `providers/`.
- Có config / command / event-listener / bind contract → tạo `*-provider.ts`, đăng ký từ bootstrap app.

## Interface (`src/interfaces/<channel>/`)

Mỗi kênh giao tiếp (admin API, public API, webhook…) là **một thư mục** dưới `interfaces/`.

Cấu trúc kênh (theo `admin-api`):

| Thư mục        | Vai trò                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `routes/`      | `api.ts` khai phẳng từng route (đường dẫn đầy đủ → method controller) — xem [controller-convention](../api-convention/controller-convention.md). |
| `controllers/` | Nhận request → gọi Action/Repository domain → trả HTTP. Không chứa nghiệp vụ ghi.                                                                |
| `middlewares/` | Auth, parse, rate-limit… của kênh này.                                                                                                           |

### Quy ước controller

- Controller theo **domain** mà nó thao tác (vd. `controllers/user/...`), không để toàn bộ endpoint phẳng một đống không phân nhóm khi kênh lớn.
- Middleware chỉ lo **xác thực**; scope tenant / quyền trên dữ liệu do controller/query tự gắn khi gọi Repository/Action.
- Lỗi nghiệp vụ: nhận `BadAction` từ Action → `return result.toResponse(res)` — không `try/catch` để branch nghiệp vụ.

### Thêm kênh mới

1. Tạo `src/interfaces/<channel>/` với các thư mục thật cần (`routes`, `controllers`, …).
2. Mount router vào `app` (hoặc aggregator routes), **không** nhét route vào trong domain.
3. Chỉ import từ `@/domains/...` — không ngược lại.

## Checklist domain mới

- [ ] Tạo `src/domains/<domain>/` — chỉ thư mục con thật cần.
- [ ] Entity / Data / Action đặt đúng tầng; ghi dữ liệu qua Action.
- [ ] Query phức tạp tái dùng → option mới trong `query` của `repositories/<name>-repository.ts`.
- [ ] Có entity/command/event → `providers/`; thêm `boot*` / `associate*` vào `src/providers.ts`, `register*Commands` ở `cli.ts`.
- [ ] Endpoint HTTP → thêm ở `src/interfaces/<channel>/`, không trong domain.
- [ ] Không import `interfaces` từ trong `domains`.
- [ ] Helper generic (string/array/object/datetime…) → `infras/`, không nhét vào domain nghiệp vụ.

## Checklist interface / endpoint mới

- [ ] Chọn đúng kênh (`admin-api` hoặc kênh mới).
- [ ] Route + controller + (nếu cần) middleware/response trong kênh đó.
- [ ] Controller gọi Action/Repository domain; không viết logic ghi tại controller.
- [ ] Shape resource ở `getResource` của controller (interface), không đẩy vào domain.
