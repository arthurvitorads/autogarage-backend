import type { CadPessoa, OrdItemOs, OrdOrdemServico, OrdClassificacaoOs } from '@prisma/client'

export class OrdemServicoModel {
  static responsavel(
    pessoa: Pick<CadPessoa, 'cn_pessoa' | 'an_nome' | 'an_razao_social' | 'an_cargo'>,
  ) {
    return {
      cn_pessoa: pessoa.cn_pessoa.toString(),
      an_nome: pessoa.an_nome ?? pessoa.an_razao_social ?? '',
      an_cargo: pessoa.an_cargo ?? '',
    }
  }
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
      cn_ordem: item.cn_ordem.toString(),
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
      responsaveis: { pessoa: Parameters<typeof OrdemServicoModel.responsavel>[0] }[]
      venda?: { cn_venda: bigint } | null
    },
  ) {
    const { pessoa, itens, venda, responsaveis, cn_responsavel: _codigoLegado, ...data } = ordem
    return {
      ...data,
      cn_ordem: ordem.cn_ordem.toString(),
      cn_pessoa: ordem.cn_pessoa.toString(),
      responsaveis: responsaveis.map(({ pessoa }) => OrdemServicoModel.responsavel(pessoa)),
      cn_classificacao_os: ordem.cn_classificacao_os.toString(),
      an_cliente: pessoa.an_nome ?? pessoa.an_razao_social ?? '',
      cn_venda: venda?.cn_venda.toString() ?? null,
      itens: itens.map(OrdemServicoModel.item),
    }
  }
}
