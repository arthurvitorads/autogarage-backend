import type { FatVenda, FatItemVenda } from '@prisma/client'

export class FaturamentoModel {
  static item(item: FatItemVenda) {
    return {
      ...item, cn_item_venda: item.cn_item_venda.toString(), cn_venda: item.cn_venda.toString(), cn_item_os: item.cn_item_os?.toString() ?? null,
      qt_quantidade: Number(item.qt_quantidade), vl_unitario: Number(item.vl_unitario), vl_custo: Number(item.vl_custo), vl_total: Number(item.vl_total),
    }
  }

  static toResponse(venda: FatVenda & { itens: FatItemVenda[] }) {
    const { ca_id_firebase, ca_chave_requisicao, ca_hash_requisicao, ...dados } = venda
    return {
      ...dados, cn_venda: venda.cn_venda.toString(), cn_pessoa: venda.cn_pessoa.toString(),
      cn_ordem_servico: venda.cn_ordem_servico?.toString() ?? null, vl_total: Number(venda.vl_total),
      itens: venda.itens.map(FaturamentoModel.item),
    }
  }
}
