import type { PrismaClient } from '@prisma/client'

export class OrderRepository {
  constructor(private readonly db: PrismaClient) {}

  async statusList() {
    return this.db.ordStatusOs.findMany({
      orderBy: { cn_status_os: 'asc' },
    })
  }
}

export type IOrderRepository = Pick<OrderRepository,
  'statusList'>
