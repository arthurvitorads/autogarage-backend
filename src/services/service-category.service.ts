import type { ServiceCategoryRepository } from '../repositories/service-category.repository.js'
import type { IManutCategoriaServico } from '../interfaces/service-category.js'

export class ServiceCategoryService {
  constructor(
    private readonly repository: Pick<ServiceCategoryRepository, 'list' | 'create' | 'update'>,
  ) {}

  list() {
    return this.repository.list()
  }

  create(values: IManutCategoriaServico) {
    return this.repository.create(values)
  }

  update(id: number, values: IManutCategoriaServico) {
    return this.repository.update(id, values)
  }
}
