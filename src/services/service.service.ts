import { ApiResponse } from '../http/api-response.js'
import type { ServiceRepository } from '../repositories/service.repository.js'
import type { IManutServico } from '../interfaces/service.js'
import { ServiceModel } from '../models/service.model.js'

export class ServiceService {
  constructor(
    private readonly repository: Pick<
      ServiceRepository,
      'services' | 'createService' | 'updateService'
    >,
  ) {}

  async list(page: number, limit: number, search: string) {
    const { servicos, total } = await this.repository.services(page, limit, search)

    return ApiResponse.page({
      dados: servicos.map(ServiceModel.toResponse),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }

  async create(values: IManutServico) {
    return ServiceModel.toResponse(await this.repository.createService(values))
  }

  async update(id: number, values: IManutServico) {
    return ServiceModel.toResponse(await this.repository.updateService(id, values))
  }
}
