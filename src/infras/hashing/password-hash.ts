import { randomBytes, scrypt } from 'node:crypto'
import { BadAction } from '@/infras/errors/bad-action'

const KEY_LENGTH = 64
const SALT_BYTES = 16

/**
 * Hash mật khẩu bằng scrypt (node:crypto) — kết quả dạng `scrypt$<salt hex>$<hash hex>`.
 * Boundary node:crypto: lỗi scrypt convert thành BadAction ngay tại chỗ.
 */
export const hashPassword = (plain: string): Promise<string | BadAction> => {
  const salt = randomBytes(SALT_BYTES).toString('hex')

  return new Promise((resolve) => {
    scrypt(plain, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        resolve(BadAction.fromUnknownError({ cause: error.message }))
        return
      }

      resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`)
    })
  })
}
