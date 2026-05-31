# KCLUB MVP — Routes Audit Report
> Сверка: SPEC.md + kclub-routes-map.html → реальная файловая структура `src/app`
> Дата: 2026-05-31

---

## Легенда
- ✅ **Реализовано** — маршрут/файл существует
- ⚠️ **Расхождение** — есть, но не совпадает с доком
- ❌ **Отсутствует** — в SPEC/карте указано, в коде нет
- ➕ **Лишнее** — в коде есть, в SPEC/карте нет

---

## 1. Публичный маркетинг

| Route (SPEC) | Filesystem | Статус |
|---|---|---|
| `/{locale}` (Home) | `src/app/[locale]/page.tsx` | ✅ |
| `/{locale}/directory` | `src/app/[locale]/directory/page.tsx` | ✅ |
| `/{locale}/directory/[slug]` | `src/app/[locale]/directory/[slug]/` | ✅ |
| `/{locale}/verify-card` | `src/app/[locale]/verify-card/page.tsx` | ✅ |
| `/{locale}/verify-card/[number]` | `src/app/[locale]/verify-card/[number]/` | ✅ |

**Итог секции: 5/5 ✅**

---

## 2. Аутентификация (Supabase Auth)

| Route (SPEC) | Filesystem | Статус |
|---|---|---|
| `/{locale}/sign-in` | `src/app/[locale]/sign-in/page.tsx` | ✅ |
| `/{locale}/sign-up` | `src/app/[locale]/sign-up/page.tsx` | ✅ |
| `/{locale}/sign-out` | `src/app/[locale]/sign-out/page.tsx` | ✅ |
| `/{locale}/m/onboarding` | `src/app/[locale]/m/onboarding/page.tsx` | ✅ |

**Итог секции: 4/4 ✅**

---

## 3. Member Area (`/m/*`)

| Route (SPEC) | Filesystem | Статус |
|---|---|---|
| `/{locale}/m/dashboard` | `src/app/[locale]/m/dashboard/page.tsx` | ✅ |
| `/{locale}/m/introduce` | `src/app/[locale]/m/introduce/page.tsx` | ✅ |
| `/{locale}/m/2fa-required` | `src/app/[locale]/m/2fa-required/page.tsx` | ✅ |

**Итог секции: 3/3 ✅**

### Маршруты из routes-map, которых нет в SPEC (добавлены в схему, но SPEC не упоминает)

| Route (routes-map) | Filesystem | Статус |
|---|---|---|
| `/m/card` | **НЕ НАЙДЕН** в `src/app/[locale]/m/` | ❌ |
| `/m/profile` | **НЕ НАЙДЕН** в `src/app/[locale]/m/` | ❌ |
| `/m/subscription` | **НЕ НАЙДЕН** в `src/app/[locale]/m/` | ❌ |
| `/m/my-business` | **НЕ НАЙДЕН** в `src/app/[locale]/m/` | ❌ |
| `/m/business/new` | `src/app/[locale]/m/business/new/` | ✅ |

> [!WARNING]
> **4 маршрута из routes-map (`/m/card`, `/m/profile`, `/m/subscription`, `/m/my-business`)** не реализованы как отдельные страницы.
> Возможно, эти секции интегрированы внутри `/m/dashboard` как conditional UI-блоки (что допускает SPEC: "Dashboard sections — same route, role-gated UI").
> Однако routes-map трактует их как **самостоятельные роуты**, что создаёт UX-расхождение.

### Маршруты, которые есть в коде, но не в SPEC/routes-map (➕ Лишние / нераскрытые)

| Filesystem | Примечание |
|---|---|
| `src/app/[locale]/m/checkout/cancel/` | Страница отмены checkout — не в SPEC |
| `src/app/[locale]/m/checkout/success/` | Страница успешного checkout — не в SPEC |
| `src/app/[locale]/(business)/b/` | Route group `/b/*` — упоминается в SPEC как "business tools (`/b/*`, when split from member)", **не реализован полноценно** |
| `src/app/[locale]/(member)/m/` | Дублирующий route group — вероятно legacy или незавершённый |

