import { Prisma, type PrismaClient } from '@prisma/client'
import { ApiError } from '../interfaces/error.js'
import type { IManutCategoriaProduto } from '../interfaces/product-category.js'

export class ProductCategoryRepository {
  constructor(private readonly db: PrismaClient) {}

  list() {
    return this.db.cadCategoriaProduto.findMany({ orderBy: { an_descr: 'asc' } })
  }

  create(values: IManutCategoriaProduto) {
    return this.db.cadCategoriaProduto.create({ data: values })
  }

  update(id: number, values: IManutCategoriaProduto) {
    return this.db.$transaction(
      async (transaction) => {
        const where = { cn_categoria_produto: id }
        const previous = await transaction.cadCategoriaProduto.findUnique({ where })
        if (!previous) throw new ApiError(404, 'Cadastro não encontrado.')

        const updatedAt = new Date()
        const record = await transaction.cadCategoriaProduto.update({
          where,
          data: { ...values, dt_alt: updatedAt },
        })
        if (previous.an_descr !== record.an_descr) {
          await transaction.cadProduto.updateMany({
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
