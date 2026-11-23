import { ApiResponse } from '../http/api-response.js'
import type { ProductRepository } from '../repositories/product.repository.js'
import type { IManutProduto } from '../interfaces/product.js'
import { ProductModel } from '../models/product.model.js'

export class ProductService {
  constructor(
    private readonly repository: Pick<
      ProductRepository,
      'products' | 'createProduct' | 'updateProduct'
    >,
  ) {}

  async list(page: number, limit: number, search: string) {
    const { produtos, total } = await this.repository.products(page, limit, search)

    return ApiResponse.page({
      dados: produtos.map(ProductModel.toResponse),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }

  async create(values: IManutProduto) {
    return ProductModel.toResponse(await this.repository.createProduct(values))
  }

  async update(id: number, values: IManutProduto) {
    return ProductModel.toResponse(await this.repository.updateProduct(id, values))
  }
}
