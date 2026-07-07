/*
# Add Login Notification RPC

1. Purpose
   - Create an RPC function `notify_user_login()` that the frontend calls after a successful sign-in.
   - The function:
     a) Creates an in-app "Welcome back" notification for the user.
     b) Logs a "login" activity log entry.
     c) Updates the `last_login` timestamp on the user's profile.
   - Also notify admins when a user logs in (optional, for monitoring).

2. New Functions
   - `public.notify_user_login()` — SECURITY DEFINER, callable by authenticated users.
     Takes no arguments; uses `auth.uid()` to identify the caller.

3. Security
   - SECURITY DEFINER so the function can insert into notifications and activity_logs (which have RLS).
   - The function only acts on the calling user's own data (auth.uid()).
   - Granted EXECUTE to the `authenticated` role.

4. Notes
   - The frontend calls this via `supabase.rpc('notify_user_login')` right after sign-in.
   - Idempotent: re-running the migration just replaces the function.
*/
CREATE OR REPLACE FUNCTION public.notify_user_login()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_user_id   uuid := auth.uid();
  v_email     text;
  v_name      text;
BEGIN
  -- Only proceed if we have an authenticated user
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Get user details
  SELECT email, full_name INTO v_email, v_name
  FROM profiles WHERE id = v_user_id;

  -- Update last_login timestamp
  UPDATE profiles SET last_login = now() WHERE id = v_user_id;

  -- Create "Welcome back" in-app notification
  INSERT INTO notifications (user_id, title, message, type, read)
  VALUES (
    v_user_id,
    'Welcome back!',
    'You have successfully signed in to the TSDPL BI Portal at ' || to_char(now(), 'HH:MI AM on DD Mon YYYY') || '.',
    'info',
    false
  );

  -- Log the login activity
  INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    v_user_id,
    'login',
    'auth',
    v_user_id,
    jsonb_build_object('email', v_email, 'timestamp', now())
  );
END;
$function$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.notify_user_login() TO authenticated;
