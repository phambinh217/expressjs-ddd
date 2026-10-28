import { FindOptions, InferAttributes, WhereOptions } from 'sequelize'
import { PostgresRepository } from '@/infras/database/postgres-repository'
import { User } from '@/domains/user/entities/user'

export type UserQueryOptions = {
  email: string
  /**
   * Quan hệ nạp kèm (eager loading).
   */
  with: 'posts'[]
}

/**
 * Repository User — chỉ khai báo điều kiện lọc, method đọc dùng chung ở PostgresRepository.
 */
export class UserRepository extends PostgresRepository<User, UserQueryOptions> {
  protected readonly model = User

  protected query = (options: Partial<UserQueryOptions>): FindOptions<InferAttributes<User>> => {
    const where: WhereOptions<InferAttributes<User>> = {}

    if (options.email !== undefined) {
      where.email = options.email
    }

    /**
     * `separate` — nạp posts bằng 1 query riêng `WHERE "userId" IN (...)`; không JOIN nên phân
     * trang user không bị nhân dòng.
     */
    const include = options.with?.includes('posts')
      ? [{ association: 'posts', separate: true }]
      : []

    return { where, include }
  }
}

export const userRepository = new UserRepository()
