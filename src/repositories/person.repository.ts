import type { Prisma, PrismaClient } from '@prisma/client'
import type { IManutPerson } from '../interfaces/person.js'

export class PersonRepository {
  constructor(private readonly db: PrismaClient) {}

  findById(id: bigint) {
    return this.db.cadPessoa.findUnique({ where: { cn_pessoa: id }, include: { endereco: true } })
  }

  paramList() {
    return this.db.cadPessoa.findMany({ where: { bo_sts_reg: true, bo_categ_cliente: true }, orderBy: { an_nome: 'asc' } })
  }

  create(values: IManutPerson) {
    const { endereco, ...data } = values
    return this.db.cadPessoa.create({ data: { ...data, endereco: { create: endereco } }, include: { endereco: true } })
  }

  update(id: bigint, values: IManutPerson) {
    const { endereco, ...data } = values
    return this.db.cadPessoa.update({
      where: { cn_pessoa: id },
      data: {
        ...data,
        dt_alt: new Date(),
        endereco: { upsert: { create: endereco, update: { ...endereco, dt_alt: new Date() } } }
      },
      include: { endereco: true },
    })
  }

  async list(page: number, limit: number, search: string) {
    const where: Prisma.CadPessoaWhereInput = search ? {
      OR: [
        { an_razao_social: { contains: search, mode: 'insensitive' } },
        { an_nome_fantasia: { contains: search, mode: 'insensitive' } },
        {
          an_nome: { contains: search, mode: 'insensitive' }
        },
        {
          ca_cpf: { contains: search, mode: 'insensitive' }
        },
        {
          ca_cnpj: { contains: search, mode: 'insensitive' }
        },
        {
          an_email: { contains: search, mode: 'insensitive' }
        },
        {
          an_telefone: { contains: search, mode: 'insensitive' }
        },
      ]
} : {}
    const [pessoas, total] = await this.db.$transaction([
      this.db.cadPessoa.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { cn_pessoa: 'asc' },
        include: { endereco: true },
      }),
      this.db.cadPessoa.count({ where }),
    ])

    return { pessoas, total }
  }
}

export type IPersonRepository = Pick<PersonRepository,
  'findById' | 'list' | 'create' | 'update' | 'paramList'>
