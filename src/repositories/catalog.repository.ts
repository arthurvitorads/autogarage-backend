import type { Prisma, PrismaClient } from '@prisma/client'
import type { IManutProduto, IManutServico, IManutCadastroAuxiliar } from '../interfaces/catalog.js'

export class CatalogRepository {
  constructor(private readonly db: PrismaClient) {}

  async products(page: number, limit: number, search: string) {
    const where: Prisma.CadProdutoWhereInput = search ? {
      OR: [
        { an_nome: { contains: search, mode: 'insensitive' } },
        { an_referencia: { contains: search, mode: 'insensitive' } },
      ]
    } : {}
    const [produtos, total] = await this.db.$transaction([
      this.db.cadProduto.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { cn_produto: 'asc' }
      }),
      this.db.cadProduto.count({ where }),
    ])

    return { produtos, total }
  }

  createProduct(values: IManutProduto) {
    return this.db.cadProduto.create({ data: values })
  }

  updateProduct(id: number, values: IManutProduto) {
    return this.db.cadProduto.update({ where: { cn_produto: id }, data: { ...values, dt_alt: new Date() } })
  }

  async services(page: number, limit: number, search: string) {
    const where: Prisma.CadServicoWhereInput = search ? { an_nome: { contains: search, mode: 'insensitive' } } : {}
    const [servicos, total] = await this.db.$transaction([
      this.db.cadServico.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { cn_servico: 'asc' }
      }),
      this.db.cadServico.count({ where }),
    ])

    return { servicos, total }
  }

  createService(values: IManutServico) {
    return this.db.cadServico.create({ data: values })
  }

  updateService(id: number, values: IManutServico) {
    return this.db.cadServico.update({ where: { cn_servico: id }, data: { ...values, dt_alt: new Date() } })
  }

  auxiliaries() {
    return this.db.cadAuxiliar.findMany({ orderBy: { an_descr: 'asc' } })
  }

  createAuxiliary(values: IManutCadastroAuxiliar) {
    return this.db.cadAuxiliar.create({ data: values })
  }

  updateAuxiliary(id: number, values: IManutCadastroAuxiliar) {
    return this.db.cadAuxiliar.update({ where: { cn_cadastro: id }, data: { ...values, dt_alt: new Date() } })
  }
}

export type ICatalogRepository = Pick<CatalogRepository, 'products' | 'services' | 'createProduct' | 'updateProduct' |
  'createService' | 'updateService' | 'auxiliaries' | 'createAuxiliary' | 'updateAuxiliary'>
