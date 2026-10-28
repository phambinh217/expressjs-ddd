import { InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize'
import type { Post } from '@/domains/post/entities/post'

/**
 * Entity User — Sequelize model (Active Record).
 * File này chỉ khai cột (`declare`) + getter/setter; ánh xạ bảng (`User.init`) ở
 * models/user-model.ts, chạy lúc boot provider. Không ràng buộc: mọi cột optional — ràng buộc
 * đặt ở Data (Vine) và Action.
 * Truy cập cột qua getX/setX, không đọc/gán property trực tiếp.
 * Đọc qua repository, ghi chỉ trong Action (`catchDbError(user.save())`).
 * Luật: docs/coding-conventions/domain-driven-design-pattern/entity-pattern.md
 */
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id?: number
  declare name?: string
  declare email?: string | null
  declare password?: string
  declare createdAt?: Date
  declare updatedAt?: Date

  /**
   * Quan hệ — chỉ có giá trị khi query với `with: ['posts']`, không thì `undefined`.
   */
  declare posts?: NonAttribute<Post[]>

  getId = (): number | undefined => {
    return this.id
  }

  setId = (value: number): void => {
    this.id = value
  }

  getName = (): string | undefined => {
    return this.name
  }

  setName = (value: string): void => {
    this.name = value
  }

  getEmail = (): string | null | undefined => {
    return this.email
  }

  setEmail = (value: string | null): void => {
    this.email = value
  }

  getPassword = (): string | undefined => {
    return this.password
  }

  setPassword = (value: string): void => {
    this.password = value
  }

  getCreatedAt = (): Date | undefined => {
    return this.createdAt
  }

  setCreatedAt = (value: Date): void => {
    this.createdAt = value
  }

  getUpdatedAt = (): Date | undefined => {
    return this.updatedAt
  }

  setUpdatedAt = (value: Date): void => {
    this.updatedAt = value
  }

  getPosts = (): Post[] | undefined => {
    return this.posts
  }
}
