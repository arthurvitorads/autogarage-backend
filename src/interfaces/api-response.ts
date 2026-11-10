export interface IApiResponse<T> {
  sucesso: true
  dados: T
}

export interface IApiErrorResponse {
  sucesso: false
  code: number
  erro: string
}

export interface IPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface IPageResponse<T> extends IApiResponse<T[]> {
  pagination: IPagination
  resumo?: object
}
