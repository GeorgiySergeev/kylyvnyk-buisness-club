CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_users_updated_at'
      AND tgrelid = '"users"'::regclass
  ) THEN
    CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON "users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_profiles_updated_at'
      AND tgrelid = 'profiles'::regclass
  ) THEN
    CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON "profiles"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_businesses_updated_at'
      AND tgrelid = 'businesses'::regclass
  ) THEN
    CREATE TRIGGER set_businesses_updated_at
    BEFORE UPDATE ON "businesses"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_club_cards_updated_at'
      AND tgrelid = 'club_cards'::regclass
  ) THEN
    CREATE TRIGGER set_club_cards_updated_at
    BEFORE UPDATE ON "club_cards"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_introductions_updated_at'
      AND tgrelid = 'introductions'::regclass
  ) THEN
    CREATE TRIGGER set_introductions_updated_at
    BEFORE UPDATE ON "introductions"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
