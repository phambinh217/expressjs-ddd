import { DataTypes } from 'sequelize'
import { sequelize } from '@/infras/database/sequelize'
import { Post } from '@/domains/post/entities/post'

/**
 * Ánh xạ entity Post ↔ bảng `posts` — chỉ khai `type` (+ khóa chính), không ràng buộc.
 */
export const initPostModel = (): void => {
  Post.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING(255),
      },
      content: {
        type: DataTypes.TEXT,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'posts',
      modelName: 'Post',
    },
  )
}
