import { ApiError } from '../interfaces/error.js'

import type { FastifyReply, FastifyRequest } from 'fastify'

export class ApiResponse {
  static success(
    reply: FastifyReply, 
    data: unknown, 
    status: 200 | 201 = 200
  ) {
    return reply.code(status).send({ sucesso: true, dados: data })
  }

  static error(
    error: unknown, 
    request: FastifyRequest, 
    reply: FastifyReply
  ) {
    
    const frameworkStatus = (error as { statusCode?: number } | null)?.statusCode
    
    const status = error instanceof ApiError ? error.statusCode 
    : frameworkStatus && frameworkStatus >= 400 && frameworkStatus < 500 ? frameworkStatus 
    : 500
    
    if (status >= 500) 
      request.log.error({ err: error }, `Erro no ${request.method} ${request.routeOptions.url}`)

    const message = error instanceof ApiError ? error.message
      : status === 500 ? 'Erro inesperado na execução do processo.'
      : status === 429 ? 'Limite de requisições excedido.' 
      //
      : 'Requisição inválida.'
    
      return reply.code(status).send({ sucesso: false, code: status, erro: message })
  }
}
