import { ApiResponse } from '../http/api-response.js'
import type { ICatalogRepository } from '../repositories/catalog.repository.js'
import type { IManutProduto, IManutServico, IManutCadastroAuxiliar } from '../interfaces/catalog.js'
import { CatalogModel } from '../models/catalog.model.js'

export class CatalogService {
  constructor(private readonly catalog: ICatalogRepository) {}

  async products(page: number, limit: number, search: string) {
    const { produtos, total } = await this.catalog.products(page, limit, search)

    return ApiResponse.page({
      dados: produtos.map(CatalogModel.product),
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }

  async services(page: number, limit: number, search: string) {
    const { servicos, total } = await this.catalog.services(page, limit, search)

    return ApiResponse.page({
      dados: servicos.map(CatalogModel.service),
      pagination: ApiResponse.pagination(page, limit, total),
    })
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

  auxiliaries() {
    return this.catalog.auxiliaries()
  }

  async itemOptions() {
    const [products, services] = await this.catalog.itemOptions()
    return {
      produtos: products.map(({ cn_produto, an_nome, ca_unidade, vl_venda }) => ({
        cn_referencia: cn_produto,
        an_nome,
        ca_unidade,
        vl_preco: Number(vl_venda),
      })),
      servicos: services.map(({ cn_servico, an_nome, vl_preco }) => ({
        cn_referencia: cn_servico,
        an_nome,
        ca_unidade: '',
        vl_preco: Number(vl_preco),
      })),
    }
  }

  createAuxiliary(values: IManutCadastroAuxiliar) {
    return this.catalog.createAuxiliary(values)
  }

  updateAuxiliary(id: number, values: IManutCadastroAuxiliar) {
    return this.catalog.updateAuxiliary(id, values)
  }
}
