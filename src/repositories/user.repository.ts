import type { Prisma, PrismaClient } from '@prisma/client';
import type { ICreateUser, IUpdateUser } from '../interfaces/user.js';

export class UserRepository {
  constructor(private readonly db: PrismaClient) {}

  findById(id: bigint) {
    return this.db.admUsuario.findUnique({ where: { cn_usuario: id } });
  }

  findByFirebaseId(uid: string) {
    return this.db.admUsuario.findUnique({ where: { ca_id_firebase: uid } });
  }

  findByEmail(email: string) {
    return this.db.admUsuario.findFirst({
      where: { an_email: { equals: email, mode: 'insensitive' } },
    });
  }

  create(values: ICreateUser, uid: string) {
    return this.db.admUsuario.create({
      data: {
        ca_id_firebase: uid,
        an_nome: values.an_nome,
        an_email: values.an_email,
        bo_sts_reg: values.bo_sts_reg,
      },
    });
  }

  update(id: bigint, values: IUpdateUser) {
    return this.db.admUsuario.update({
      where: { cn_usuario: id },
      data: { an_nome: values.an_nome, bo_sts_reg: values.bo_sts_reg, dt_alt: new Date() },
    });
  }

  async list(page: number, limit: number, search: string) {
    const where: Prisma.AdmUsuarioWhereInput = search ? {
      OR: [
        { an_nome: { contains: search, mode: 'insensitive' } },
        { an_email: { contains: search, mode: 'insensitive' } },
      ],
    } : {};
    const [users, total] = await this.db.$transaction([
      this.db.admUsuario.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { cn_usuario: 'asc' },
      }),
      this.db.admUsuario.count({ where }),
    ]);
    return { users, total };
  }
}

export type IUserRepository = Pick<UserRepository,
  'findById' | 'findByFirebaseId' | 'findByEmail' | 'create' | 'update' | 'list'>;
