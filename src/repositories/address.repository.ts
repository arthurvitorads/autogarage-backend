import type { PrismaClient } from '@prisma/client'

export class AddressRepository {
  constructor(private readonly db: PrismaClient) {}

  listStates() {
    return this.db.endEstado.findMany({
      orderBy: [{ ca_pais: 'asc' }, { ca_uf: 'asc' }],
    })
  }
}
