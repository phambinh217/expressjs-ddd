import { BadAction } from '@/infras/errors/bad-action'
import { catchDbError } from '@/infras/database/catch-db-error'
import { User } from '@/domains/user/entities/user'

/**
 * Action xoá user — nhận instance đã resolve, không nhận id.
 */
export class UserDelete {
  constructor(private readonly user: User) {}

  static make = (user: User): UserDelete => {
    return new UserDelete(user)
  }

  execute = async (): Promise<true | BadAction> => {
    const result = await catchDbError(this.user.destroy())

    if (BadAction.isError(result)) {
      return result
    }

    return true
  }
}
