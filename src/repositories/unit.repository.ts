import { Prisma, type PrismaClient } from '@prisma/client'
import { ApiError } from '../interfaces/error.js'
import type { IManutUnidade } from '../interfaces/unit.js'

export class UnitRepository {
  constructor(private readonly db: PrismaClient) {}

  list() {
    return this.db.cadUnidade.findMany({ orderBy: { an_descr: 'asc' } })
  }

  create(values: IManutUnidade) {
    return this.db.cadUnidade.create({ data: values })
  }

  update(id: number, values: IManutUnidade) {
    return this.db.$transaction(
      async (transaction) => {
        const where = { cn_unidade: id }
        const previous = await transaction.cadUnidade.findUnique({ where })
        if (!previous) throw new ApiError(404, 'Cadastro não encontrado.')

        const updatedAt = new Date()
        const record = await transaction.cadUnidade.update({
          where,
          data: { ...values, dt_alt: updatedAt },
        })
        if (previous.ca_sigla !== record.ca_sigla) {
          await transaction.cadProduto.updateMany({
            where: { ca_unidade: previous.ca_sigla },
            data: { ca_unidade: record.ca_sigla, dt_alt: updatedAt },
          })
        }
        return record
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }
}
