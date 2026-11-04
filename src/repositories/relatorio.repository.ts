import type { Prisma, PrismaClient } from '@prisma/client'
import type { IFiltroRelatorio } from '../interfaces/faturamento.js'

export class RelatorioRepository {
  constructor(private readonly db: PrismaClient) {}

  async tempos(page: number, limit: number, filtro: IFiltroRelatorio) {
    const where: Prisma.OrdItemOsWhereInput = {
      ca_tipo: 'SERVICO', ca_status_servico: 'FINALIZADO',
      ordem: { ca_status: 'FINALIZADO', dt_finalizacao: { gte: filtro.inicio, lte: filtro.fim } },
      tempos: { some: { dt_fim: { not: null } } },
    }
    const [itens, total, resumo] = await this.db.$transaction([
      this.db.ordItemOs.findMany({
        where, include: { ordem: { include: { pessoa: true } }, tempos: { orderBy: { dt_inicio: 'asc' } } },
        orderBy: [{ qt_tempo_segundos: filtro.ordem }, { cn_item: 'asc' }], skip: (page - 1) * limit, take: limit,
      }),
      this.db.ordItemOs.count({ where }),
      this.db.ordItemOs.aggregate({ where, _avg: { qt_tempo_segundos: true }, _min: { qt_tempo_segundos: true }, _max: { qt_tempo_segundos: true } }),
    ])
    return { itens, total, resumo }
  }

  async vendas(page: number, limit: number, filtro: IFiltroRelatorio) {
    const where = { dt_venda: { gte: filtro.inicio, lte: filtro.fim } }
    const [vendas, total, resumo] = await this.db.$transaction([
      this.db.fatVenda.findMany({ where, include: { itens: true }, orderBy: { dt_venda: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.db.fatVenda.count({ where }),
      this.db.fatVenda.aggregate({ where, _sum: { vl_total: true } }),
    ])
    return { vendas, total, resumo }
  }
}

export type IRelatorioRepository = Pick<RelatorioRepository, 'tempos' | 'vendas'>
