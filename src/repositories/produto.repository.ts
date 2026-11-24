import { Prisma, type PrismaClient } from '@prisma/client'
import type { IManutProduto } from '../interfaces/produto.js'

export class ProdutoRepository {
  constructor(private readonly db: PrismaClient) {}

  async view(page: number, limit: number, search: string) {
    const where: Prisma.CadProdutoWhereInput = search
      ? {
          OR: [
            { an_nome: { contains: search, mode: 'insensitive' } },
            { an_referencia: { contains: search, mode: 'insensitive' } },
            ...(/^\d+$/.test(search) && Number(search) <= 2147483647
              ? [{ cn_produto: Number(search) }]
              : []),
          ],
        }
      : {}
    const [produtos, total] = await this.db.$transaction([
      this.db.cadProduto.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { cn_produto: 'asc' },
      }),
      this.db.cadProduto.count({ where }),
    ])

    return { produtos, total }
  }

  manutInc(values: IManutProduto) {
    return this.db.cadProduto.create({ data: values })
  }

  manutAlt(id: number, values: IManutProduto) {
    return this.db.cadProduto.update({
      where: { cn_produto: id },
      data: { ...values, dt_alt: new Date() },
    })
  }
}
