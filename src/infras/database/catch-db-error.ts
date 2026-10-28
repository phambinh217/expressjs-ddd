import { BadAction } from '@/infras/errors/bad-action'

/**
 * Boundary Sequelize — bọc promise có thể throw (query, `entity.save()`, `entity.destroy()`)
 * thành `T | BadAction`. Repository và Action dùng chung, không try/catch riêng.
 */
export const catchDbError = <T>(promise: Promise<T>): Promise<T | BadAction> => {
  return promise.catch((error: unknown) => {
    return BadAction.fromUnknownError({
      cause: error instanceof Error ? error.message : String(error),
    })
  })
}
