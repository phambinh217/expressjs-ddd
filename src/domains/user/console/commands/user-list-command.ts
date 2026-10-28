import { Command } from 'commander'
import { BadAction } from '@/infras/errors/bad-action'
import { EXIT_FAILURE, EXIT_SUCCESS } from '@/infras/console/exit-code'
import { bootstrapDatabase } from '@/infras/console/bootstrap-database'
import { userRepository } from '@/domains/user/repositories/user-repository'

/**
 * CLI `user:list` — liệt kê user (không lộ password).
 * Command mỏng: chỉ đọc qua Repository, không ghi DB trực tiếp.
 */
export const createUserListCommand = (): Command => {
  const command = new Command('user:list')

  command.description('List all users').action(async () => {
    await bootstrapDatabase()

    const users = await userRepository.getWhere()

    if (BadAction.isError(users)) {
      console.error(users.message)
      process.exitCode = EXIT_FAILURE
      return
    }

    if (users.length === 0) {
      console.log('No users found.')
      process.exitCode = EXIT_SUCCESS
      return
    }

    console.table(
      users.map((user) => {
        return {
          id: user.getId(),
          name: user.getName(),
          email: user.getEmail(),
        }
      }),
    )

    process.exitCode = EXIT_SUCCESS
  })

  return command
}
