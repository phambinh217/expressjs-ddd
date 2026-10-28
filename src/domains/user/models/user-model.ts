import { DataTypes } from 'sequelize'
import { sequelize } from '@/infras/database/sequelize'
import { Post } from '@/domains/post/entities/post'
import { User } from '@/domains/user/entities/user'

/**
 * Ánh xạ entity User ↔ bảng `users` — chỉ khai `type` (+ khóa chính), không ràng buộc.
 * Gọi 1 lần trong bootUserProvider, trước mọi lần dùng User.
 */
export const initUserModel = (): void => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
      },
      email: {
        type: DataTypes.STRING(150),
      },
      password: {
        type: DataTypes.STRING(255),
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'users',
      modelName: 'User',
    },
  )
}

/**
 * Quan hệ của User — chạy sau khi model mọi domain đã init (xem `bootProviders`).
 */
export const associateUserModel = (): void => {
  User.hasMany(Post, { foreignKey: 'userId', as: 'posts' })
}
