import type { Prisma, PrismaClient } from '@prisma/client'

export class PersonRepository {
  constructor(private readonly db: PrismaClient) {}

  findById(id: bigint) {
    return this.db.cadPessoa.findUnique({ where: { cn_pessoa: id } })
  }

  async list(page: number, limit: number, search: string) {
    const where: Prisma.CadPessoaWhereInput = search ? {
      OR: [
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
      ]} : {}

    const [users, total] = await this.db.$transaction([
      this.db.cadPessoa.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { cn_pessoa: 'asc' },
        // include: { perfil: { select: { an_descr: true } } },
      }),

      this.db.cadPessoa.count({ where }),
    ])

    return { users, total }
  }
}

export type IPersonRepository = Pick<PersonRepository,
  'findById' | 'list'>
