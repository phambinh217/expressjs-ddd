# CLAUDE.md

Project `backend-nodejs`: **Express + TypeScript** (commonjs) + **Sequelize v6** + **PostgreSQL**.

**camelCase toàn bộ** — request, response và tên cột DB (`userId`, `createdAt`) (xem
`docs/coding-conventions/api-convention/controller-convention.md` § Casing).

Tài liệu: `docs/` là **nguồn sự thật duy nhất** (mục lục ở `docs/README.md`); file này chỉ là chỉ
mục. Sửa code làm đổi quy ước → sửa docs tương ứng trong cùng MR.

## Lệnh

- `npm run dev` — dev server `localhost:3000` (tsx watch).
- `npm run build` / `npm start` — build TypeScript rồi chạy `dist/`.
- `npm run cli -- <command>` — CLI (Commander), vd. `npm run cli -- user:list`.
- `npm run typecheck` — kiểm tra TypeScript không emit.
- `npm run lint` / `lint:fix` — ESLint; `npm run format` / `format:check` — Prettier. Chạy cả hai trước khi commit.
- `npm run db:migrate` / `db:migrate:undo` — Sequelize migration.
- `npm run db:seed` / `db:seed:undo` — Sequelize seeder.

## Luật bắt buộc

Xem checklist + link chi tiết: [`docs/coding-conventions/README.md`](docs/coding-conventions/README.md).

## Đọc docs khi

| Khi làm                                   | Đọc (`docs/`)                                                  |
| ----------------------------------------- | -------------------------------------------------------------- |
| Viết/sửa bất kỳ code TS nào               | `coding-conventions/README.md` → `code-style.md`, `naming.md`  |
| Thêm/sửa domain, infras, hoặc API channel | `coding-conventions/domain-driven-design-pattern/`             |
| Viết Entity / Data / Action / Repository  | `coding-conventions/domain-driven-design-pattern/*-pattern.md` |
| Thêm/sửa controller / route API           | `coding-conventions/api-convention/controller-convention.md`   |
| Thêm/sửa CLI command                      | `coding-conventions/console-command.md`                        |
