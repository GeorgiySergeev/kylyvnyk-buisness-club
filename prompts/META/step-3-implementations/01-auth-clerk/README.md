# 01-auth-clerk/README.md

## Title

Implementations — Auth (Clerk)

## Objective

Подключить Clerk в Next.js (App Router), развернуть базовые страницы аутентификации, настроить middleware и серверные guard’ы (FREE/VIP/ADMIN), а также MFA-требование для админов и пример защищённых API/Server Actions.

## Deliverables

- ClerkProvider в RootLayout
- middleware.ts с publicRoutes, redirect c auth-страниц и каноникализацией слеша
- Страницы /sign-in и /sign-up (App Router)
- Серверные хелперы (auth/server/guards.ts)
- Настройка защиты от ботов (Cloudflare Turnstile) для страниц входа

## Guardrails

- Все Server Actions и Route Handlers должны начинаться с проверок `auth().userId`.
- Администраторы обязаны использовать MFA.
- Редирект авторизованных со страниц `/sign-in` на дашборд.
