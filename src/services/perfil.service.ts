import { ApiError } from '../interfaces/error.js'

import { PerfilModel } from '../models/perfil.model.js'

import type { IManutPerfil } from '../interfaces/perfil.js'
import type { IPerfilRepository } from '../repositories/perfil.repository.js'

export class PerfilService {
  constructor(
    private readonly perfil: IPerfilRepository,
  ) {}

  async list(page: number, limit: number, search: string) {
    const { perfil, total } = await this.perfil.list(page, limit, search)
    
    return {
      perfil: perfil.map(PerfilModel.toResponse),
      pagination: {
        page, limit, total, totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total, hasPreviousPage: page > 1,
      },
    }
  }

  async paramList() {
    const perfil = await this.perfil.paramList()

    return {
      perfil: perfil.map(PerfilModel.toParamResponse),
    }
  }

  async create(values: IManutPerfil) {
    try {

      return PerfilModel.toResponse(await this.perfil.create(values))
    } catch (error) {
      throw error
    }
  }

  async update(id: bigint, values: IManutPerfil) {
    const perfil = await this.perfil.findById(id)

    if (!perfil) 
      throw new ApiError(404, 'Perfil não encontrado.')

    try {

      return PerfilModel.toResponse(await this.perfil.update(id, values))

    } catch (error) {
      throw error
    }
  }
}
