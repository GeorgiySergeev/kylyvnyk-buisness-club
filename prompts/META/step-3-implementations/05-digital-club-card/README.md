# step-3-implementations/05-digital-club-card/README.md

## Title

Implementations — Digital Club Card

## Objective

Реализовать цифровую клубную карту участника:

- Генерация уникального номера карты (TYPE-CC-XXXXXX) и привязка к пользователю
- Отображение карты в кабинете участника с QR‑кодом (ссылка на верификацию)
- Публичная страница верификации /verify-card/:number (без PII)
- Бейджи типа и статуса карты, кэширование публичной верификации

## Deliverables

- Генератор номера: ensureMemberCard(userId) — создает профиль/карту при необходимости (например, после оплаты)
- /member/card — страница в кабинете: номер карты, статус VIP, QR‑код для сканирования
- /verify-card/[number] — публичный ISR/dynamic роут: показывает только статус (Active/Inactive), тип (FREE/VIP/ADMIN), дату выдачи и expiration, и first_name/last_name_initial (PII скрыт)
- Интеграция с qrcode.react (генерация SVG)

## Guardrails

- Страница верификации не должна возвращать email, phone или точное местоположение; только минимальные данные для подтверждения личности.
- В MVP нет Apple Wallet / Google Pay, только веб‑карта с QR.
