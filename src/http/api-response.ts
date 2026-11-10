import { ApiError } from '../interfaces/error.js'
import type { IApiErrorResponse, IApiResponse, IPageResponse, IPagination } from '../interfaces/api-response.js'

import type { FastifyReply, FastifyRequest } from 'fastify'

class ApiPage<T> {
  constructor(readonly response: IPageResponse<T>) {}
}

export class ApiResponse {
  static success(data: unknown): IApiResponse<unknown> {
    if (data instanceof ApiPage) return data.response
    return { sucesso: true, dados: data }
  }

  static page<T>(data: Omit<IPageResponse<T>, 'sucesso'>): ApiPage<T> {
    return new ApiPage({ sucesso: true, ...data })
  }

  static pagination(page: number, limit: number, total: number): IPagination {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    }
  }

  static sendError(reply: FastifyReply, status: number, message: string) {
    const response: IApiErrorResponse = { sucesso: false, code: status, erro: message }
    return reply.code(status).send(response)
  }

  static error(error: unknown, request: FastifyRequest, reply: FastifyReply) {
    const databaseCode = (
      error as {
        code?: string
      } | null
    )?.code
    if (databaseCode === 'P2002')
      return ApiResponse.sendError(reply, 409, 'Registro duplicado. Confira documento, referência ou descrição.')
    if (databaseCode === 'P2003')
      return ApiResponse.sendError(reply, 400, 'Registro relacionado inválido ou em uso.')
    if (databaseCode === 'P2025')
      return ApiResponse.sendError(reply, 404, 'Registro não encontrado.')
    if (databaseCode === 'P2034')
      return ApiResponse.sendError(reply, 409, 'Os dados foram alterados por outra operação. Atualize e tente novamente.')
    const frameworkStatus = (
      error as {
        statusCode?: number
      } | null
    )?.statusCode
    const status =
      error instanceof ApiError
        ? error.statusCode
        : frameworkStatus && frameworkStatus >= 400 && frameworkStatus < 500
          ? frameworkStatus
          : 500

    if (status >= 500)
      request.log.error({ err: error }, `Erro no ${request.method} ${request.routeOptions.url}`)

    const message =
      error instanceof ApiError
        ? error.message
        : status === 500
          ? 'Erro inesperado na execução do processo.'
          : status === 429
            ? 'Limite de requisições excedido.'
            : //
              'Requisição inválida.'

    return ApiResponse.sendError(reply, status, message)
  }
}
