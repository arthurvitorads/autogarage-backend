import type { ApiRouter } from '../http/api-router.js'

import type { AuthController } from '../controllers/auth.controller.js'

export class AuthRoutes {
  constructor(private readonly controller: AuthController) {}

  register(router: ApiRouter) { 
    router.get('/auth/me', this.controller.me) 
  }
}
