import 'fastify'
import type { DecodedIdToken } from 'firebase-admin/auth'
import type { UsuarioModel } from '../models/usuario.model.js'

declare module 'fastify' {
  interface FastifyRequest {
    firebaseUser?: DecodedIdToken
    session?: ReturnType<typeof UsuarioModel.toSession>
  }
}
