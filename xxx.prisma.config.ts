import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    url: env("DATABASE_URL"),
    directUrl: env("DIRECT_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
