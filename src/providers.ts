import { bootPostProvider } from '@/domains/post/providers/post-provider'
import { associateUserProvider, bootUserProvider } from '@/domains/user/providers/user-provider'

/**
 * Danh sách provider của app — server và CLI dùng chung. Init model mọi domain trước, rồi mới khai quan hệ (association cần cả 2 model đã init).
 */
export const bootProviders = (): void => {
  bootUserProvider()
  bootPostProvider()

  associateUserProvider()
}
