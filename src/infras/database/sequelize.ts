import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Instance Sequelize (Postgres) dùng chung toàn app — hạ tầng persistence, không gắn domain cụ thể.
 */
export const sequelize = new Sequelize(
  process.env.DB_NAME || 'expressjs_ddd',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    /**
     * Tên cột trong DB là camelCase (`userId`, `createdAt`) — không `underscored`.
     */
    define: {
      timestamps: true,
    },
  },
)
