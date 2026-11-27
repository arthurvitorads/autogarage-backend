import { ApiError } from '../interfaces/error.js'

function maskPersonPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits

  const number = digits.slice(2)
  const prefixLength = digits.length === 11 ? 5 : 4
  const suffix = number.slice(prefixLength)
  return `(${digits.slice(0, 2)}) ${number.slice(0, prefixLength)}${suffix ? '-' + suffix : ''}`
}

export class DocumentoService {
  static async consultarCnpj(cnpj: string) {
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
      throw Object.assign(new ApiError(502, 'O serviço de consulta de CNPJ está indisponível.'), {
        providerStatus: response.status,
      })
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

    const phone = [data.ddd_telefone_1, data.ddd_telefone_2].find(
      (value): value is string => typeof value === 'string' && !!value.trim(),
    )

    let logradouro = typeof data.logradouro === 'string' ? data.logradouro.trim() : ''
    const streetType =
      typeof data.descricao_tipo_de_logradouro === 'string'
        ? data.descricao_tipo_de_logradouro.trim()
        : ''

    if (logradouro && streetType) {
      const street = logradouro.toUpperCase()
      const type = streetType.toUpperCase()
      if (street !== type && !street.startsWith(type + ' '))
        logradouro = streetType + ' ' + logradouro
    }

    return {
      ca_cnpj: cnpj,
      an_razao_social: data.razao_social.trim(),
      an_nome_fantasia: typeof data.nome_fantasia === 'string' ? data.nome_fantasia.trim() : '',
      an_email: typeof data.email === 'string' ? data.email.trim() : '',
      an_telefone: phone ? maskPersonPhone(phone) : null,
      ca_cep: data.cep ?? '',
      an_logradouro: logradouro,
      an_numero: data.numero ?? '',
      an_complemento: data.complemento ?? '',
      an_bairro: data.bairro ?? '',
      an_cidade: data.municipio ?? '',
      ca_uf: data.uf ?? '',
    }
  }
}
