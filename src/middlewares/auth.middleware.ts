
import type { FastifyReply, FastifyRequest } from "fastify";
import { validateToken } from "../stores/auth.store.js";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const decodedToken = await validateToken(request, reply);

  if (!decodedToken) return;

  request.firebaseUser = decodedToken;
}
