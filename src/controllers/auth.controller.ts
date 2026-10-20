import type { FastifyRequest } from 'fastify'

import type { AuthService } from '../services/auth.service.js'

export class AuthController {
  constructor(private readonly service: AuthService) {}

  me = (request: FastifyRequest) =>{
    this.service.me(request.firebaseUser?.uid)
  } 
}
