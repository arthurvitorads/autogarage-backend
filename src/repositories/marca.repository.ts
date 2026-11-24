import { Prisma, type PrismaClient } from '@prisma/client'
import { ApiError } from '../interfaces/error.js'
import type { IManutMarca } from '../interfaces/marca.js'

export class MarcaRepository {
  constructor(private readonly db: PrismaClient) {}

  view() {
    return this.db.cadMarca.findMany({ orderBy: { an_descr: 'asc' } })
  }

  manutInc(values: IManutMarca) {
    return this.db.cadMarca.create({ data: values })
  }

  manutAlt(id: number, values: IManutMarca) {
    return this.db.$transaction(
      async (transaction) => {
        const where = { cn_marca: id }
        const previous = await transaction.cadMarca.findUnique({ where })
        if (!previous) throw new ApiError(404, 'Cadastro não encontrado.')

        const updatedAt = new Date()
        const record = await transaction.cadMarca.update({
          where,
          data: { ...values, dt_alt: updatedAt },
        })
        if (previous.an_descr !== record.an_descr) {
          await transaction.cadProduto.updateMany({
            where: { an_marca: previous.an_descr },
            data: { an_marca: record.an_descr, dt_alt: updatedAt },
          })
        }
        return record
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }
}
