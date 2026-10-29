import type { ICatalogRepository } from '../repositories/catalog.repository.js'
import type { IManutProduto, IManutServico, IManutCadastroAuxiliar } from '../interfaces/catalog.js'
import { CatalogModel } from '../models/catalog.model.js'

export class CatalogService {
  constructor(private readonly catalog: ICatalogRepository) {}

  private pagination(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1
    }
  }

  async products(page: number, limit: number, search: string) {
    const { produtos, total } = await this.catalog.products(page, limit, search)

    return {
      produtos: produtos.map(CatalogModel.product),
      pagination: this.pagination(page, limit, total)
    }
  }

  async services(page: number, limit: number, search: string) {
    const { servicos, total } = await this.catalog.services(page, limit, search)

    return {
      servicos: servicos.map(CatalogModel.service),
      pagination: this.pagination(page, limit, total)
    }
  }

  async createProduct(values: IManutProduto) {
    return CatalogModel.product(await this.catalog.createProduct(values))
  }

  async updateProduct(id: number, values: IManutProduto) {
    return CatalogModel.product(await this.catalog.updateProduct(id, values))
  }

  async createService(values: IManutServico) {
    return CatalogModel.service(await this.catalog.createService(values))
  }

  async updateService(id: number, values: IManutServico) {
    return CatalogModel.service(await this.catalog.updateService(id, values))
  }

  async auxiliaries() {
    return { cadastros: await this.catalog.auxiliaries() }
  }

  createAuxiliary(values: IManutCadastroAuxiliar) {
    return this.catalog.createAuxiliary(values)
  }

  updateAuxiliary(id: number, values: IManutCadastroAuxiliar) {
    return this.catalog.updateAuxiliary(id, values)
  }
}
