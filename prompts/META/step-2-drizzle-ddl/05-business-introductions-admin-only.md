# step-2-drizzle-ddl/05-business-introductions-admin-only.md

## Title

Business Introductions — VIP-only, Admin-managed

## Objective

Структура заявок на Business Introduction (без выплат/MLM/affiliate механик).

## DDL

```sql
CREATE TYPE introduction_status AS ENUM ('DRAFT','SUBMITTED','APPROVED','REJECTED','CLOSED');

CREATE TABLE introductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  status introduction_status NOT NULL DEFAULT 'DRAFT',
  internal_notes varchar(1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_introductions_creator ON introductions(created_by_user_id);
CREATE INDEX idx_introductions_business ON introductions(target_business_id);
```

## Notes

- Управление статусами — только через админ-панель.
- Публичные лимиты/рейтинги/уровни — отсутствуют в MVP.