---

## 4. Юридические страницы (`/legal/*`)

| Route (SPEC) | Filesystem | Статус |
|---|---|---|
| `/{locale}/legal/terms` | `src/app/[locale]/legal/terms/` | ✅ |
| `/{locale}/legal/privacy` | `src/app/[locale]/legal/privacy/` | ✅ |
| `/{locale}/legal/cookie` | `src/app/[locale]/legal/cookie/` | ✅ |
| `/{locale}/legal/refund` | `src/app/[locale]/legal/refund/` | ✅ |
| `/{locale}/legal/rules/club` | `src/app/[locale]/legal/rules/club/` | ✅ |
| `/{locale}/legal/rules/partner` | `src/app/[locale]/legal/rules/partner/` | ✅ |
| `/{locale}/legal/rules/introduction` | `src/app/[locale]/legal/rules/introduction/` | ✅ |
| `/{locale}/legal/disclaimer` | `src/app/[locale]/legal/disclaimer/` | ✅ |
| `/{locale}/legal/contact` | `src/app/[locale]/legal/contact/` | ✅ |

**Итог секции: 9/9 ✅**

---

## 5. Admin (`/admin/*`)

### В SPEC

| Route (SPEC) | Filesystem | Статус |
|---|---|---|
| `/{locale}/admin` | `src/app/[locale]/admin/page.tsx` | ✅ |
| `/{locale}/admin/users` | `src/app/[locale]/admin/users/` | ✅ |
| `/{locale}/admin/businesses` | `src/app/[locale]/admin/businesses/` | ✅ |
| `/{locale}/admin/introductions` | `src/app/[locale]/admin/introductions/` | ✅ |
| `/{locale}/admin/cards` | `src/app/[locale]/admin/cards/` | ✅ |
| `/{locale}/admin/categories` | `src/app/[locale]/admin/categories/` | ✅ |
| `/{locale}/admin/countries` | `src/app/[locale]/admin/countries/` | ✅ |
| `/{locale}/admin/stripe-links` | `src/app/[locale]/admin/stripe-links/` | ✅ |
| `/{locale}/admin/subscriptions` | `src/app/[locale]/admin/subscriptions/` | ✅ |
| `/{locale}/admin/audit` | `src/app/[locale]/admin/audit/` | ✅ |

**Итог секции: 10/10 ✅**

### Дополнительные admin-маршруты (➕ в коде, не в SPEC)

| Filesystem | Примечание |
|---|---|
| `/admin/catalog` | Не в SPEC — возможно дублирует `/directory` |
| `/admin/cities` | Не в SPEC — справочник городов (рядом с `countries`) |
| `/admin/memberships` | Не в SPEC — управление членствами |
| `/admin/roles` | Не в SPEC — SuperAdmin only, виден только при `isSuperAdmin` |

> [!NOTE]
> Эти 4 маршрута реально работают (файлы есть), просто не задокументированы в SPEC/routes-map. Нужно либо добавить их в документацию, либо убедиться, что они в скоупе MVP.

---

## 6. Системные маршруты

| Surface (SPEC) | Filesystem | Статус |
|---|---|---|
| `not-found.tsx` | `src/app/[locale]/not-found.tsx` | ✅ |
| `error.tsx` | `src/app/[locale]/error.tsx` | ✅ |
| `/sitemap.xml` | **НЕ НАЙДЕН** в `src/app/` | ❌ |
| `/robots.txt` | **НЕ НАЙДЕН** в `src/app/` или `public/` | ❌ |
| `/api/stripe/webhook` | `src/app/api/stripe/webhook/route.ts` | ✅ |

> [!CAUTION]
> **`/sitemap.xml` и `/robots.txt` отсутствуют**. `robots.txt` критичен — SPEC требует `Disallow: /admin, /m, /api`. Без него поисковики могут индексировать приватные маршруты.

