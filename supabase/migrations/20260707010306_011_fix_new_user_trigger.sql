-- Fix handle_new_user trigger - make it robust with conflict handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'employee',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the auth signup
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also fix the email unique constraint - it should not block signup
-- Remove old unique constraint on email if it causes issues
-- Instead ensure uniqueness only on id (which is already the PK)
DO $$
BEGIN
  -- Check if email unique constraint exists and drop it if causing conflicts
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_email_key' AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_email_key;
    -- Re-add as a partial unique index that ignores soft-deleted users
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON profiles(email) WHERE is_active = true;
  END IF;
END $$;