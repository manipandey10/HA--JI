-- Fix recursive profiles policy
-- The old policy was calling SELECT from profiles inside profiles policy - infinite recursion!
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (
    auth.uid() = id
    OR (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'admin'
  );

-- Fix ideas policies too - they also have recursive profiles lookups
-- Use security definer function to avoid recursion
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = user_id LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Refresh ideas policies to use the helper function
DROP POLICY IF EXISTS "ideas_select_own" ON ideas;
CREATE POLICY "ideas_select_own" ON ideas FOR SELECT
  TO authenticated USING (
    auth.uid() = submitter_id
    OR get_user_role(auth.uid()) IN ('admin', 'reviewer')
  );

DROP POLICY IF EXISTS "ideas_update_own" ON ideas;
CREATE POLICY "ideas_update_own" ON ideas FOR UPDATE
  TO authenticated USING (
    auth.uid() = submitter_id
    OR get_user_role(auth.uid()) IN ('admin', 'reviewer')
  );

DROP POLICY IF EXISTS "ideas_delete_own" ON ideas;
CREATE POLICY "ideas_delete_own" ON ideas FOR DELETE
  TO authenticated USING (
    auth.uid() = submitter_id
    OR get_user_role(auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "workflow_select_own" ON workflow_stages;
CREATE POLICY "workflow_select_own" ON workflow_stages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM ideas WHERE ideas.id = workflow_stages.idea_id AND ideas.submitter_id = auth.uid())
    OR get_user_role(auth.uid()) IN ('admin', 'reviewer')
  );

DROP POLICY IF EXISTS "workflow_insert_own" ON workflow_stages;
CREATE POLICY "workflow_insert_own" ON workflow_stages FOR INSERT
  TO authenticated WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'reviewer')
  );

DROP POLICY IF EXISTS "workflow_update_own" ON workflow_stages;
CREATE POLICY "workflow_update_own" ON workflow_stages FOR UPDATE
  TO authenticated USING (
    get_user_role(auth.uid()) IN ('admin', 'reviewer')
  );

DROP POLICY IF EXISTS "logs_select_own" ON activity_logs;
CREATE POLICY "logs_select_own" ON activity_logs FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR get_user_role(auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "email_queue_select" ON email_queue;
CREATE POLICY "email_queue_select" ON email_queue FOR SELECT
  TO authenticated USING (
    get_user_role(auth.uid()) = 'admin'
  );