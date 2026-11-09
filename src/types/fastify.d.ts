import 'fastify'
import type { DecodedIdToken } from 'firebase-admin/auth'
import type { UserModel } from '../models/user.model.js'

declare module 'fastify' {
  interface FastifyRequest {
    firebaseUser?: DecodedIdToken
    session?: ReturnType<typeof UserModel.toSession>
  }
}
