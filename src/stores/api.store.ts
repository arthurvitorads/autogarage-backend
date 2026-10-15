
import type {
  FastifyInstance,
  FastifyRequest,
} from "fastify";

import { ApiError } from "../interfaces/error.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

type GetHandler<T> = ( request: FastifyRequest ) => Promise<T> | T;

export function apiPost<T>(app: FastifyInstance, route: string, handler: GetHandler<T>, successStatus: 200 | 201 = 201) {
  app.post(route, { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const dados = await handler(request);
      return reply.code(successStatus).send({ sucesso: true, dados });
    } catch (error) {
      if (error instanceof ApiError) {
        return reply.code(error.statusCode).send({ sucesso: false, code: error.statusCode, erro: error.message });
      }
      request.log.error({ err: error }, `Erro no POST ${route}`);
      return reply.code(500).send({ sucesso: false, code: 500, erro: 'Erro interno ao processar requisição.' });
    }
  });
}

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
