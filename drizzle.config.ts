import { config } from "dotenv";

import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config();

const databaseUrlDirect = process.env.DATABASE_URL_DIRECT?.trim();

if (!databaseUrlDirect) {
  throw new Error("DATABASE_URL_DIRECT is missing");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrlDirect,
  },
  verbose: true,
  strict: true,
});
