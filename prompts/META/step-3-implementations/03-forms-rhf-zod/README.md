# step-3-implementations/03-forms-rhf-zod/README.md

## Title

Implementations — Forms (RHF + Zod)

## Objective

Единая система форм на React Hook Form + Zod: схема-валидатор как единый источник правды, доступность (aria-describedby, focus-visible), переиспользуемые контролы, и паттерны валидации для доменных сущностей (email/url/slug/phone и т.п.).

## Deliverables

- Базовая обвязка RHF+Zod (FormProvider + resolver)
- Общие FormField-компоненты (лейбл/хелп/ошибки) и контролы (Input/Textarea/Select)
- Zod-схемы (валидаторы) для распространенных данных (url, phone, category)
- Универсальный дизайн-паттерн нейтрального отображения ошибок с aria

## Guardrails

- Для всех полей указывать `aria-invalid` и `aria-describedby` для привязки сообщений об ошибках к screen reader'у.
- Использовать Server Actions + `zod.safeParse` на бэкенде для двойной проверки (в B04 Business CRUD).
