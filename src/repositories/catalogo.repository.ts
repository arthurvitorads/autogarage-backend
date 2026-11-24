import type { PrismaClient } from '@prisma/client'

export class CatalogoRepository {
  constructor(private readonly db: PrismaClient) {}

  param() {
    return this.db.$transaction([
      this.db.cadProduto.findMany({
        where: { bo_sts_reg: true },
        select: { cn_produto: true, an_nome: true, ca_unidade: true, vl_venda: true },
        orderBy: { cn_produto: 'asc' },
      }),
      this.db.cadServico.findMany({
        where: { bo_sts_reg: true },
        select: { cn_servico: true, an_nome: true, vl_preco: true },
        orderBy: { cn_servico: 'asc' },
      }),
    ])
  }
}

export type ICatalogoRepository = Pick<CatalogoRepository, 'param'>
