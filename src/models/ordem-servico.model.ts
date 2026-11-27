import type { CadPessoa, OrdItemOs, OrdOrdemServico, OrdClassificacaoOs } from '@prisma/client'

export class OrdemServicoModel {
  static classification(status: OrdClassificacaoOs) {
    return {
      cn_classificacao_os: status.cn_classificacao_os.toString(),
      an_descr: status.an_descr,
      ca_cor: status.ca_cor,
    }
  }

  static paraParam(status: OrdClassificacaoOs) {
    return {
      cn_classificacao_os: status.cn_classificacao_os.toString(),
      an_descr: status.an_descr,
    }
  }

  static item(item: OrdItemOs) {
    return {
      ...item,
      cn_item: item.cn_item.toString(),
      cn_ordem_servico: item.cn_ordem_servico.toString(),
      qt_quantidade: Number(item.qt_quantidade),
      vl_unitario: Number(item.vl_unitario),
      vl_total: Number(item.vl_total),
      dt_servidor: new Date().toISOString(),
    }
  }

  static paraResposta(
    ordem: OrdOrdemServico & {
      pessoa: CadPessoa
      itens: OrdItemOs[]
      venda?: { cn_venda: bigint } | null
    },
  ) {
    const { pessoa, itens, venda, ...data } = ordem
    return {
      ...data,
      cn_ordem_servico: ordem.cn_ordem_servico.toString(),
      cn_pessoa: ordem.cn_pessoa.toString(),
      cn_responsavel: ordem.cn_responsavel?.toString() ?? null,
      cn_classificacao_os: ordem.cn_classificacao_os.toString(),
      an_cliente: pessoa.an_nome ?? pessoa.an_razao_social ?? '',
      cn_venda: venda?.cn_venda.toString() ?? null,
      itens: itens.map(OrdemServicoModel.item),
    }
  }
}
