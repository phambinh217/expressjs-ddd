import { sequelize } from '@/infras/database/sequelize'

/**
 * Kết nối DB trước khi chạy command cần persistence.
 * Import side-effect đăng ký entity Sequelize trước sync/query.
 */
export const bootstrapDatabase = async (): Promise<void> => {
  await sequelize.authenticate()
}
