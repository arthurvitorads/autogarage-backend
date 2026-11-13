import { ApiError } from '../interfaces/error.js'

export class DocumentoService {
  static async fetchCnpj(cnpj: string) {
    let response: Response
    try {
      response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
        headers: { 'User-Agent': 'AutoGarage/1.0', Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError')
        throw new ApiError(504, 'A consulta do CNPJ demorou para responder.')

      throw new ApiError(502, 'Não foi possível conectar ao serviço de consulta de CNPJ.')
    }

    if (response.status === 404) return null
    if (response.status === 400)
      throw new ApiError(400, 'O serviço de consulta não aceitou este CNPJ.')
    if (response.status === 429) throw new ApiError(429, 'Limite de consultas de CNPJ excedido.')
    if (!response.ok) {
      throw Object.assign(
        new ApiError(502, 'O serviço de consulta de CNPJ está indisponível.'),
        { providerStatus: response.status },
      )
    }

    const data = await response.json().catch(() => null)
    if (
      !data ||
      typeof data.cnpj !== 'string' ||
      data.cnpj.replace(/[^a-z\d]/gi, '').toUpperCase() !== cnpj ||
      typeof data.razao_social !== 'string' ||
      !data.razao_social.trim()
    )
      throw new ApiError(502, 'O serviço retornou dados inválidos para este CNPJ.')

    return data
  }
}
