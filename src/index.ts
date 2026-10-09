
import "dotenv/config";

import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import { prisma } from "./prisma.js";

import { authRoutes } from "./routes/auth.js";

const app = Fastify({
  logger: true,
});

async function main() {
  await app.register(cors, {
    origin: true,
  });

  await app.register(helmet);

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  await app.register(authRoutes);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen({ port, host });
}

main().catch((error) => {
  app.log.error(error);
  process.exitCode = 1;
});