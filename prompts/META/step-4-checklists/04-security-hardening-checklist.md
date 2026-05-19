# step-4-checklists/04-security-hardening-checklist.md

## Title

Security — Hardening MVP

## Transport/Headers

- [ ] HTTPS везде; HSTS: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload.
- [ ] X-Content-Type-Options: nosniff; X-Frame-Options: DENY; Referrer-Policy: no-referrer.
- [ ] Permissions-Policy: запретить лишние пермишены.
- [ ] CSP: только нужные источники (self, Clerk, Stripe, Turnstile, Plausible). Обновлять при добавлении 3P.

## Auth/Session

- [ ] Clerk: email verification enabled; ADMIN — MFA enforced.
- [ ] Guard’ы на /member, /business, /admin — серверные.
- [ ] Нет секретов на клиенте; ключи только в env сервера/провайдера.

## Inputs/Abuse

- [ ] Cloudflare Turnstile — на критичных формaх (Submit Business, Introduction).
- [ ] Rate‑limit (Upstash) — submit/portal/cancel/public verify API.
- [ ] Валидация Zod + серверная повторная проверка.

## Payments/Webhooks

- [ ] Stripe Webhook: проверка подписи, идемпотентность (stripe_events), лог ошибок.
- [ ] Секреты Stripe разделены по окружениям (test/prod).

## Data/PII/Compliance

- [ ] Verify‑card публично — только разрешённые поля (без email/телефона/истории).
- [ ] Запрещённые категории (crypto/gambling/adult/firearms/unlicensed‑finance/high‑risk‑investments) — заблокированы в сабмите и при публикации.
- [ ] AuditLog — без PII в meta.

## Backups/Secrets

- [ ] Backups/PITR включены у провайдера БД; периодика документирована.
- [ ] Секреты — только через Vercel/GitHub Environments; нет в репозитории.
- [ ] Gitleaks и PR guard (high‑risk keywords) — в CI.

## Dependencies/Runtime

- [ ] pnpm audit (или экв.) — критичных уязвимостей нет.
- [ ] Логи не содержат PII; Sentry — без чувствительных данных.

Команды

```bash
pnpm audit
# Security scan workflows — должны проходить
```

## Acceptance

- [ ] Все заголовки безопасности и CSP применяются.
- [ ] MFA админов, rate‑limit и Turnstile активны.
- [ ] Stripe webhook защищён; идемпотентность работает.
- [ ] Бэкапы и секреты — по политикам; CI‑сканы зелёные.
