import { ApiError } from '../interfaces/error.js'
import type { ICreateUser, IUpdateUser } from '../interfaces/user.js'
import { DataValidator } from './data.validator.js'

export class UserValidator {
  static id(id: unknown): bigint {
    if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id) || BigInt(id) > 9223372036854775807n) {
      throw new ApiError(400, 'Identificador do usuário inválido.')
    }

    return BigInt(id)
  }

  static update(body: unknown): IUpdateUser {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new ApiError(400, 'Dados do usuário inválidos.')
    }

    const data = body as Record<string, unknown>

    if (Object.keys(data).some(key => !['an_nome', 'bo_sts_reg', 'cn_perfil'].includes(key))) {
      throw new ApiError(400, 'Somente nome, perfil e status podem ser alterados.')
    }

    if (typeof data.an_nome !== 'string' || !data.an_nome.trim()) {
      throw new ApiError(400, 'Informe o nome.')
    }

    if (typeof data.bo_sts_reg !== 'boolean')
      throw new ApiError(400, 'Status inválido.')

    return {
      an_nome: DataValidator.text(data.an_nome, 'o nome'),
      bo_sts_reg: data.bo_sts_reg,
      ...(data.cn_perfil === undefined ? {} : {
        cn_perfil: data.cn_perfil === null || data.cn_perfil === '' ? null : DataValidator.id(data.cn_perfil),
      }),
    }
  }

  static create(body: unknown): ICreateUser {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new ApiError(400, 'Dados do usuário inválidos.')
    }
    const data = body as Record<string, unknown>
    if (typeof data.an_nome !== 'string' || !data.an_nome.trim()) {
      throw new ApiError(400, 'Informe o nome.')
    }
    if (typeof data.an_email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.an_email.trim())) {
      throw new ApiError(400, 'Informe um e-mail válido.')
    }
    if (typeof data.ca_senha !== 'string' || data.ca_senha.length < 6 || data.ca_senha.length > 128) {
      throw new ApiError(400, 'A senha deve conter entre 6 e 128 caracteres.')
    }
    if (data.bo_sts_reg !== undefined && typeof data.bo_sts_reg !== 'boolean') {
      throw new ApiError(400, 'Status inválido.')
    }

    return {
      an_nome: DataValidator.text(data.an_nome, 'o nome'),
      an_email: DataValidator.text(data.an_email, 'o e-mail').toLowerCase(),
      ca_senha: data.ca_senha,
      bo_sts_reg: data.bo_sts_reg ?? true,
      cn_perfil: data.cn_perfil == null || data.cn_perfil === '' ? null : DataValidator.id(data.cn_perfil),
    }
  }
}
