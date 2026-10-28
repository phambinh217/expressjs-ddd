import { ValidationError } from '@vinejs/vine'
import { BadAction } from '@/infras/errors/bad-action'
import { catchDbError } from '@/infras/database/catch-db-error'
import { hashPassword } from '@/infras/hashing/password-hash'
import { UserUpdateData } from '@/domains/user/data/user-update-data'
import { User } from '@/domains/user/entities/user'
import { userRepository } from '@/domains/user/repositories/user-repository'

/**
 * Action cập nhật user — chỉ ghi field có gửi (`undefined` = giữ nguyên).
 */
export class UserUpdate {
  constructor(
    private readonly user: User,
    private readonly data: UserUpdateData,
  ) {}

  static make = (user: User, data: UserUpdateData): UserUpdate => {
    return new UserUpdate(user, data)
  }

  execute = async (): Promise<User | BadAction> => {
    const input = await this.validate()

    if (BadAction.isError(input)) {
      return input
    }

    /**
     * Chỉ kiểm tra trùng khi đổi sang email khác — email hiện tại của chính user không tính.
     */
    if (input.email && input.email !== this.user.getEmail()) {
      const emailExists = await userRepository.existsWhere({ email: input.email })

      if (BadAction.isError(emailExists)) {
        return emailExists
      }

      if (emailExists) {
        return BadAction.fromString('Email already exists', { field: 'email' }, 422)
      }
    }

    if (input.password !== undefined) {
      const hashedPassword = await hashPassword(input.password)

      if (BadAction.isError(hashedPassword)) {
        return hashedPassword
      }

      this.user.setPassword(hashedPassword)
    }

    if (input.name !== undefined) {
      this.user.setName(input.name)
    }

    if (input.email !== undefined) {
      this.user.setEmail(input.email)
    }

    return catchDbError(this.user.save())
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
