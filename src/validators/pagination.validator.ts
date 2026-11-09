import { ApiError } from '../interfaces/error.js'
import { DataValidator } from './data.validator.js'

export class PaginationValidator {
  static parse(body: unknown) {
    const data = DataValidator.object(body === undefined ? {} : body)
    const { page: rawPage = 1, limit: rawLimit = 10 } = data
    if (
      (typeof rawPage !== 'number' && typeof rawPage !== 'string') ||
      (typeof rawLimit !== 'number' && typeof rawLimit !== 'string')
    ) {
      throw new ApiError(400, 'Paginação inválida.')
    }
    const page = Number(rawPage)
    const limit = Number(rawLimit)

    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      throw new ApiError(400, 'Paginação inválida.')
    }

    if (!Number.isSafeInteger((page - 1) * limit)) throw new ApiError(400, 'Página inválida.')

    if (data.search !== undefined && typeof data.search !== 'string')
      throw new ApiError(400, 'Pesquisa inválida.')

    return {
      page,
      limit,
      search: (data.search as string | undefined)?.trim() ?? '',
    }
  }
}
