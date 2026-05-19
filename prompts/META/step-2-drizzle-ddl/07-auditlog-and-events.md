# step-2-drizzle-ddl/07-auditlog-and-events.md

## Title

AuditLog — Minimal Trail

## Objective

Наблюдаемость изменений: актор, действие, сущность, метаданные (без PII).

## DDL

```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action varchar(120) NOT NULL,
  entity varchar(120) NOT NULL,
  entity_id varchar(191) NOT NULL,
  ip varchar(64),
  user_agent text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id);
```

## Notes

- meta — только non-PII: id/enum/флаги/короткие описания.
- admin-лог просмотр — только через защищённый интерфейс.
