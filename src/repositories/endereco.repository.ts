import type { PrismaClient } from '@prisma/client'

export class EnderecoRepository {
  constructor(private readonly db: PrismaClient) {}

  domain() {
    return this.db.endEstado.findMany({
      orderBy: [{ ca_pais: 'asc' }, { ca_uf: 'asc' }],
    })
  }
}
