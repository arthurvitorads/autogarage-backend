
import type { FastifyInstance } from "fastify";

import { prisma } from "../prisma.js";
import { apiGet } from "../stores/api.store.js";

import { ApiError } from "../interfaces/error.js";

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
  apiGet(app, "/usuarios", async () => {
    const usuarios = await prisma.admUsuario.findMany({
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
    });

    return usuarios.map((usuario) => ({
      ...usuario,
      cn_usuario: usuario.cn_usuario.toString(),
    }));
  });
}