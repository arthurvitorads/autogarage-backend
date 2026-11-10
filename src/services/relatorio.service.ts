import { ApiResponse } from '../http/api-response.js'
import type { IRelatorioRepository } from '../repositories/relatorio.repository.js'
import type { IFiltroRelatorio } from '../interfaces/faturamento.js'
import { FaturamentoModel } from '../models/faturamento.model.js'

export class RelatorioService {
  constructor(private readonly relatorio: IRelatorioRepository) {}

  async tempos(page: number, limit: number, filtro: IFiltroRelatorio) {
    const { itens, total, resumo } = await this.relatorio.tempos(page, limit, filtro)
    return ApiResponse.page({
      dados: itens.map((item) => ({
        cn_item: item.cn_item.toString(),
        cn_ordem_servico: item.cn_ordem_servico.toString(),
        nu_ordem: item.ordem.nu_numero,
        cn_servico: item.cn_servico,
        an_descr: item.an_descr,
        an_cliente: item.ordem.pessoa.an_nome ?? item.ordem.pessoa.an_razao_social ?? '',
        an_responsavel: item.ordem.an_responsavel,
        qt_quantidade: Number(item.qt_quantidade),
        qt_tempo_segundos: item.qt_tempo_segundos,
        dt_finalizacao: item.ordem.dt_finalizacao,
        intervalos: item.tempos.map((tempo) => ({
          dt_inicio: tempo.dt_inicio,
          dt_fim: tempo.dt_fim,
          qt_segundos: tempo.qt_segundos,
          ca_encerramento: tempo.ca_encerramento,
        })),
      })),
      resumo: {
        qt_servicos: total,
        qt_media_segundos: resumo._avg.qt_tempo_segundos ?? 0,
        qt_menor_segundos: resumo._min.qt_tempo_segundos ?? 0,
        qt_maior_segundos: resumo._max.qt_tempo_segundos ?? 0,
      },
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }

  async vendas(page: number, limit: number, filtro: IFiltroRelatorio) {
    const { vendas, total, resumo } = await this.relatorio.vendas(page, limit, filtro)
    return ApiResponse.page({
      dados: vendas.map(FaturamentoModel.toResponse),
      resumo: { qt_vendas: total, vl_total: Number(resumo._sum.vl_total ?? 0) },
      pagination: ApiResponse.pagination(page, limit, total),
    })
  }
}
