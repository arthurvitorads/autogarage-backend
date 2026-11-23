import type { CadProduto } from '@prisma/client'

export class ProductModel {
  static toResponse(produto: CadProduto) {
    return {
      ...produto,
      vl_custo: Number(produto.vl_custo),
      vl_venda: Number(produto.vl_venda),
      qt_estoque: Number(produto.qt_estoque),
      qt_estoque_min: Number(produto.qt_estoque_min),
    }
  }
}
