import { InferAttributes, InferCreationAttributes, Model } from 'sequelize'

/**
 * Entity Post — Sequelize model (Active Record), cùng khuôn với entity User: chỉ `declare` cột
 * optional + getter/setter; ánh xạ bảng ở models/post-model.ts.
 * Luật: docs/coding-conventions/domain-driven-design-pattern/entity-pattern.md
 */
export class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  declare id?: number
  declare userId?: number
  declare title?: string
  declare content?: string
  declare createdAt?: Date
  declare updatedAt?: Date

  getId = (): number | undefined => {
    return this.id
  }

  setId = (value: number): void => {
    this.id = value
  }

  getUserId = (): number | undefined => {
    return this.userId
  }

  setUserId = (value: number): void => {
    this.userId = value
  }

  getTitle = (): string | undefined => {
    return this.title
  }

  setTitle = (value: string): void => {
    this.title = value
  }

  getContent = (): string | undefined => {
    return this.content
  }

  setContent = (value: string): void => {
    this.content = value
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
}
