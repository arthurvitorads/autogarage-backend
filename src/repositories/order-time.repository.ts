import type { OrdItemOs, Prisma } from '@prisma/client'
import { ApiError } from '../interfaces/error.js'

export class OrderTimeRepository {
  static seconds(inicio: Date, fim: Date): number {
    return Math.max(0, Math.floor((fim.getTime() - inicio.getTime()) / 1000))
  }

  static async start(transaction: Prisma.TransactionClient, item: OrdItemOs, agora: Date) {
    if (item.ca_tipo !== 'SERVICO' || !['PENDENTE', 'PAUSADO'].includes(item.ca_status_servico))
      throw new ApiError(409, 'Este serviço não pode ser iniciado no estado atual.')
    await transaction.ordTempoItemOs.create({
      data: { cn_item: item.cn_item, dt_inicio: agora },
    })
    return transaction.ordItemOs.update({
      where: { cn_item: item.cn_item },
      data: {
        ca_status_servico: 'EM_ANDAMENTO',
        dt_inicio_tempo: agora,
        dt_alt: agora,
      },
    })
  }

  static async stop(
    transaction: Prisma.TransactionClient,
    item: OrdItemOs,
    agora: Date,
    acao: 'PAUSAR' | 'FINALIZAR' | 'CANCELAR',
  ) {
    let segundos = 0
    if (item.dt_inicio_tempo) {
      segundos = this.seconds(item.dt_inicio_tempo, agora)
      const result = await transaction.ordTempoItemOs.updateMany({
        where: { cn_item: item.cn_item, dt_fim: null },
        data: {
          dt_fim: agora,
          qt_segundos: segundos,
          ca_encerramento: acao,
          dt_alt: agora,
        },
      })
      if (result.count !== 1)
        throw new ApiError(409, 'Intervalo de tempo inconsistente. Atualize a ordem.')
    }
    return transaction.ordItemOs.update({
      where: { cn_item: item.cn_item },
      data: {
        ca_status_servico:
          acao === 'PAUSAR' ? 'PAUSADO' : acao === 'FINALIZAR' ? 'FINALIZADO' : 'CANCELADO',
        qt_tempo_segundos: { increment: segundos },
        dt_inicio_tempo: null,
        dt_alt: agora,
      },
    })
  }
}
