import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { ApiResponse } from './api-response.js';

type ApiHandler = (request: FastifyRequest) => unknown | Promise<unknown>;

export class ApiRouter {
  constructor(private readonly app: FastifyInstance, private readonly auth: AuthMiddleware) {}
  get(path: string, handler: ApiHandler) { this.register('GET', path, handler, 200); }
  post(path: string, handler: ApiHandler, status: 200 | 201 = 201) { this.register('POST', path, handler, status); }

  private register(method: 'GET' | 'POST', url: string, handler: ApiHandler, status: 200 | 201) {
    this.app.route({
      method, url, preHandler: this.auth.handle,
      handler: async (request, reply) => ApiResponse.success(reply, await handler(request), status),
    });
  }
}
