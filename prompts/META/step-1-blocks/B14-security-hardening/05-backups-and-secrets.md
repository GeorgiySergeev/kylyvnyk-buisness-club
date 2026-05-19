# 05-backups-and-secrets.md

## Title

Backups & Secrets — DB snapshots, encrypted offsite, and env hygiene

## Objective

Ensure data resilience and secret hygiene:

- Automated DB backups/snapshots.
- Optional offsite encrypted dumps.
- Proper management of environment secrets across environments.

## Steps

1) Prefer managed backups:
   - Neon/Supabase: enable PITR/scheduled snapshots (daily).
2) Optional: nightly pg_dump to object storage (R2/S3) with encryption.
3) Enforce secrets hygiene: .env handling, Vercel envs, GitHub environments.

## Files to add

- scripts/backup/pgdump.sh
- docs/ops/backups.md
- docs/ops/secrets.md

### scripts/backup/pgdump.sh

```bash
#!/usr/bin/env bash
set -euo pipefail

# Requires env: DATABASE_URL, BACKUP_BUCKET_URL (rclone compatible), GPG_PUBLIC_KEY (optional)
TS=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
OUT="db-backup-$TS.sql.gz"

echo "[*] Starting pg_dump..."
pg_dump --no-owner --no-privileges --format=plain "$DATABASE_URL" | gzip -9 > "$OUT"

if [[ -n "${GPG_PUBLIC_KEY:-}" ]]; then
  echo "[*] Encrypting with GPG public key..."
  echo "$GPG_PUBLIC_KEY" | gpg --import
  gpg --yes --output "${OUT}.gpg" --encrypt --recipient "$(gpg --with-colons --list-keys | awk -F: '/^uid:/ { print $10; exit }')" "$OUT"
  rm "$OUT"
  OUT="${OUT}.gpg"
fi

if [[ -n "${BACKUP_BUCKET_URL:-}" ]]; then
  echo "[*] Uploading to $BACKUP_BUCKET_URL"
  rclone copy "$OUT" "$BACKUP_BUCKET_URL"
fi

echo "[*] Done: $OUT"
```

### docs/ops/backups.md

```md
# Backups

- Primary: Enable managed backups (Neon/Supabase) with daily snapshots and PITR if available.
- Secondary (optional): Nightly pg_dump via cron/CI to R2/S3 with GPG encryption.
- Test restores quarterly:
  - Create a temporary DB, restore from latest snapshot/dump, run smoke migrations.
- Retention: 7 daily + 4 weekly + 3 monthly (adjust per compliance).
```

### docs/ops/secrets.md

```md
# Secrets Hygiene

- Use Vercel environment variables for prod/staging; restrict edit access.
- Never commit .env.* to Git; .env.example only (no secrets).
- Rotate keys on incident or staff changes.
- Limit blast radius:
  - Separate Stripe keys per environment.
  - Separate Redis/DB per environment.
- Audit:
  - Review access logs monthly.
  - Remove unused secrets and revoke stale tokens.
```

## Acceptance

- Managed backups enabled (screenshots/notes in ops doc).
- Optional dump script exists and documented; restore tested at least once.
- No secrets in repo; environments isolated (dev/staging/prod).
