import type { FastifyRequest } from 'fastify'

import type { AuthService } from '../services/auth.service.js'
import type { TAccessRule } from '../interfaces/access.js'
import { ApiError } from '../interfaces/error.js'

export class AuthMiddleware {
  constructor(private readonly service: AuthService) {}

  forAccess(rules: readonly TAccessRule[] | null) {
    return async (request: FastifyRequest) => {
      request.firebaseUser = await this.service.authenticate(request.headers.authorization)
      if (!rules) return
      const session = await this.service.me(request.firebaseUser.uid)
      if (!rules.some(([module, level]) => (session.acessos[module] ?? 3) <= level))
        throw new ApiError(403, 'Seu perfil não possui acesso a esta operação.')
      request.session = session
    }
  }
}
