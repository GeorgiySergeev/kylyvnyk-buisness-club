DROP INDEX IF EXISTS "memberships_user_plan_active_ux";

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, plan_code
      ORDER BY
        CASE WHEN deleted_at IS NULL THEN 0 ELSE 1 END,
        updated_at DESC,
        created_at DESC
    ) AS row_number
  FROM memberships
)
UPDATE memberships
SET
  deleted_at = COALESCE(deleted_at, now()),
  status = CASE WHEN status = 'ACTIVE' THEN 'INACTIVE' ELSE status END,
  updated_at = now()
FROM ranked
WHERE memberships.id = ranked.id
  AND ranked.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "memberships_user_plan_ux"
  ON "memberships" ("user_id", "plan_code")
  WHERE "deleted_at" IS NULL;

UPDATE memberships
SET
  ends_at = COALESCE(ends_at, now()),
  status = 'INACTIVE',
  updated_at = now()
WHERE plan_code = 'FREE'
  AND status = 'ACTIVE'
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM memberships vip
    WHERE vip.user_id = memberships.user_id
      AND vip.plan_code = 'VIP'
      AND vip.status = 'ACTIVE'
      AND vip.deleted_at IS NULL
      AND (vip.ends_at IS NULL OR vip.ends_at >= now())
  );

UPDATE memberships
SET
  ends_at = NULL,
  status = 'ACTIVE',
  updated_at = now()
FROM users
WHERE memberships.user_id = users.id
  AND memberships.plan_code = 'FREE'
  AND memberships.deleted_at IS NULL
  AND users.deleted_at IS NULL
  AND users.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1
    FROM memberships vip
    WHERE vip.user_id = users.id
      AND vip.plan_code = 'VIP'
      AND vip.status = 'ACTIVE'
      AND vip.deleted_at IS NULL
      AND (vip.ends_at IS NULL OR vip.ends_at >= now())
  );

INSERT INTO memberships (user_id, plan_code, status, starts_at, created_at, updated_at)
SELECT users.id, 'FREE', 'ACTIVE', now(), now(), now()
FROM users
WHERE users.deleted_at IS NULL
  AND users.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1
    FROM memberships existing
    WHERE existing.user_id = users.id
      AND existing.plan_code = 'FREE'
      AND existing.deleted_at IS NULL
  )
  AND NOT EXISTS (
    SELECT 1
    FROM memberships vip
    WHERE vip.user_id = users.id
      AND vip.plan_code = 'VIP'
      AND vip.status = 'ACTIVE'
      AND vip.deleted_at IS NULL
      AND (vip.ends_at IS NULL OR vip.ends_at >= now())
  );
