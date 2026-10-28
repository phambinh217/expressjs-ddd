#!/usr/bin/env node
import dotenv from 'dotenv'
import { createProgram } from '@/infras/console/create-program'
import { EXIT_FAILURE } from '@/infras/console/exit-code'
import { bootProviders } from '@/providers'
import { registerUserCommands } from '@/domains/user/providers/user-provider'

dotenv.config()

/**
 * Entry CLI — boot provider từng domain rồi đăng ký command vào Commander.
 */
bootProviders()

const program = createProgram()

registerUserCommands(program)

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(EXIT_FAILURE)
})