---

## 7. Access Control / Middleware

| Требование (SPEC/AGENTS.md) | Реализация | Статус |
|---|---|---|
| `/m/*` защищено — redirect на `/sign-in` | `middleware.ts` → `PROTECTED_ROUTE_PATTERN = /^\/(en\|ru\|uk)\/(?:m\|admin)(?:\/\|$)/` | ✅ |
| `/admin/*` защищено + 2FA | `admin/layout.tsx` → `guardAdmin()` → `hasVerifiedMfaInSession()` | ✅ |
| Admin redirect на `/m/2fa-required` если нет MFA | `role-guards.ts` → `decision === 'REDIRECT_MFA'` | ✅ |
| Non-admin redirect на `/` из admin | `role-guards.ts` → `decision === 'REDIRECT_HOME'` | ✅ |
| Onboarding gate | `guardOnboarded()` → redirect `/m/onboarding` | ✅ |
| `robots: noindex` на `verify-card` | `verify-card/[number]/page.tsx` → `export const metadata = { robots: { index: false, follow: false } }` | ✅ |
| Middleware не блокирует публичные маршруты | `if (!isProtectedRoute(pathname)) return response` | ✅ |

---

## 8. Routes-map vs SPEC: расхождения в доктрине

| Расхождение | routes-map | SPEC | Вердикт |
|---|---|---|---|
| `/m/card` как отдельная страница | Есть отдельным роутом | Нет — dashboard section | ❌ **Не реализовано как роут** |
| `/m/profile` как отдельная страница | Есть отдельным роутом | Нет — dashboard section | ❌ **Не реализовано как роут** |
| `/m/subscription` как отдельная страница | Есть отдельным роутом | Только dashboard cancellation | ❌ **Не реализовано как роут** |
| `/m/my-business` | Есть отдельным роутом | Нет явно | ❌ **Не реализовано как роут** |
| `Business Introductions` — кто имеет доступ | routes-map: VIP + BUSINESS | SPEC: VIP + BUS | ✅ Совпадает |
| `/m/2fa-required` | Не указан в routes-map | Есть в SPEC | ⚠️ Пропущен в визуальной карте |

---

## Итоговая матрица

| Категория | SPEC routes | Реализовано | Отсутствует |
|---|---|---|---|
| Публичный маркетинг | 5 | 5 ✅ | 0 |
| Auth | 4 | 4 ✅ | 0 |
| Member area (`/m/*`) | 3 (SPEC) / 8 (map) | 4 | 4 из routes-map |
| Legal | 9 | 9 ✅ | 0 |
| Admin | 10 | 10 ✅ | 0 |
| System | 5 | 3 | sitemap.xml, robots.txt |
| **TOTAL** | **36** | **35** | **6** |

---

## Рекомендации по приоритетам

### 🔴 Критично
1. **`/robots.txt`** — создать `src/app/robots.ts` (Next.js 15 metadata route), добавить `Disallow: /admin, /m, /api`.
2. **`/sitemap.xml`** — создать `src/app/sitemap.ts`, включить `/directory/[slug]` динамически.

### 🟡 Среднее
3. **`/m/card`, `/m/profile`, `/m/subscription`, `/m/my-business`** — решить архитектурно: либо создать отдельные страницы (как в routes-map), либо обновить routes-map, убрав их как самостоятельные роуты и пометив как dashboard sections.
4. **`/m/2fa-required`** — добавить в routes-map визуальную карту.

### 🟢 Низкое
5. **`/admin/catalog`, `/admin/cities`, `/admin/memberships`, `/admin/roles`** — задокументировать в SPEC или добавить в routes-map.
6. **`/m/checkout/success`, `/m/checkout/cancel`** — задокументировать как Stripe redirect pages.
7. **`verify-card` `robots: noindex`** — проверить `generateMetadata` в `verify-card/[number]/page.tsx`.
