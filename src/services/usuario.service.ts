import { ApiResponse } from '../http/api-response.js'
import { ApiError } from '../interfaces/error.js'
import type { IManutUsuarioInc, IManutUsuarioAlt } from '../interfaces/usuario.js'
import { UsuarioModel } from '../models/usuario.model.js'
import type { IUsuarioRepository } from '../repositories/usuario.repository.js'
import type { IFirebaseService } from './firebase.service.js'

export interface IServiceLogger {
  error(context: { err: unknown; uid: string }, message: string): void
}

export class UsuarioService {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly firebase: IFirebaseService,
  ) {}

  async view(page: number, limit: number, search: string) {
    const { usuarios, total } = await this.usuarioRepository.view(page, limit, search)

    return ApiResponse.page({
      dados: usuarios.map(UsuarioModel.paraResposta),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }

  async manutInc(dados: IManutUsuarioInc, logger: IServiceLogger) {
    if (await this.usuarioRepository.buscarPorEmail(dados.an_email)) {
      throw new ApiError(409, 'E-mail já cadastrado.')
    }

    let uid: string

    try {
      const user = await this.firebase.createUser({
        email: dados.an_email,
        password: dados.ca_senha,
        displayName: dados.an_nome,
        disabled: !dados.bo_sts_reg,
      })

      uid = user.uid
    } catch (error) {
      const code = (error as { code?: string }).code

      if (code === 'auth/email-already-exists') throw new ApiError(409, 'E-mail já cadastrado.')

      if (code === 'auth/invalid-email') throw new ApiError(400, 'Informe um e-mail válido.')

      if (code === 'auth/invalid-password' || code === 'auth/password-does-not-meet-requirements') {
        throw new ApiError(400, 'A senha não atende aos requisitos de segurança.')
      }

      throw error
    }
    try {
      return UsuarioModel.paraResposta(await this.usuarioRepository.manutInc(dados, uid))
    } catch (error) {
      try {
        await this.firebase.deleteUser(uid)
      } catch (cleanupError) {
        logger.error(
          { err: cleanupError, uid },
          'Falha ao remover usuário do Firebase após erro no banco.',
        )
      }
      throw error
    }
  }

  async manutAlt(id: bigint, dados: IManutUsuarioAlt, logger: IServiceLogger) {
    const existing = await this.usuarioRepository.detalhar(id)

    if (!existing) throw new ApiError(404, 'Usuário não encontrado.')

    const uid = existing.ca_id_firebase
    const previous = await this.firebase.getUser(uid)

    await this.firebase.updateUser(uid, {
      displayName: dados.an_nome,
      disabled: !dados.bo_sts_reg,
    })

    try {
      return UsuarioModel.paraResposta(await this.usuarioRepository.manutAlt(id, dados))
    } catch (error) {
      try {
        await this.firebase.updateUser(uid, {
          displayName: previous.displayName ?? null,
          disabled: previous.disabled,
        })
      } catch (rollbackError) {
        logger.error(
          { err: rollbackError, uid },
          'Falha ao restaurar usuário no Firebase após erro no banco.',
        )
      }
      throw error
    }
  }
}
