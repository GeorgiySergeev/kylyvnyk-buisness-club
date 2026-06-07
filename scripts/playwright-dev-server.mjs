import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const port = process.argv[2] ?? '3101';
const nextBin = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));

process.env.AUTH_DEV_PHONE_BYPASS_ENABLED = '1';
process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://example@o0.ingest.sentry.io/0';
process.env.SENTRY_DSN = 'https://example@o0.ingest.sentry.io/0';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'development';
process.env.PORT = port;

process.argv = [process.execPath, nextBin, 'dev'];

createRequire(import.meta.url)(nextBin);
