import { ApiError } from '../interfaces/error.js'

export class PaginationValidator {
  static parse(query: unknown) {
    const data = (query ?? {}) as Record<string, unknown>
    const page = Number(data.page ?? 1)
    const limit = Number(data.limit ?? 10)

    if (!Number.isSafeInteger(page) || !Number.isSafeInteger(limit) || page < 1 || limit < 1 || limit > 100) {
      throw new ApiError(400, 'Paginação inválida.')
    }

    if (!Number.isSafeInteger((page - 1) * limit)) 
      throw new ApiError(400, 'Página inválida.')

    if (data.search !== undefined && typeof data.search !== 'string') 
      throw new ApiError(400, 'Pesquisa inválida.')

    return { 
      page, 
      limit, 
      search: (data.search as string | undefined)?.trim() ?? '' 
    }
  }
}
