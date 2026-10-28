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
