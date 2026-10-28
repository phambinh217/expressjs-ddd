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
