import dotenv from 'dotenv'
import { createApp } from './app'
import { sequelize } from '@/infras/database/sequelize'
import { bootProviders } from '@/providers'

dotenv.config()

/**
 * Boot provider từng domain (khởi tạo model) trước khi sync.
 */
bootProviders()

const PORT = Number(process.env.PORT) || 3000

/**
 * Khởi động server: kết nối DB → sync schema → listen.
 * Nhiều bước tuần tự nên dùng async/await.
 */
const bootstrap = async (): Promise<void> => {
  try {
    await sequelize.authenticate()
    console.log('Database connected successfully.')

    await sequelize.sync()
    console.log('Database synced.')

    const app = createApp()

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`)
    })
  } catch (error: unknown) {
    /**
     * Boundary khởi động — lỗi Sequelize/listen không có caller để trả BadAction,
     * log rồi thoát process.
     */
    const message = error instanceof Error ? error.message : String(error)
    console.error('Unable to start server:', message)
    process.exit(1)
  }
}

bootstrap()
