import type { BrandRepository } from '../repositories/brand.repository.js'
import type { IManutMarca } from '../interfaces/brand.js'

export class BrandService {
  constructor(private readonly repository: Pick<BrandRepository, 'list' | 'create' | 'update'>) {}

  list() {
    return this.repository.list()
  }

  create(values: IManutMarca) {
    return this.repository.create(values)
  }

  update(id: number, values: IManutMarca) {
    return this.repository.update(id, values)
  }
}
