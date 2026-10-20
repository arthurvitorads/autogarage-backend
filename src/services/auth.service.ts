import { ApiError } from '../interfaces/error.js'
import { UserModel } from '../models/user.model.js'
import type { IUserRepository } from '../repositories/user.repository.js'
import type { IFirebaseService } from './firebase.service.js'

export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly firebase: IFirebaseService,
  ) {}

  async authenticate(authorization: string | undefined) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Token de autenticação não informado.')
    }

    const token = authorization.slice('Bearer '.length).trim()

    if (!token) throw new ApiError(401, 'Token de autenticação inválido.')
      
    try {
      return await this.firebase.verifyToken(token)
    } catch {
      throw new ApiError(401, 'Token inválido, expirado ou revogado.')
    }
  }

  async me(uid: string | undefined) {
    if (!uid) 
      throw new ApiError(401, 'Usuário não autenticado.')

    const user = await this.users.findByFirebaseId(uid)

    if (!user) 
      throw new ApiError(404, 'Usuário não encontrado na base de dados.')
    
    return UserModel.toSession(user)
  }
}
