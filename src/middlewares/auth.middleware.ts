import type { FastifyRequest } from 'fastify';
import type { AuthService } from '../services/auth.service.js';

export class AuthMiddleware {
  constructor(private readonly service: AuthService) {}
  handle = async (request: FastifyRequest): Promise<void> => {
    request.firebaseUser = await this.service.authenticate(request.headers.authorization);
  };
}
