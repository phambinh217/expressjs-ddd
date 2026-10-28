# Repository pattern

Repository = **nơi tập trung query đọc** của 1 entity. Entity là Sequelize model (xem
[entity-pattern](entity-pattern.md)), repository trả chính instance entity.

Ví dụ thật:

- `infras/database/postgres-repository.ts` — class nền `PostgresRepository`
- `domains/user/repositories/user-repository.ts` — `extends PostgresRepository`, chỉ khai báo `model` + `query`

## PostgresRepository — method dùng chung

Repository con khai báo `model` (entity) + `query(options)` (trả `FindOptions`: `where`,
`include`, `order`…). Mọi method dưới dựng trên `query`, nên thêm điều kiện lọc mới chỉ cần sửa
`query`.

| Method                                                | Mô tả                                                                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `find(id, options?)` / `findWhere(options)`           | Tìm theo khóa chính (kèm `options` để nạp quan hệ / lọc thêm); `null` nếu không có                          |
| `getWhere(options, limit?, offset?)`                  | Danh sách theo options, `limit` / `offset` tuỳ chọn                                                         |
| `countWhere` / `existsWhere(options)`                 | Đếm / kiểm tra tồn tại theo options                                                                         |
| `sumWhere` / `maxWhere` / `minWhere(column, options)` | Tổng / lớn nhất / nhỏ nhất của 1 cột (chỉ áp `where`, bỏ `include`)                                         |
| `paginate(options, perPage?, page?)`                  | Phân trang, trả `Paginator<Entity>`; `perPage` / `page` nhận thẳng từ query string, không hợp lệ thì 15 / 1 |
| `chunk(options, size, callback)`                      | Duyệt theo lô `size`; callback trả `false` để dừng; không có `order` thì sắp theo khóa chính                |

Repository **chỉ đọc** (không có `save` / `destroy`). Mọi method trả
`T | BadAction`; lỗi Sequelize bọc bằng `catchDbError` (`infras/database/catch-db-error.ts`)
— Action cũng dùng hàm này khi ghi: `catchDbError(user.save())`.

## Khung chuẩn

```ts
export type UserQueryOptions = {
  email: string
}

export class UserRepository extends PostgresRepository<User, UserQueryOptions> {
  protected readonly model = User

  protected query = (options: Partial<UserQueryOptions>): FindOptions<InferAttributes<User>> => {
    const where: WhereOptions<InferAttributes<User>> = {}

    if (options.email !== undefined) {
      where.email = options.email
    }

    return { where }
  }
}

export const userRepository = new UserRepository()
```

Dùng: `userRepository.find(1)`, `userRepository.findWhere({ email })`,
`userRepository.paginate({}, 20, 2)`.

- Option lọc mới → thêm key vào `*QueryOptions` + nhánh trong `query`, không thêm method `findByX`.
- Quan hệ → option `with: ('posts')[]` trong `*QueryOptions`, `query` đổi thành
  `include: [{ association: 'posts', separate: true }]`; `find(id, { with: ['posts'] })` nhận options.
- Ghi (`entity.save()` / `entity.destroy()`) không qua repository — chỉ trong Action, bọc `catchDbError`.

## Checklist Repository mới

- [ ] `domains/<domain>/repositories/<name>-repository.ts` `extends PostgresRepository<Entity, Options>`.
- [ ] Chỉ khai báo `model` + `query`; method dùng chung lấy từ class nền.
- [ ] `export type <Name>QueryOptions` — nơi gọi (controller, Action, Data) dùng lại để truyền filter.
- [ ] Không hard-code tenant — nhận qua options từ caller khi cần.
