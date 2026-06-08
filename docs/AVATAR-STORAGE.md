# Member avatar storage (Supabase)

Member profile avatars are stored in Supabase Storage bucket **`avatars`**.
The app uploads via the authenticated server Supabase client; public URLs are
saved in `profiles.avatar_url`.

## Dashboard setup (one-time per Supabase project)

1. Supabase Dashboard → **Storage** → **New bucket**
   - Name: `avatars`
   - **Public bucket**: enabled (public read for `<img src>`)
2. Open the bucket → **Policies** (or SQL Editor) and apply the policies below.

Or run this SQL in the Supabase SQL Editor to create the bucket, then apply the RLS
policies in the next section:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

## Local development: dev phone bypass

Avatar upload requires a **real Supabase Auth session** (SMS OTP verified). The local
dev phone bypass (`AUTH_DEV_PHONE_BYPASS_ENABLED=1`) does not set Supabase cookies, so
Storage RLS rejects writes even when the bucket exists.

To test avatar upload locally:

1. Create the `avatars` bucket and policies (above).
2. Leave `AUTH_DEV_PHONE_BYPASS_ENABLED` empty in `.env.local`.
3. Sign in with real SMS OTP on `/sign-in`.

The profile form disables photo upload while dev bypass is active and shows a hint.

## Object path convention

```
{supabase_user_id}/avatar
```

Example object key: `a1b2c3d4-....-uuid/avatar` (no file extension; content type set on upload)

The first path segment MUST match `auth.uid()` so RLS can restrict writes to
the signed-in member only.

## RLS policies (SQL)

Run in Supabase SQL Editor if the UI policy builder is insufficient:

```sql
-- Members upload/update/delete only their own folder
CREATE POLICY "avatars_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read (bucket is public; optional explicit SELECT for private buckets)
CREATE POLICY "avatars_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Application limits

Enforced in `src/features/profile/lib/upload-member-avatar.ts`:

| Rule        | Value                                      |
| ----------- | ------------------------------------------ |
| Max size    | 2 MB                                       |
| MIME types  | `image/jpeg`, `image/png`, `image/webp`    |
| Object key  | `{supabaseUserId}/avatar` (upsert on save) |

## Environment variables

No extra env vars. Uses existing:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

See [`docs/ENV.md`](./ENV.md).

## Troubleshooting

| Symptom | Likely cause |
| ------- | ------------ |
| "Photo upload requires SMS sign-in" (dev) | Signed in via dev phone bypass — use real OTP instead |
| Upload fails with storage policy error | Bucket missing, RLS not applied, or path segment ≠ `auth.uid()` |
| `User has no linked Supabase account` in app | `users.supabase_user_id` is null — user must sign in via Supabase Auth |
| Image 404 after upload | Bucket not public, or wrong public URL base |
| `Email already in use` on profile save | Another row already has that `users.email` (unique index) |

## Security notes

- Do not store sensitive documents in `avatars`; URLs are world-readable when the bucket is public.
- Phone numbers remain read-only on the member profile form (auth identifier).
