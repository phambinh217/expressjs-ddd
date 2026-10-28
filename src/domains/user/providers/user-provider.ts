import type { Command } from 'commander'
import { createUserListCommand } from '@/domains/user/console/commands/user-list-command'
import { associateUserModel, initUserModel } from '@/domains/user/models/user-model'

/**
 * Boot domain user — chạy ở mọi entry (server + CLI) trước khi dùng entity: khởi tạo model.
 */
export const bootUserProvider = (): void => {
  initUserModel()
}

/**
 * Khai quan hệ của domain user — chạy sau khi boot mọi provider (cần Post đã init).
 */
export const associateUserProvider = (): void => {
  associateUserModel()
}

/**
 * Đăng ký CLI command của domain user vào program — chỉ entry CLI gọi.
 */
export const registerUserCommands = (program: Command): void => {
  program.addCommand(createUserListCommand())
}
