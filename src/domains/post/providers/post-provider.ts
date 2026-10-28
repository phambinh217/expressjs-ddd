import { initPostModel } from '@/domains/post/models/post-model'

/**
 * Boot domain post — khởi tạo model.
 */
export const bootPostProvider = (): void => {
  initPostModel()
}
