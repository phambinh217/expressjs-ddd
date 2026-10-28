import { Attributes, FindOptions, Model, ModelStatic, Op, Order, WhereOptions } from 'sequelize'
import { BadAction } from '@/infras/errors/bad-action'
import { catchDbError } from '@/infras/database/catch-db-error'

export type Paginator<TModel> = {
  data: TModel[]
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

/**
 * Repository Postgres nền. Entity chính là Sequelize model (Active Record); repository chỉ lo
 * đọc — repository con khai báo `model` và `query` (lọc theo options), method đọc dùng chung dựng
 * trên đó. Ghi do Action gọi `catchDbError(entity.save())`.
 */
export abstract class PostgresRepository<
  TModel extends Model,
  TOptions extends object = Record<string, never>,
> {
  protected abstract readonly model: ModelStatic<TModel>

  /**
   * Dựng FindOptions (`where`, `include`, `order`…) từ options lọc — mọi method đọc dựng trên đây.
   */
  protected abstract query: (options: Partial<TOptions>) => FindOptions<Attributes<TModel>>

  /**
   * `options` để nạp kèm quan hệ / lọc thêm (vd. `{ with: ['posts'] }`), mặc định chỉ theo id.
   */
  find = (id: number, options: Partial<TOptions> = {}): Promise<TModel | null | BadAction> => {
    return catchDbError(
      this.model.findOne(this.withWhere(this.query(options), this.wherePrimaryKey(id))),
    )
  }

  findWhere = (options: Partial<TOptions> = {}): Promise<TModel | null | BadAction> => {
    return catchDbError(this.model.findOne(this.query(options)))
  }

  getWhere = (
    options: Partial<TOptions> = {},
    limit?: number,
    offset?: number,
  ): Promise<TModel[] | BadAction> => {
    return catchDbError(this.model.findAll({ ...this.query(options), limit, offset }))
  }

  countWhere = (options: Partial<TOptions> = {}): Promise<number | BadAction> => {
    const { where, include } = this.query(options)

    return catchDbError(this.model.count({ where, include, distinct: true }))
  }

  existsWhere = async (options: Partial<TOptions> = {}): Promise<boolean | BadAction> => {
    const findOptions = { ...this.query(options), attributes: [this.model.primaryKeyAttribute] }
    const model = await catchDbError(this.model.findOne(findOptions))

    if (BadAction.isError(model)) {
      return model
    }

    return model !== null
  }

  sumWhere = (
    column: keyof Attributes<TModel> & string,
    options: Partial<TOptions> = {},
  ): Promise<number | BadAction> => {
    const { where } = this.query(options)

    return catchDbError(this.model.sum(column, { where }))
  }

  maxWhere = <T>(
    column: keyof Attributes<TModel> & string,
    options: Partial<TOptions> = {},
  ): Promise<T | BadAction> => {
    const { where } = this.query(options)

    return catchDbError(this.model.max<T, TModel>(column, { where }))
  }

  minWhere = <T>(
    column: keyof Attributes<TModel> & string,
    options: Partial<TOptions> = {},
  ): Promise<T | BadAction> => {
    const { where } = this.query(options)

    return catchDbError(this.model.min<T, TModel>(column, { where }))
  }

  /**
   * `perPage` / `page` nhận thẳng giá trị từ query string (`req.query.perPage`) — không phải số
   * hợp lệ thì về mặc định 15 / 1.
   */
  paginate = async (
    options: Partial<TOptions> = {},
    perPage?: unknown,
    page?: unknown,
  ): Promise<Paginator<TModel> | BadAction> => {
    const limit = Number(perPage) || 15
    const currentPage = Number(page) || 1
    const findOptions = {
      ...this.query(options),
      limit,
      offset: (currentPage - 1) * limit,
      distinct: true,
    }

    const result = await catchDbError(this.model.findAndCountAll(findOptions))

    if (BadAction.isError(result)) {
      return result
    }

    return {
      data: result.rows,
      total: result.count,
      perPage: limit,
      currentPage,
      lastPage: Math.max(1, Math.ceil(result.count / limit)),
    }
  }

  /**
   * Duyệt theo từng lô `size` bản ghi; callback trả `false` để dừng sớm.
   * Không có order thì sắp theo khóa chính để các lô không trùng/sót.
   */
  chunk = async (
    options: Partial<TOptions>,
    size: number,
    callback: (models: TModel[]) => Promise<void | false> | void | false,
  ): Promise<void | BadAction> => {
    const findOptions = this.query(options)
    const order: Order = findOptions.order ?? [[this.model.primaryKeyAttribute, 'ASC']]
    let offset = 0

    while (true) {
      const models = await catchDbError(
        this.model.findAll({ ...findOptions, order, limit: size, offset }),
      )

      if (BadAction.isError(models)) {
        return models
      }

      if (models.length === 0) {
        return
      }

      const result = await callback(models)

      if (result === false || models.length < size) {
        return
      }

      offset += size
    }
  }

  private wherePrimaryKey = (id: number): WhereOptions<Attributes<TModel>> => {
    return { [this.model.primaryKeyAttribute]: id } as WhereOptions<Attributes<TModel>>
  }

  private withWhere = (
    findOptions: FindOptions<Attributes<TModel>>,
    where: WhereOptions<Attributes<TModel>>,
  ): FindOptions<Attributes<TModel>> => {
    if (!findOptions.where) {
      return { ...findOptions, where }
    }

    return { ...findOptions, where: { [Op.and]: [findOptions.where, where] } }
  }
}
