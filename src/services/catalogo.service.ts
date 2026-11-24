import type { ICatalogoRepository } from '../repositories/catalogo.repository.js'

export class CatalogoService {
  constructor(private readonly catalogoRepository: ICatalogoRepository) {}

  async param() {
    const [produtos, servicos] = await this.catalogoRepository.param()
    return {
      produtos: produtos.map(({ cn_produto, an_nome, ca_unidade, vl_venda }) => ({
        cn_produto,
        an_nome,
        ca_unidade,
        vl_preco: Number(vl_venda),
      })),
      servicos: servicos.map(({ cn_servico, an_nome, vl_preco }) => ({
        cn_servico,
        an_nome,
        ca_unidade: '',
        vl_preco: Number(vl_preco),
      })),
    }
  }
}
