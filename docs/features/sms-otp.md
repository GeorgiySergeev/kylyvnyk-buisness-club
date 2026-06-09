# Боевой SMS Auth Для KCLUB

## Summary

Реализовать production-ready phone-first auth на текущей архитектуре Supabase Auth + `@supabase/ssr`, с выбранными решениями:

- Access model: **pre-approved only**. Публичный UI не создает нового member из неизвестного телефона.
- SMS provider: **Supabase Auth built-in SMS OTP**. Провайдер SMS настраивается в Supabase Dashboard, без нового Twilio-кода в приложении.
- Abuse policy: **fail closed**. Если Turnstile или Upstash недоступны в production, SMS не отправляется.

Ключевая цель: пользователь с заранее созданным `users.phone` подтверждает телефон через SMS, получает Supabase session, а app-user связывается по `supabase_user_id`. Неизвестные телефоны не создают member/account.

## Key Changes

- Обновить `requestPhoneOtpAction`:
  - Для `sign-in` и `sign-up/claim` требовать существующий `users.phone`.
  - Вызов Supabase OTP делать с `shouldCreateUser: false` / эквивалентным `create_user=false`, чтобы sign-in не создавал Auth user для неизвестного телефона.
  - Перед отправкой SMS проверять Zod, Turnstile, Upstash, intent/access policy.
  - Ошибки возвращать типизированно: unknown phone, rate limited, captcha failed, OTP send failed.

- Обновить `verifyPhoneOtpAction`:
  - После `verifyOtp({ phone, token, type: 'sms' })` брать verified Supabase identity через `getAuthIdentity()`.
  - Искать существующего app-user по `supabase_user_id` или `phone`.
  - Если app-user найден, атомарно привязать `supabase_user_id`, создать недостающие profile/free membership/card только для pre-approved записи, затем редиректить через `resolvePostAuthRedirect`.
  - Если app-user не найден или inactive/banned/deleted, сразу `supabase.auth.signOut()` и вернуть typed error без создания записи.

- Пересобрать семантику `/sign-up`:
  - Сделать ее “claim pre-approved access”, а не open registration.
  - Обновить copy в `messages/en|ru|uk/auth.json`: неизвестный телефон должен говорить, что доступ еще не создан/не одобрен, а не предлагать свободную регистрацию.
  - Обновить `docs/STACK-DECISION.md`, потому что live-код уже разошелся с ADR-строкой про redirect `/sign-up`.

- Усилить anti-abuse и observability:
  - Привести `checkSmsOtpRateLimit` к `rl:*` prefix и fail-closed behavior в production, как уже описано в `docs/ENV.md`.
  - Не логировать полный phone/IP; использовать безопасный hash или suffix-only metadata.
  - Добавить audit event для успешного phone claim/link без публичного раскрытия PII.

## Public Interfaces / Types

- Сохранить public server action API:
  - `requestPhoneOtpAction(locale, intent, rawInput)`
  - `verifyPhoneOtpAction(locale, intent, rawInput)`
  - `devBypassPhoneAuthAction(locale, intent, rawInput)`

- Уточнить auth intent модель:
  - `sign-in`: existing phone only.
  - `sign-up`: pre-approved claim only, existing phone required.
  - Unknown phone error становится отдельным production-safe code/message, например `ACCOUNT_NOT_APPROVED`.

- Новых env vars не добавлять: Supabase SMS provider credentials настраиваются в Supabase Dashboard, приложение использует уже существующие `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Test Plan

- Unit tests:
  - unknown phone cannot request OTP for sign-in or sign-up/claim.
  - existing phone can request OTP with Supabase `create_user=false`.
  - rate-limit and Turnstile failures block OTP in production.
  - verify OTP links existing phone-only user to Supabase identity.
  - verify OTP signs out and errors if Supabase session has no matching app-user.

- Integration/action tests with mocked Supabase:
  - OTP send failure maps to typed client-safe error.
  - OTP verify failure does not mutate app DB.
  - inactive/banned/deleted users cannot complete auth.
  - dev bypass remains non-production only.

- Regression gates:
  - `pnpm test:auth`
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm env:check`
  - `pnpm vocab:check`
  - `pnpm build`

## Variants Considered

- **Supabase built-in SMS OTP**: chosen. Minimal code, matches current ADR and SSR cookie setup.
- **Custom Twilio OTP**: rejected for v1. More control, but requires custom code storage, expiry, replay prevention, resend policy, SMS templates, fraud controls, and extra secrets.
- **Supabase WhatsApp OTP**: possible later, but not first production SMS release.
- **Open member registration**: rejected. It would create member records from public phones and conflicts with the selected pre-approved access model.
- **Hybrid abuse fail-open**: rejected. Production SMS cost/risk is higher than the UX benefit.
