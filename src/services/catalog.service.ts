import type { ICatalogRepository } from '../repositories/catalog.repository.js'

export class CatalogService {
  constructor(private readonly catalog: ICatalogRepository) {}

  async itemOptions() {
    const [products, services] = await this.catalog.itemOptions()
    return {
      produtos: products.map(({ cn_produto, an_nome, ca_unidade, vl_venda }) => ({
        cn_produto,
        an_nome,
        ca_unidade,
        vl_preco: Number(vl_venda),
      })),
      servicos: services.map(({ cn_servico, an_nome, vl_preco }) => ({
        cn_servico,
        an_nome,
        ca_unidade: '',
        vl_preco: Number(vl_preco),
      })),
    }
  }
}
