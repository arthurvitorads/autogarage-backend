import { Prisma, type PrismaClient } from '@prisma/client'
import { ApiError } from '../interfaces/error.js'
import type { IManutProduto, IManutServico, IManutCadastroAuxiliar } from '../interfaces/catalog.js'

export class CatalogRepository {
  constructor(private readonly db: PrismaClient) {}

  async products(page: number, limit: number, search: string) {
    const where: Prisma.CadProdutoWhereInput = search ? {
      OR: [
        { an_nome: { contains: search, mode: 'insensitive' } },
        { an_referencia: { contains: search, mode: 'insensitive' } },
        ...(/^\d+$/.test(search) && Number(search) <= 2147483647 ? [{ cn_produto: Number(search) }] : []),
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
    const where: Prisma.CadServicoWhereInput = search ? { OR: [{ an_nome: { contains: search, mode: 'insensitive' } }, ...(/^\d+$/.test(search) && Number(search) <= 2147483647 ? [{ cn_servico: Number(search) }] : [])] } : {}
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
    return this.db.$transaction(async transaction => {
      const anterior = await transaction.cadAuxiliar.findUnique({ where: { cn_cadastro: id } })
      if (!anterior)
        throw new ApiError(404, 'Cadastro não encontrado.')
      if (anterior.ca_tipo !== values.ca_tipo)
        throw new ApiError(400, 'O tipo do cadastro não pode ser alterado.')
      const cadastro = await transaction.cadAuxiliar.update({ where: { cn_cadastro: id }, data: { ...values, dt_alt: new Date() } })
      if (values.ca_tipo === 'CATEGORIA_PRODUTO')
        await transaction.cadProduto.updateMany({ where: { an_categoria: anterior.an_descr }, data: { an_categoria: values.an_descr, dt_alt: new Date() } })
      else if (values.ca_tipo === 'CATEGORIA_SERVICO')
        await transaction.cadServico.updateMany({ where: { an_categoria: anterior.an_descr }, data: { an_categoria: values.an_descr, dt_alt: new Date() } })
      else if (values.ca_tipo === 'MARCA')
        await transaction.cadProduto.updateMany({ where: { an_marca: anterior.an_descr }, data: { an_marca: values.an_descr, dt_alt: new Date() } })
      else
        await transaction.cadProduto.updateMany({ where: { ca_unidade: anterior.ca_sigla }, data: { ca_unidade: values.ca_sigla, dt_alt: new Date() } })
      return cadastro
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  }
}

export type ICatalogRepository = Pick<CatalogRepository, 'products' | 'services' | 'createProduct' | 'updateProduct' |
  'createService' | 'updateService' | 'auxiliaries' | 'createAuxiliary' | 'updateAuxiliary'>
