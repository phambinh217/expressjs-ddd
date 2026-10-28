import type { Request, Response } from 'express'
import { BadAction } from '@/infras/errors/bad-action'
import { UserCreate } from '@/domains/user/actions/user-create'
import { UserDelete } from '@/domains/user/actions/user-delete'
import { UserUpdate } from '@/domains/user/actions/user-update'
import { UserCreateData } from '@/domains/user/data/user-create-data'
import { UserUpdateData } from '@/domains/user/data/user-update-data'
import { Post } from '@/domains/post/entities/post'
import { User } from '@/domains/user/entities/user'
import { type UserQueryOptions, userRepository } from '@/domains/user/repositories/user-repository'

type PostResource = {
  id?: number
  title?: string
  content?: string
  createdAt?: Date
  updatedAt?: Date
}

type UserResource = {
  id?: number
  name?: string
  email?: string | null
  posts?: PostResource[]
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Controller user — index/show/store/update/destroy.
 * Đọc qua repository, ghi qua Action; request/response camelCase.
 */
export class UserController {
  index = async (req: Request, res: Response): Promise<void> => {
    const args: Partial<UserQueryOptions> = { ...req.query, with: ['posts'] }
    const result = await userRepository.paginate(args, req.query.perPage, req.query.page)

    if (BadAction.isError(result)) {
      return result.toResponse(res)
    }

    res.json({
      data: result.data.map(this.getResource),
      currentPage: result.currentPage,
      perPage: result.perPage,
      lastPage: result.lastPage,
      total: result.total,
    })
  }

  show = async (req: Request, res: Response): Promise<void> => {
    const user = await this.findUser(String(req.params.id))

    if (BadAction.isError(user)) {
      return user.toResponse(res)
    }

    res.json(this.getResource(user))
  }

  store = async (req: Request, res: Response): Promise<void> => {
    const user = await UserCreate.make(UserCreateData.make(req.body)).execute()

    if (BadAction.isError(user)) {
      return user.toResponse(res)
    }

    res.json(this.getResource(user))
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const user = await this.findUser(String(req.params.id))

    if (BadAction.isError(user)) {
      return user.toResponse(res)
    }

    const result = await UserUpdate.make(user, UserUpdateData.make(req.body)).execute()

    if (BadAction.isError(result)) {
      return result.toResponse(res)
    }

    res.json(this.getResource(user))
  }

  destroy = async (req: Request, res: Response): Promise<void> => {
    const user = await this.findUser(String(req.params.id))

    if (BadAction.isError(user)) {
      return user.toResponse(res)
    }

    const result = await UserDelete.make(user).execute()

    if (BadAction.isError(result)) {
      return result.toResponse(res)
    }

    res.json(true)
  }

  private findUser = async (id: string): Promise<User | BadAction> => {
    const user = await userRepository.find(Number(id), { with: ['posts'] })

    if (BadAction.isError(user)) {
      return user
    }

    if (!user) {
      return BadAction.fromString('User not found', {}, 404)
    }

    return user
  }

  /**
   * Shape JSON user trả về client — map tay, không `res.json(user)` để không lộ password.
   */
  private getResource = (user: User): UserResource => {
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      posts: user.getPosts()?.map(this.getPostResource),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    }
  }

  private getPostResource = (post: Post): PostResource => {
    return {
      id: post.getId(),
      title: post.getTitle(),
      content: post.getContent(),
      createdAt: post.getCreatedAt(),
      updatedAt: post.getUpdatedAt(),
    }
  }
}

export const userController = new UserController()
