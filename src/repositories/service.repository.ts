import { Prisma, type PrismaClient } from '@prisma/client'
import type { IManutServico } from '../interfaces/service.js'

export class ServiceRepository {
  constructor(private readonly db: PrismaClient) {}

  async services(page: number, limit: number, search: string) {
    const where: Prisma.CadServicoWhereInput = search
      ? {
          OR: [
            { an_nome: { contains: search, mode: 'insensitive' } },
            ...(/^\d+$/.test(search) && Number(search) <= 2147483647
              ? [{ cn_servico: Number(search) }]
              : []),
          ],
        }
      : {}
    const [servicos, total] = await this.db.$transaction([
      this.db.cadServico.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { cn_servico: 'asc' },
      }),
      this.db.cadServico.count({ where }),
    ])

    return { servicos, total }
  }

  createService(values: IManutServico) {
    return this.db.cadServico.create({ data: values })
  }

  updateService(id: number, values: IManutServico) {
    return this.db.cadServico.update({
      where: { cn_servico: id },
      data: { ...values, dt_alt: new Date() },
    })
  }
}
