import type { Prisma, PrismaClient } from '@prisma/client'
import type { IManutPessoa } from '../interfaces/pessoa.js'

export class PessoaRepository {
  constructor(private readonly db: PrismaClient) {}

  detalhar(id: bigint) {
    return this.db.cadPessoa.findUnique({
      where: { cn_pessoa: id },
      include: { endereco: true },
    })
  }

  consultarClienteVenda(id: bigint, orderId?: bigint) {
    return this.db.cadPessoa.findFirst({
      where: {
        cn_pessoa: id,
        ...(orderId === undefined
          ? { bo_sts_reg: true, bo_categ_cliente: true }
          : { ordens: { some: { cn_ordem_servico: orderId, ca_status: 'FINALIZADO' } } }),
      },
      select: {
        an_nome: true,
        an_razao_social: true,
        ca_cpf: true,
        ca_cnpj: true,
        an_email: true,
        an_telefone: true,
        endereco: {
          select: { an_logradouro: true, an_numero: true, an_cidade: true, estado: { select: { ca_uf: true } } },
        },
      },
    })
  }

  param() {
    return this.db.cadPessoa.findMany({
      where: { bo_sts_reg: true, bo_categ_cliente: true },
      orderBy: { an_nome: 'asc' },
    })
  }

  consultarEstadoBrasileiro(id: bigint) {
    return this.db.endEstado.findFirst({
      where: { cn_estado: id, ca_pais: 'BR' },
      select: { cn_estado: true },
    })
  }

  manutInc(values: IManutPessoa) {
    const { endereco, ...data } = values
    return this.db.cadPessoa.create({
      data: { ...data, endereco: { create: endereco } },
      include: { endereco: true },
    })
  }

  manutAlt(id: bigint, values: IManutPessoa) {
    const { endereco, ...data } = values
    return this.db.cadPessoa.update({
      where: { cn_pessoa: id },
      data: {
        ...data,
        dt_alt: new Date(),
        endereco: {
          upsert: {
            create: endereco,
            update: { ...endereco, dt_alt: new Date() },
          },
        },
      },
      include: { endereco: true },
    })
  }

  async view(page: number, limit: number, search: string) {
    const where: Prisma.CadPessoaWhereInput = search
      ? {
          OR: [
            { an_razao_social: { contains: search, mode: 'insensitive' } },
            { an_nome_fantasia: { contains: search, mode: 'insensitive' } },
            {
              an_nome: { contains: search, mode: 'insensitive' },
            },
            {
              ca_cpf: { contains: search, mode: 'insensitive' },
            },
            {
              ca_cnpj: { contains: search, mode: 'insensitive' },
            },
            {
              an_email: { contains: search, mode: 'insensitive' },
            },
            {
              an_telefone: { contains: search, mode: 'insensitive' },
            },
          ],
        }
      : {}
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

export type IPessoaRepository = Pick<
  PessoaRepository,
  'detalhar' | 'consultarClienteVenda' | 'view' | 'manutInc' | 'manutAlt' | 'param' | 'consultarEstadoBrasileiro'
>
