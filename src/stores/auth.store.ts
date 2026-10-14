
import type { FastifyReply, FastifyRequest } from "fastify";
import type { DecodedIdToken } from "firebase-admin/auth";
import { firebaseAuth } from "../firebase-admin.js";

export async function validateToken(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<DecodedIdToken | null> {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    reply.code(401).send({
      code: 401,
      erro: "Token de autenticação não informado.",
    });

    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    reply.code(401).send({
      code: 401,
      erro: "Token de autenticação inválido.",
    });

    return null;
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(
      token,
      true
    );

    return decodedToken;
  } catch (error) {
    request.log.warn(
      { err: error },
      "Token Firebase inválido, expirado ou revogado."
    );

    reply.code(401).send({
      code: 401,
      erro: "Token inválido, expirado ou revogado.",
    });

    return null;
  }
}
