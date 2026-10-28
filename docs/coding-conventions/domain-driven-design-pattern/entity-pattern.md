# Entity pattern

Entity = **Sequelize model** (Active Record), nằm ở `domains/<domain>/entities/`. Ví dụ thật:
`domains/user/entities/user.ts`.

## Luật bắt buộc

1. Entity `extends Model<InferAttributes<X>, InferCreationAttributes<X>>`, file chỉ khai cột
   bằng `declare` + getter/setter. Ánh xạ bảng (`X.init(...)`) tách sang
   `domains/<domain>/models/<name>-model.ts` (hàm `init<Name>Model`), gọi trong `boot*Provider`
   — xem [Model](#model--ánh-xạ-bảng).
2. **Entity không ràng buộc** — chỉ ánh xạ cột:
   - Mọi cột **optional** (`declare name?: string`), getter trả `T | undefined`.
   - `init` (ở model) chỉ khai `type` (+ `primaryKey`/`autoIncrement` cho khóa chính) — **không**
     `allowNull`, `unique`, `validate`, `defaultValue`.
   - Ràng buộc (bắt buộc, định dạng, unique…) đặt ở [Data](data-pattern.md) (Vine) và
     [Action](action-pattern.md). Ràng buộc vật lý còn lại ở DB (migration) chỉ là chốt chặn cuối;
     lỗi DB được `catchDbError` bọc thành `BadAction`.
3. Đọc qua [Repository](repository-pattern.md) (`find*`, `getWhere`, `paginate`…).
4. **Ghi chỉ trong [Action](action-pattern.md)**: `catchDbError(user.save())` /
   `catchDbError(user.destroy())` — repository không có `save`. Không gọi `user.save()` / `User.create()` / `user.destroy()` ở controller, console
   command hay response — Sequelize cho phép nhưng convention cấm.
5. Mỗi cột có cặp **`getX` / `setX`** (arrow function, getter khai trước setter, setter trả
   `void`). Bên ngoài entity **luôn**
   đọc/gán qua getter/setter, không truy cập property (`user.name`) dù Sequelize cho phép. Tên
   getter/setter không được trùng tên cột (class field trùng tên cột sẽ che giá trị cột).
   Getter/setter thuần — không trim, không tính toán, không gán kèm cột khác (nghiệp vụ đặt trong
   Action).
6. File: `<name>.ts` (kebab-case, **không** hậu tố `-entity`/`-model` — thư mục `entities/` đã
   nói rõ loại) — [naming](../naming.md).
7. Model phải init trước mọi lần dùng entity: `server.ts` / `cli.ts` gọi `bootProviders()` đầu
   tiên. Quên boot → Sequelize báo lỗi khó hiểu (`Cannot read properties of undefined (reading
'length')` khi `User.build()`).

## Khung chuẩn

```ts
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id?: number
  declare name?: string
  declare email?: string
  declare password?: string
  declare createdAt?: Date
  declare updatedAt?: Date

  getName = (): string | undefined => {
    return this.name
  }

  setName = (value: string): void => {
    this.name = value
  }

  /* getId/setId, getEmail/setEmail, … — cùng kiểu */
}
```

## Model — ánh xạ bảng

```ts
// domains/user/models/user-model.ts
export const initUserModel = (): void => {
  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100) },
      /* … */
    },
    { sequelize, tableName: 'users', modelName: 'User' },
  )
}

// domains/user/providers/user-provider.ts
export const bootUserProvider = (): void => {
  initUserModel()
}
```

Model import entity, entity không import model (không vòng).

## Quan hệ (association)

Ví dụ thật: `User.hasMany(Post)` ở `domains/user/models/user-model.ts`.

- Khai trong hàm `associate<Name>Model()` cạnh `init<Name>Model()`, gọi qua
  `associate<Domain>Provider()`. `src/providers.ts` (`bootProviders`, server + CLI dùng chung) init
  model **mọi** domain trước rồi mới associate — association cần cả 2 model đã init.
- Entity khai quan hệ bằng `declare posts?: NonAttribute<Post[]>` + getter `getPosts()`;
  `undefined` khi không nạp.
- Nạp qua option `with` của repository → `include` với `separate: true` — 1 query riêng
  `WHERE "userId" IN (...)` (eager loading), không JOIN nên phân trang không bị nhân dòng.
- Cột khóa ngoại camelCase (`userId`), chỉ index, không foreign key (hạn chế ràng buộc DB).

## Dùng trong Action

```ts
const user = User.build()

user.setName(this.data.name)
user.setEmail(this.data.email)
user.setPassword(this.data.password)

return catchDbError(user.save())
```

## Không làm gì trong Entity

- Không import từ `interfaces/`.
- Không xử lý nghiệp vụ ghi phức tạp (unique check…) — tách sang [Action](action-pattern.md).
- Không trả entity thẳng ra client (`res.json(user)` lộ `password`, `dataValues`…) — map tay ở
  `getResource` của controller với kiểu trả về khai rõ.

## Checklist Entity mới

- [ ] `domains/<domain>/entities/<name>.ts` — `extends Model` + `declare` cột optional + `getX`/`setX`
- [ ] `domains/<domain>/models/<name>-model.ts` — `init<Name>Model()`, chỉ có `type`
- [ ] `boot<Domain>Provider()` gọi `init<Name>Model()`
- [ ] Ràng buộc input ở Data (Vine) / Action, không ở entity
- [ ] Migration tương ứng trong `src/migrations/`
- [ ] Repository `domains/<domain>/repositories/<name>-repository.ts`
- [ ] Ghi chỉ trong Action: `catchDbError(entity.save())` / `destroy()`
