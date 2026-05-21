import "server-only";

import { env } from "@/lib/env";

export const dbClientConfig = Object.freeze({
  connectionString: env.DATABASE_URL,
  directConnectionString: env.DATABASE_URL_DIRECT,
});
