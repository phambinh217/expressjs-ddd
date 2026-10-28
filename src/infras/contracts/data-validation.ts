import vine, { type VineObject } from '@vinejs/vine'
import type { SchemaTypes } from '@vinejs/vine/types'

/**
 * ----------------------------
 * Vì sao không dùng ReturnType<typeof vine.object>?
 * ----------------------------
 * `vine.object` là generic: ReturnType suy ra Properties = Record<string, SchemaTypes>
 * (generic mặc định), còn `vine.object({ name: vine.string(), ... })` ra VineObject với
 * Properties cụ thể. Hai kiểu đó không gán được cho nhau (lệch COTYPE) → bắt buộc `as`.
 *
 * Muốn không cast: khai type đủ rộng là "mọi VineObject", không lấy ReturnType của hàm generic.
 */
export type ValidationRules = VineObject<Record<string, SchemaTypes>, unknown, unknown, unknown>

/**
 * Kết quả `vine.validate(...)` — giữ Promise (không Awaited).
 */
export type ValidationResult = ReturnType<typeof vine.validate>

/**
 * Contract cho Data class có validate bằng Vine — `rules()` phải trả về kết quả `vine.object(...)`.
 */
export interface DataValidation {
  rules: () => ValidationRules
  validate: () => ValidationResult
}
