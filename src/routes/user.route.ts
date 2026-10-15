
import type { Prisma } from "@prisma/client";

import type { FastifyInstance } from "fastify";

import { prisma } from "../prisma.js";
import { apiGet } from "../stores/api.store.js";

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
  apiGet(app, "/usuarios", async (request) => {
    const query = request.query as IPaginationQuery;

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const search = (query.search ?? "").trim();

    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
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