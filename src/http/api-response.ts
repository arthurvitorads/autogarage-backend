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
    const databaseCode = (error as {
      code?: string
    } | null)?.code
    if (databaseCode === 'P2002')
      return reply.code(409).send({
        sucesso: false,
        code: 409,
        erro: 'Registro duplicado. Confira documento, referência ou descrição.'
      })
    if (databaseCode === 'P2003')
      return reply.code(400).send({
        sucesso: false,
        code: 400,
        erro: 'Registro relacionado inválido ou em uso.'
      })
    if (databaseCode === 'P2025')
      return reply.code(404).send({
        sucesso: false,
        code: 404,
        erro: 'Registro não encontrado.'
      })
    if (databaseCode === 'P2034')
      return reply.code(409).send({
        sucesso: false,
        code: 409,
        erro: 'Os dados foram alterados por outra operação. Atualize e tente novamente.'
      })
    const frameworkStatus = (error as {
      statusCode?: number
    } | null)?.statusCode
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

    return reply.code(status).send({
      sucesso: false,
      code: status,
      erro: message
    })
  }
}
