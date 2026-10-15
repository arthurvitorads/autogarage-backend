
import type { Prisma } from "@prisma/client";

import type { FastifyInstance } from "fastify";

import { prisma } from "../prisma.js";
import { apiGet, apiPost } from "../stores/api.store.js";
import { firebaseAuth } from '../firebase-admin.js';

import { validateCreateUser, validateUpdateUser, validateUserId } from '../stores/user.store.js';

import { ApiError } from "../interfaces/error.js";

import type { IPaginationQuery } from "../interfaces/util.js";

export async function authRoute(app: FastifyInstance) {
  apiGet(app, "/auth/me", async (request) => {
    const uid = request.firebaseUser?.uid;

    if (!uid) {
      throw new ApiError(401, "Usuário não autenticado.");
    }

    const usuario = await prisma.admUsuario.findUnique({
      where: {
        ca_id_firebase: uid,
      },
    });

    if (!usuario) {
      throw new ApiError(
        404,
        "Usuário não encontrado na base de dados."
      );
    }

    return {
        cn_usuario: usuario.cn_usuario.toString(),
        ca_id_firebase: usuario.ca_id_firebase,
        an_email: usuario.an_email,
        an_nome: usuario.an_nome,
        bo_sts_reg: usuario.bo_sts_reg
    };
  });
}

export async function userRoute(app: FastifyInstance) {
  apiPost(app, '/usuarios/:id', async (request) => {
    const id = validateUserId((request.params as { id: string }).id);
    const values = validateUpdateUser(request.body);

    // todo: acesso

    // const operator = await prisma.admUsuario.findUnique({
    //   where: { ca_id_firebase: request.firebaseUser!.uid },
    // });
    
    // if (!operator?.bo_sts_reg) throw new ApiError(403, 'Usuário sem acesso ao cadastro.');

    const existing = await prisma.admUsuario.findUnique({ where: { cn_usuario: id } });
    
    if (!existing) 
      throw new ApiError(404, 'Usuário não encontrado.');

    const previousFirebaseUser = await firebaseAuth.getUser(existing.ca_id_firebase);

    await firebaseAuth.updateUser(existing.ca_id_firebase, {
      displayName: values.an_nome,
      disabled: !values.bo_sts_reg,
    });
    
    try {
      const user = await prisma.admUsuario.update({
        where: { cn_usuario: id },
        data: { 
          an_nome: values.an_nome, 
          bo_sts_reg: values.bo_sts_reg, 
          dt_alt: new Date() 
        },
      });
      
      return { ...user, cn_usuario: user.cn_usuario.toString() };
    } catch (error) {
      try {
        await firebaseAuth.updateUser(existing.ca_id_firebase, {
          displayName: previousFirebaseUser.displayName ?? null,
          disabled: previousFirebaseUser.disabled,
        });
        
      } catch (rollbackError) {
        request.log.error({ err: rollbackError, uid: existing.ca_id_firebase }, 'Falha ao restaurar usuário no Firebase após erro no banco.');
      }
      throw error;
    }
  }, 200);

  apiPost(app, '/usuarios', async (request) => {
    const values = validateCreateUser(request.body);

    // const operator = await prisma.admUsuario.findUnique({
    //   where: { ca_id_firebase: request.firebaseUser!.uid },
    // });

    // if (!operator?.bo_sts_reg) throw new ApiError(403, 'Usuário sem acesso ao cadastro.');

    const existing = await prisma.admUsuario.findFirst({
      where: { an_email: { equals: values.an_email, mode: 'insensitive' } },
    });

    if (existing) 
      throw new ApiError(409, 'E-mail já cadastrado.');

    let uid: string;

    try {
      const user = await firebaseAuth.createUser({
        email: values.an_email,
        password: values.ca_senha,
        displayName: values.an_nome,
        disabled: !values.bo_sts_reg,
      });

      uid = user.uid;

    } catch (error) {
      const code = (error as { code?: string }).code;

      if (code === 'auth/email-already-exists') 
        throw new ApiError(409, 'E-mail já cadastrado.');

      if (code === 'auth/invalid-email') 
        throw new ApiError(400, 'Informe um e-mail válido.');

      if (code === 'auth/invalid-password' || code === 'auth/password-does-not-meet-requirements') {
        throw new ApiError(400, 'A senha não atende aos requisitos de segurança.');
      }
      throw error;
    }

    try {
      const user = await prisma.admUsuario.create({
        data: {
          ca_id_firebase: uid,
          an_nome: values.an_nome,
          an_email: values.an_email,
          bo_sts_reg: values.bo_sts_reg,
        },
      });
      return { ...user, cn_usuario: user.cn_usuario.toString() };
    } catch (error) {
      try {
        await firebaseAuth.deleteUser(uid);
      } catch (cleanupError) {
        request.log.error({ err: cleanupError, uid }, 'Falha ao remover usuário do Firebase após erro no banco.');
      }
      throw error;
    }
  });

  apiGet(app, "/usuarios", async (request) => {
    const query = request.query as IPaginationQuery;

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const search = (query.search ?? "").trim();

    if (!Number.isSafeInteger(page) || !Number.isSafeInteger(limit) || page < 1 || limit < 1 || limit > 100) {
      throw new ApiError(400, "Paginação inválida.");
    }

    const skip = (page - 1) * limit;

    if (!Number.isSafeInteger(skip)) {
      throw new ApiError(400, "Página inválida.");
    }

    const where: Prisma.AdmUsuarioWhereInput = search
      ? {
          OR: [
            {
              an_nome: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              an_email: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const [usuarios, total] = await prisma.$transaction([
      prisma.admUsuario.findMany({
        where,
        skip,
        take: limit,
        select: {
          cn_usuario: true,
          ca_id_firebase: true,
          an_email: true,
          an_nome: true,
          bo_sts_reg: true,
          dt_inc: true,
          dt_alt: true,
        },
        orderBy: {
          cn_usuario: "asc",
        },
      }),

      prisma.admUsuario.count({
        where,
      }),
    ]);

    return {
      usuarios: usuarios.map((usuario) => ({
        ...usuario,
        cn_usuario: usuario.cn_usuario.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  });
}