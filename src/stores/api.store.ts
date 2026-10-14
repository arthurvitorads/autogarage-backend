
import type {
  FastifyInstance,
  FastifyRequest,
} from "fastify";

import { ApiError } from "../interfaces/error.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

type GetHandler<T> = ( request: FastifyRequest ) => Promise<T> | T;

export function apiGet<T>( app: FastifyInstance, rote: string, fncRequest: GetHandler<T>) {
  app.get(
    rote,
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const response = await fncRequest(request);

        return reply.code(200).send({
          sucesso: true,
          dados: response,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          return reply.code(error.statusCode).send({
            sucesso: false,
            code: error.statusCode,
            erro: error.message,
          });
        }

        request.log.error(
          { err: error },
          `Erro no GET ${rote}`
        );

        return reply.code(500).send({
          sucesso: false,
          code: 500,
          erro: "Erro interno ao processar requisição.",
        });
      }
    }
  );
}
