import { ApiError } from '../interfaces/error.js'
import type { ICreateUser, IUpdateUser } from '../interfaces/user.js'
import { UserModel } from '../models/user.model.js'
import type { IUserRepository } from '../repositories/user.repository.js'
import type { IFirebaseService } from './firebase.service.js'

export interface IServiceLogger {
  error(context: { err: unknown; uid: string }, message: string): void
}

export class UserService {
  constructor(
    private readonly users: IUserRepository,
    private readonly firebase: IFirebaseService,
  ) {}

  async list(page: number, limit: number, search: string) {
    const { users, total } = await this.users.list(page, limit, search)
    
    return {
      usuarios: users.map(UserModel.toResponse),
      pagination: {
        page, limit, total, totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total, hasPreviousPage: page > 1,
      },
    }
  }

  async create(values: ICreateUser, logger: IServiceLogger) {
    if (await this.users.findByEmail(values.an_email)) {
      throw new ApiError(409, 'E-mail já cadastrado.')
    }

    let uid: string

    try {
      const user = await this.firebase.createUser({
        email: values.an_email, password: values.ca_senha,
        displayName: values.an_nome, disabled: !values.bo_sts_reg,
      })
      
      uid = user.uid
    } catch (error) {
      const code = (error as { code?: string }).code

      if (code === 'auth/email-already-exists') 
        throw new ApiError(409, 'E-mail já cadastrado.')

      if (code === 'auth/invalid-email') 
        throw new ApiError(400, 'Informe um e-mail válido.')

      if (code === 'auth/invalid-password' || code === 'auth/password-does-not-meet-requirements') {
        throw new ApiError(400, 'A senha não atende aos requisitos de segurança.')
      }
      
      throw error
    }
    try {

      return UserModel.toResponse(await this.users.create(values, uid))

    } catch (error) {
      try {

        await this.firebase.deleteUser(uid)
        
      } catch (cleanupError) {
        logger.error({ err: cleanupError, uid }, 'Falha ao remover usuário do Firebase após erro no banco.')
      }
      throw error
    }
  }

  async update(id: bigint, values: IUpdateUser, logger: IServiceLogger) {
    const existing = await this.users.findById(id)

    if (!existing) 
      throw new ApiError(404, 'Usuário não encontrado.')

    const uid = existing.ca_id_firebase
    const previous = await this.firebase.getUser(uid)
    
    await this.firebase.updateUser(uid, 
      { 
        displayName: values.an_nome, 
        disabled: !values.bo_sts_reg 
      }
    )

    try {

      return UserModel.toResponse(await this.users.update(id, values))

    } catch (error) {
      try {

        await this.firebase.updateUser(uid, 
          { 
            displayName: previous.displayName ?? null, 
            disabled: previous.disabled 
          })

      } catch (rollbackError) {
        logger.error({ err: rollbackError, uid }, 'Falha ao restaurar usuário no Firebase após erro no banco.')
      }
      throw error
    }
  }
}
