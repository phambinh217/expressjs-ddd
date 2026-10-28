import type { DataValidation, ValidationRules } from '@/infras/contracts/data-validation'
import vine from '@vinejs/vine'

/**
 * Field nào không gửi thì `undefined` (giữ nguyên), gửi `null` thì xoá — TypeScript phân biệt sẵn
 * nên không cần giá trị sentinel. Chỉ `email` được xoá (cột nullable).
 */
const userUpdateRules = vine.object({
  name: vine.string().optional(),
  email: vine.string().email().nullable().optional(),
  password: vine.string().optional(),
})

/**
 * Input DTO cập nhật user — thuần dữ liệu + Vine rules; không logic nghiệp vụ ghi.
 */
export class UserUpdateData implements DataValidation {
  public constructor(
    public readonly name?: string,
    public readonly email?: string | null,
    public readonly password?: string,
  ) {}

  /**
   * Factory từ plain object (body request / CLI args) — key không có thì giữ `undefined`.
   */
  static make = (input: {
    name?: string
    email?: string | null
    password?: string
  }): UserUpdateData => {
    return new UserUpdateData(input.name, input.email, input.password)
  }

  public rules = (): ValidationRules => {
    return userUpdateRules
  }

  /**
   * Trả dữ liệu đã validate — Action dùng kết quả này, không đọc field gốc.
   */
  public validate = () => {
    return vine.validate({
      schema: userUpdateRules,
      data: {
        name: this.name,
        email: this.email,
        password: this.password,
      },
    })
  }
}
