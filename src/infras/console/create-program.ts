import { Command } from 'commander'

/**
 * Tạo Commander program gốc — tên/version CLI dùng chung.
 */
export const createProgram = (): Command => {
  const program = new Command()

  program.name('expressjs-ddd').description('expressjs-ddd CLI').version('1.0.0')

  return program
}
