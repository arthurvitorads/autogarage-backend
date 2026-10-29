import type { CadProduto, CadServico } from '@prisma/client'

export class CatalogModel {
  static product(produto: CadProduto) {
    return {
      ...produto,
      vl_custo: Number(produto.vl_custo),
      vl_venda: Number(produto.vl_venda),
      qt_estoque: Number(produto.qt_estoque),
      qt_estoque_min: Number(produto.qt_estoque_min)
    }
  }

  static service(servico: CadServico) {
    const { nu_tempo_estimado, ...dados } = servico

    return {
      ...dados,
      vl_preco: Number(servico.vl_preco),
      ...(nu_tempo_estimado === null ? {} : { nu_tempo_estimado })
    }
  }
}
