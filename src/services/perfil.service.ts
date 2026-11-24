import { ApiResponse } from '../http/api-response.js'
import { ApiError } from '../interfaces/error.js'

import { PerfilModel } from '../models/perfil.model.js'

import type { IManutPerfil } from '../interfaces/perfil.js'
import type { IPerfilRepository } from '../repositories/perfil.repository.js'
import { moduleAccess, type TModuleAccess } from '../interfaces/access.js'

export class PerfilService {
  constructor(private readonly perfil: IPerfilRepository) {}

  async consultarAcessos(id: bigint) {
    const profile = await this.perfil.consultarAcessos(id)
    if (!profile) throw new ApiError(404, 'Perfil não encontrado.')
    return moduleAccess(profile.acessos)
  }

  async manutAcessos(id: bigint, levels: TModuleAccess) {
    if (!(await this.perfil.detalhar(id))) throw new ApiError(404, 'Perfil não encontrado.')
    return moduleAccess(await this.perfil.manutAcessos(id, levels))
  }

  async view(page: number, limit: number, search: string) {
    const { perfil, total } = await this.perfil.view(page, limit, search)

    return ApiResponse.page({
      dados: perfil.map(PerfilModel.paraResposta),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }

  async domain() {
    const perfil = await this.perfil.domain()

    return perfil.map(PerfilModel.paraParam)
  }

  async manutInc(values: IManutPerfil) {
    try {
      return PerfilModel.paraResposta(await this.perfil.manutInc(values))
    } catch (error) {
      throw error
    }
  }

  async manutAlt(id: bigint, values: IManutPerfil) {
    const perfil = await this.perfil.detalhar(id)

    if (!perfil) throw new ApiError(404, 'Perfil não encontrado.')

    try {
      return PerfilModel.paraResposta(await this.perfil.manutAlt(id, values))
    } catch (error) {
      throw error
    }
  }
}
