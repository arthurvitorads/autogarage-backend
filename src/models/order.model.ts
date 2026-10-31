import type { CadPessoa, OrdItemOs, OrdOrdemServico, OrdClassificacaoOs } from '@prisma/client'

export class OrderModel {
  static classification(status: OrdClassificacaoOs) {
    return {
      cn_classificacao: status.cn_classificacao_os.toString(),
      an_descr: status.an_descr,
      ca_cor: status.ca_cor,
      bo_padrao: status.bo_padrao
    }
  }

  static toParamResponse(status: OrdClassificacaoOs) {
    return { id: status.cn_classificacao_os.toString(), an_descr: status.an_descr }
  }

  static item(item: OrdItemOs) {
    return {
      ...item,
      cn_item: item.cn_item.toString(),
      cn_ordem_servico: item.cn_ordem_servico.toString(),
      qt_quantidade: Number(item.qt_quantidade),
      vl_unitario: Number(item.vl_unitario),
      vl_total: Number(item.vl_total)
    }
  }

  static toResponse(ordem: OrdOrdemServico & {
    pessoa: CadPessoa;
    itens: OrdItemOs[]
  }) {
    const { pessoa, itens, cn_classificacao_os, an_placa, an_marca, an_modelo, nu_ano, an_cor, qt_quilometragem, ...data } = ordem
    return {
      ...data,
      cn_ordem_servico: ordem.cn_ordem_servico.toString(),
      cn_pessoa: ordem.cn_pessoa.toString(),
      cn_classificacao: cn_classificacao_os.toString(),
      an_cliente: pessoa.an_nome ?? pessoa.an_razao_social ?? '',
      veiculo: {
        an_placa,
        an_marca,
        an_modelo,
        nu_ano,
        an_cor,
        qt_quilometragem
      },
      itens: itens.map(OrderModel.item)
    }
  }
}
