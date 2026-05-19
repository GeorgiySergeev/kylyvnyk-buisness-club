# 05-minimal-load-smoke.md

## Title

Minimal Load Smoke — / and /catalog under light concurrency

## Objective

Run a short load smoke to catch obvious regressions (TTFB spikes, 5xx).

## Tools

- oha or autocannon

## Commands

```bash
pnpm add -D oha
npx oha -z 20s -c 20 http://localhost:3000/
npx oha -z 20s -c 20 http://localhost:3000/catalog
```

## Docs

### docs/qa/load-smoke.md

```md
# Load Smoke
- Warm server with 5 requests.
- Run 20s at 20 concurrency.
- Expect < 1% 5xx, median TTFB under 300ms locally (hardware dependent).
- Investigate 5xx via server logs/Sentry.
```

## Acceptance

- No 5xx spikes.
- Latencies stable and within expectations for dev.
