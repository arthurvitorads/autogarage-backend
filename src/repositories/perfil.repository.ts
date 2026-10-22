import type { Prisma, PrismaClient } from '@prisma/client'

import type { IManutPerfil } from '../interfaces/perfil.js'

export class PerfilRepository {
  constructor(private readonly db: PrismaClient) {}

  findById(id: bigint) {
    return this.db.admPerfil.findUnique({ where: { cn_perfil: id } })
  }

  create(values: IManutPerfil) {
    return this.db.admPerfil.create({
      data: {
        an_descr: values.an_descr ?? '',
        bo_sts_reg: values.bo_sts_reg ?? true,
        dt_inc: new Date()
      },
    })
  }

  update(id: bigint, values: IManutPerfil) {
    return this.db.admPerfil.update({
      where: { cn_perfil: id },
      data: { 
        an_descr: values.an_descr ?? '',
        bo_sts_reg: values.bo_sts_reg ?? true,
        dt_alt: new Date() 
      },
    })
  }

  async list(page: number, limit: number, search: string) {
    const where: Prisma.AdmPerfilWhereInput = search ? {
      OR: [
        { 
          an_descr: { contains: search, mode: 'insensitive' } 
        }
      ]} : {}

    const [perfil, total] = await this.db.$transaction([
      this.db.admPerfil.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { cn_perfil: 'asc' },
      }),

      this.db.admPerfil.count({ where }),
    ])

    return { perfil, total }
  }


  async paramList() {
    return this.db.admPerfil.findMany({
      orderBy: { cn_perfil: 'asc' },
    })
  }
}

export type IPerfilRepository = Pick<PerfilRepository,
  'findById' | 'create' | 'update' | 'list' | 'paramList'>
