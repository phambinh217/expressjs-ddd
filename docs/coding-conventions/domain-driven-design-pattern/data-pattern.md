# Data pattern

Data = input DTO cho [Action](action-pattern.md). Thuần dữ liệu + schema Vine — **không** logic
nghiệp vụ ghi, không gọi Repository/Entity để save. Nằm ở `domains/<domain>/data/`.

Chuẩn thật trong repo: `domains/user/data/user-create-data.ts`.

## Khung chuẩn (Create)

```ts
import type { DataValidation, ValidationRules } from '@/infras/contracts/data-validation'
import vine from '@vinejs/vine'

/**
 * Giữ schema ở hằng riêng để `validate()` suy ra kiểu output cụ thể (`rules()` trả kiểu chung
 * ValidationRules nên output thành any).
 */
const userCreateRules = vine.object({
  name: vine.string(),
  email: vine.string().email(),
  password: vine.string(),
})

/**
 * Input DTO tạo user — thuần dữ liệu + Vine rules; không logic nghiệp vụ ghi.
 */
export class UserCreateData implements DataValidation {
  public constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
  ) {}

  /**
   * Factory từ plain object (body request / CLI args).
   */
  static make = (input: { name: string; email: string; password: string }): UserCreateData => {
    return new UserCreateData(input.name, input.email, input.password)
  }

  public rules = (): ValidationRules => {
    return userCreateRules
  }

  /**
   * Trả dữ liệu đã validate (đã chuẩn hoá theo rules) — Action dùng kết quả này, không đọc field gốc.
   */
  public validate = () => {
    return vine.validate({
      schema: userCreateRules,
      data: {
        name: this.name,
        email: this.email,
        password: this.password,
      },
    })
  }
}
```

- File: `<entity>-<verb>-data.ts` (vd. `user-create-data.ts`).
- `implements DataValidation` (`infras/contracts/data-validation.ts`): bắt buộc `rules()` +
  `validate()`.
- Schema khai ở **hằng cấp file** (`userCreateRules`); `rules()` trả hằng đó, `validate()` dùng
  thẳng hằng (không qua `this.rules()`) để TypeScript suy ra kiểu output cụ thể. `ValidationRules`
  là kiểu rộng (mọi `VineObject`) nên đi qua `rules()` thì output thành `any`.
- Field trong `vine.object` mặc định required; không dùng `.required()`. Optional mới `.optional()`.
- `validate()` truyền **plain object field**, không truyền `this`.
- `static make(...)` — factory từ body/CLI; controller gọi `UserCreateData.make(...)` rồi đưa vào
  Action.
- Create: field bắt buộc kiểu thường (`string`, …), không optional “cho tiện”.

## Update — phân biệt “không gửi” vs “gửi null”

| Client                 | Giá trị trong Data | Ý nghĩa                           |
| ---------------------- | ------------------ | --------------------------------- |
| **Không gửi** field    | `undefined`        | Giữ nguyên giá trị cũ trên entity |
| Gửi field **= `null`** | `null`             | Xoá giá trị (set null thật)       |

TypeScript phân biệt sẵn `undefined` và `null` nên **không** dùng giá trị sentinel. Ví dụ thật: `domains/user/data/user-update-data.ts`.

- Field update khai optional: `name?: string`; field xoá được thêm `| null` (`email?: string | null`).
- Rules: `.optional()` cho mọi field; chỉ field xoá được (cột nullable) thêm `.nullable()`.
- Vine coi `null` ở field `.optional()` (không `.nullable()`) là “không gửi” → bị bỏ qua, giá trị cũ
  giữ nguyên.
- Action chỉ set field có trong kết quả validate: `if (input.name !== undefined)` — không dùng
  `!= null` (gộp mất trường hợp xoá).

## Action gọi validate

```ts
/**
 * Method riêng của Action: this.data.validate().catch(→ BadAction).
 */
const input = await this.validate()

if (BadAction.isError(input)) {
  return input
}
```

Boundary Vine hợp lệ — convert throw thành `BadAction` ngay trong Action (xem
[action-pattern](action-pattern.md)). Action dùng `input`, không đọc `this.data.x`.

## Không làm gì trong Data

- Không `save()`, không gọi Repository.
- Không đọc Auth / request Express — controller map body → `UserCreateData.make(...)`.
- Không tự trả HTTP response.

## Checklist Data mới

- [ ] Class `implements DataValidation`, có `rules` + `validate` + `static make`.
- [ ] Schema là hằng `vine.object(...)` cấp file; `rules()` trả hằng, `validate()` dùng hằng.
- [ ] Create: field bắt buộc kiểu thường.
- [ ] Update: field optional (`?: T`), field xoá được `?: T | null` + `.nullable()`.
- [ ] Không import `interfaces/`; không phụ thuộc HTTP.
