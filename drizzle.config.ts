import type { Config } from "drizzle-kit";

export default {
  schema: "./src/shared/storage/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "expo",
} satisfies Config;

