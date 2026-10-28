import type { Response } from 'express'

/**
 * ----------------------------
 * BadAction — thay thế try/catch
 * ----------------------------
 * Hàm có thể fail thì return `T | BadAction` thay vì throw. Nơi gọi check
 * `BadAction.isError(result)` rồi return sớm — không dùng try/catch để branch theo lỗi
 * nghiệp vụ. try/catch chỉ còn hợp lệ tại đúng 1 lớp boundary (bọc thẳng lời gọi throw của
 * thư viện ngoài như Sequelize/fetch/JSON.parse) để convert throw đó thành BadAction ngay
 * tại chỗ.
 */
export class BadAction {
  constructor(
    public readonly message: string,
    public readonly errorDetails: Record<string, unknown> = {},
    public readonly statusCode: number = 500,
  ) {}

  /**
   * Tạo BadAction từ 1 message string — cách tạo phổ biến nhất cho lỗi nghiệp vụ
   * (không map từ exception thư viện ngoài).
   */
  static fromString(
    message: string,
    errorDetails: Record<string, unknown> = {},
    statusCode: number = 500,
  ): BadAction {
    return new BadAction(message, errorDetails, statusCode)
  }

  /**
   * Dùng đúng tại lớp boundary khi bắt buộc phải catch exception ném ra từ thư viện ngoài
   * (Sequelize, fetch network error, JSON.parse lỗi, ...).
   */
  static fromUnknownError(errorDetails: Record<string, unknown> = {}): BadAction {
    return new BadAction('An unknown error has occurred', errorDetails, 500)
  }

  /**
   * Boundary Vine — convert ValidationError thành BadAction (HTTP 422).
   */
  static fromValidationError(error: { messages: unknown; status?: number }): BadAction {
    return new BadAction('Validation failed', { messages: error.messages }, error.status ?? 422)
  }

  static isError(value: unknown): value is BadAction {
    return value instanceof BadAction
  }

  /**
   * Trả JSON lỗi `{ message, errors }` với status của BadAction. Controller viết
   * `return result.toResponse(res)`.
   */
  toResponse = (res: Response): void => {
    if (res.headersSent) {
      return
    }

    res.status(this.statusCode).json({
      message: this.message,
      errors: this.errorDetails,
    })
  }
}
