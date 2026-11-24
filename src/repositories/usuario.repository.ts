import type { Prisma, PrismaClient } from '@prisma/client'

import type { IManutUsuarioInc, IManutUsuarioAlt } from '../interfaces/usuario.js'

export class UsuarioRepository {
  constructor(private readonly db: PrismaClient) {}

  detalhar(id: bigint) {
    return this.db.admUsuario.findUnique({ where: { cn_usuario: id } })
  }

  buscarPorFirebaseId(uid: string) {
    return this.db.admUsuario.findUnique({
      where: { ca_id_firebase: uid },
      include: { perfil: { select: { an_descr: true, bo_sts_reg: true, acessos: true } } },
    })
  }

  buscarPorEmail(email: string) {
    return this.db.admUsuario.findFirst({
      where: {
        an_email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    })
  }

  manutInc(values: IManutUsuarioInc, uid: string) {
    return this.db.admUsuario.create({
      data: {
        ca_id_firebase: uid,
        an_nome: values.an_nome,
        an_email: values.an_email,
        bo_sts_reg: values.bo_sts_reg,
        cn_perfil: values.cn_perfil ?? null,
      },
    })
  }

  manutAlt(id: bigint, values: IManutUsuarioAlt) {
    return this.db.admUsuario.update({
      where: { cn_usuario: id },
      data: {
        an_nome: values.an_nome,
        bo_sts_reg: values.bo_sts_reg,
        ...(values.cn_perfil === undefined ? {} : { cn_perfil: values.cn_perfil }),
        dt_alt: new Date(),
      },
    })
  }

  async view(page: number, limit: number, search: string) {
    const where: Prisma.AdmUsuarioWhereInput = search
      ? {
          OR: [
            {
              an_nome: { contains: search, mode: 'insensitive' },
            },
            {
              an_email: { contains: search, mode: 'insensitive' },
            },
          ],
        }
      : {}
    const [usuarios, total] = await this.db.$transaction([
      this.db.admUsuario.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { cn_usuario: 'asc' },
        include: { perfil: { select: { an_descr: true } } },
      }),
      this.db.admUsuario.count({ where }),
    ])

    return { usuarios, total }
  }
}

export type IUsuarioRepository = Pick<
  UsuarioRepository,
  'detalhar' | 'buscarPorFirebaseId' | 'buscarPorEmail' | 'manutInc' | 'manutAlt' | 'view'
>
