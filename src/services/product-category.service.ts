import type { ProductCategoryRepository } from '../repositories/product-category.repository.js'
import type { IManutCategoriaProduto } from '../interfaces/product-category.js'

export class ProductCategoryService {
  constructor(
    private readonly repository: Pick<ProductCategoryRepository, 'list' | 'create' | 'update'>,
  ) {}

  list() {
    return this.repository.list()
  }

  create(values: IManutCategoriaProduto) {
    return this.repository.create(values)
  }

  update(id: number, values: IManutCategoriaProduto) {
    return this.repository.update(id, values)
  }
}
