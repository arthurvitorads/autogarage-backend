import { ApiError } from '../interfaces/error.js'

export class CepService {
  static async fetchCep(cep: string) {
    let response: Response
    try {
      response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: AbortSignal.timeout(10_000),
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError')
        throw new ApiError(504, 'A consulta do CEP demorou para responder.')

      throw new ApiError(502, 'Não foi possível conectar ao serviço de consulta de CEP.')
    }

    if (response.status === 404) throw new ApiError(404, 'CEP não encontrado ou incorreto.')
    if (response.status === 429) throw new ApiError(429, 'Limite de consultas de CEP excedido.')
    if (!response.ok) throw new ApiError(502, 'Não foi possível consultar o CEP.')

    const data = await response.json().catch(() => null)
    if (data?.erro === true || data?.erro === 'true')
      throw new ApiError(404, 'CEP não encontrado ou incorreto.')
    if (
      !data ||
      typeof data.cep !== 'string' ||
      data.cep.replace(/\D/g, '') !== cep ||
      typeof data.logradouro !== 'string' ||
      typeof data.bairro !== 'string' ||
      typeof data.localidade !== 'string' ||
      typeof data.uf !== 'string'
    )
      throw new ApiError(502, 'O serviço retornou dados inválidos para este CEP.')

    return data
  }
}
