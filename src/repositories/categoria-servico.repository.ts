import { Prisma, type PrismaClient } from '@prisma/client'
import { ApiError } from '../interfaces/error.js'
import type { IManutCategoriaServico } from '../interfaces/categoria-servico.js'

export class CategoriaServicoRepository {
  constructor(private readonly db: PrismaClient) {}

  view() {
    return this.db.cadCategoriaServico.findMany({ orderBy: { an_descr: 'asc' } })
  }

  manutInc(values: IManutCategoriaServico) {
    return this.db.cadCategoriaServico.create({ data: values })
  }

  manutAlt(id: number, values: IManutCategoriaServico) {
    return this.db.$transaction(
      async (transaction) => {
        const where = { cn_categoria_servico: id }
        const previous = await transaction.cadCategoriaServico.findUnique({ where })
        if (!previous) throw new ApiError(404, 'Cadastro não encontrado.')

        const updatedAt = new Date()
        const record = await transaction.cadCategoriaServico.update({
          where,
          data: { ...values, dt_alt: updatedAt },
        })
        if (previous.an_descr !== record.an_descr) {
          await transaction.cadServico.updateMany({
            where: { an_categoria: previous.an_descr },
            data: { an_categoria: record.an_descr, dt_alt: updatedAt },
          })
        }
        return record
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }
}
