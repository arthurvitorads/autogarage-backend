
import type { FastifyInstance } from "fastify";
import { firebaseAuth } from "../firebase-admin.js";
import { prisma } from "../prisma.js";

export async function authRoutes(app: FastifyInstance) {
  app.get("/auth/me", async (request, reply) => {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return reply.code(401).send({
        code: 401,
        error: "Token de autenticação não informado.",
      });
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      return reply.code(401).send({
        erro: "Token de autenticação inválido.",
      });
    }

    let decodedToken;

    try {
      decodedToken = await firebaseAuth.verifyIdToken(token, true);
    } catch (error) {
      request.log.warn(
        { err: error },
        "Token Firebase inválido, expirado ou revogado"
      );

      return reply.code(401).send({
        code: 401,
        error: "Token inválido, expirado ou revogado.",
      });
    }

    try {
      const usuario = await prisma.admUsuario.findUnique({
        where: {
          ca_id_firebase: decodedToken.uid,
        },
      });

      if (!usuario) {
        return reply.code(404).send({
          code: 404,
          erro: "Usuário não encontrado na base de dados",
        });
      }

      return reply.send({
        autenticado: true,
        usuario: {
          cn_usuario: usuario.cn_usuario.toString(),
          ca_id_firebase: usuario.ca_id_firebase,
          an_email: usuario.an_email,
          an_nome: usuario.an_nome,
          bo_sts_reg: usuario.bo_sts_reg,
        },
      });
    } catch (error) {
      request.log.error(
        { err: error },
        "Erro ao consultar usuário no banco de dados"
      );

      return reply.code(500).send({
        code: 500,
        erro: "Erro interno ao consultar o usuário." + error,
      });
    }
  });
}