# Action pattern

Action = 1 command nghiệp vụ (ghi dữ liệu hoặc hành động có thể thất bại). **Mọi nghiệp vụ ghi đi
qua Action** — không viết logic ghi trong controller / console command.

Nằm ở `domains/<domain>/actions/`. Ví dụ thật: `domains/user/actions/user-create.ts`,
`user-update.ts`, `user-delete.ts`.

## Khung chuẩn

Mọi Action có `make()` static + `execute()` trả `Promise<T | BadAction>`:

```ts
import { ValidationError } from '@vinejs/vine'
import { BadAction } from '@/infras/errors/bad-action'
import { catchDbError } from '@/infras/database/catch-db-error'
import { hashPassword } from '@/infras/hashing/password-hash'
import { UserCreateData } from '@/domains/user/data/user-create-data'
import { User } from '@/domains/user/entities/user'
import { userRepository } from '@/domains/user/repositories/user-repository'

/**
 * Action tạo user — mọi ghi dữ liệu user đi qua đây, không ghi thẳng từ controller.
 */
export class UserCreate {
  constructor(private readonly data: UserCreateData) {}

  static make = (data: UserCreateData): UserCreate => {
    return new UserCreate(data)
  }

  execute = async (): Promise<User | BadAction> => {
    const input = await this.validate()

    if (BadAction.isError(input)) {
      return input
    }

    const emailExists = await userRepository.existsWhere({ email: input.email })

    if (BadAction.isError(emailExists)) {
      return emailExists
    }

    if (emailExists) {
      return BadAction.fromString('Email already exists', { field: 'email' }, 422)
    }

    const hashedPassword = await hashPassword(input.password)

    if (BadAction.isError(hashedPassword)) {
      return hashedPassword
    }

    const user = User.build()

    user.setName(input.name)
    user.setEmail(input.email)
    user.setPassword(hashedPassword)

    return catchDbError(user.save())
  }

  /**
   * Boundary Vine — convert lỗi validate thành BadAction ngay tại chỗ.
   */
  private validate = () => {
    return this.data.validate().catch((error: unknown) => {
      if (error instanceof ValidationError) {
        return BadAction.fromValidationError(error)
      }

      return BadAction.fromUnknownError({
        cause: error instanceof Error ? error.message : String(error),
      })
    })
  }
}
```

Update nhận thêm entity đang sửa, chỉ set field có gửi (`domains/user/actions/user-update.ts`):

```ts
export class UserUpdate {
  constructor(
    private readonly user: User,
    private readonly data: UserUpdateData,
  ) {}

  execute = async (): Promise<User | BadAction> => {
    const input = await this.validate()

    if (BadAction.isError(input)) {
      return input
    }

    /* check unique khi đổi email, hash password nếu có gửi… */

    if (input.name !== undefined) {
      this.user.setName(input.name)
    }

    return catchDbError(this.user.save())
  }
}
```

Delete nhận entity, trả `true | BadAction` (`domains/user/actions/user-delete.ts`):

```ts
execute = async (): Promise<true | BadAction> => {
  const result = await catchDbError(this.user.destroy())

  if (BadAction.isError(result)) {
    return result
  }

  return true
}
```

- File: `<entity>-<verb>.ts` (vd. `user-create.ts`) — [naming](../naming.md).
- Nhận **instance** [Data](data-pattern.md) (`UserCreateData`), không nhận plain object từ
  controller rồi tự new trong Action (controller gọi `UserCreateData.make` trước).
- Tạo/sửa [Entity](entity-pattern.md) bằng `User.build()` + `setX`; persist qua
  `catchDbError(user.save())` (repository không có `save`). Action là nơi **duy nhất** được ghi — không gọi `user.save()` / `User.create()` ở chỗ
  khác, và luôn bọc `catchDbError` (quên bọc → lỗi Sequelize throw ra ngoài).
- Dùng **kết quả** `validate()` (đã chuẩn hoá theo rules), không đọc field gốc `this.data.x`.
- Ràng buộc nghiệp vụ (unique, tồn tại…) kiểm tra trong Action qua repository (vd.
  `existsWhere({ email })` → `BadAction` 422), không trông vào ràng buộc DB — entity không ràng buộc.
- `try/catch` chỉ quanh đúng lời gọi throw (Vine `validate`), tách thành method `validate` riêng;
  repository / `hashPassword` / `catchDbError` đã trả `BadAction`, không bọc thêm.
- Mật khẩu hash bằng `hashPassword` (`infras/hashing/password-hash.ts`, scrypt) trong Action trước khi
  `setPassword` — setter không hash.
- Không bắt buộc `BaseAction` — khung `make` / `execute` là convention theo tay.

## `BadAction` — lỗi trả về, không throw nghiệp vụ

Implement: `infras/errors/bad-action.ts`.

- `BadAction.fromString(...)` — lỗi nghiệp vụ tự viết (message **tiếng Anh**).
- `BadAction.fromValidationError(...)` — từ Vine `ValidationError`.
- `BadAction.fromUnknownError(...)` — boundary thư viện (Sequelize, …).
- Nơi gọi: `BadAction.isError(result)` rồi return sớm.

Compose: Action B gọi Action A, A lỗi → `return` thẳng `BadAction`.

## Nhận instance entity, không nhận ID

Khi đã resolve được entity, truyền **instance** vào Action/helper nội bộ. ID chỉ thuộc ranh giới
ngoài (HTTP → Data).

## Checklist Action mới

- [ ] `make()` + `execute(): Promise<T | BadAction>`.
- [ ] Input qua Data class; dùng kết quả `validate()` trước khi ghi.
- [ ] Ràng buộc unique/tồn tại kiểm tra qua repository, trả `BadAction` 422/404.
- [ ] Boundary Vine/Sequelize → `BadAction`, không throw ra controller.
- [ ] Message tiếng Anh.
- [ ] Helper nội bộ nhận entity instance, không nhận id rồi find lại.
- [ ] Entity qua setter + `catchDbError(entity.save())` trong Action — không ghi ở Controller/console.
