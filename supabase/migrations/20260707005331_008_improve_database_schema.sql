-- Add user management improvements
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Add more fields to ideas table
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(15,2);
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS actual_value DECIMAL(15,2);
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS target_end_date DATE;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS actual_end_date DATE;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS assigned_reviewer_id UUID REFERENCES auth.users(id);
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Create comments/feedback table
CREATE TABLE IF NOT EXISTS idea_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  comment_type TEXT DEFAULT 'feedback' CHECK (comment_type IN ('feedback', 'question', 'approval', 'rejection')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE idea_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_own" ON idea_comments FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM ideas WHERE ideas.id = idea_comments.idea_id AND ideas.submitter_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'reviewer'))
  );

CREATE POLICY "comments_insert_own" ON idea_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own" ON idea_comments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "comments_delete_own" ON idea_comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Create attachments table
CREATE TABLE IF NOT EXISTS idea_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE idea_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attachments_select" ON idea_attachments FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM ideas WHERE ideas.id = idea_attachments.idea_id AND ideas.submitter_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'reviewer'))
  );

CREATE POLICY "attachments_insert" ON idea_attachments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attachments_delete" ON idea_attachments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_department ON ideas(department);
CREATE INDEX IF NOT EXISTS idx_ideas_assigned_reviewer ON ideas(assigned_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_idea ON idea_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_attachments_idea ON idea_attachments(idea_id);

-- Update profiles RLS to allow admins to view all profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (
    auth.uid() = id 
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Add function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_ideas', (SELECT COUNT(*) FROM ideas WHERE submitter_id = user_id),
    'pending_ideas', (SELECT COUNT(*) FROM ideas WHERE submitter_id = user_id AND status NOT IN ('approved', 'rejected', 'completed')),
    'approved_ideas', (SELECT COUNT(*) FROM ideas WHERE submitter_id = user_id AND status = 'approved'),
    'completed_ideas', (SELECT COUNT(*) FROM ideas WHERE submitter_id = user_id AND status = 'completed'),
    'unread_notifications', (SELECT COUNT(*) FROM notifications WHERE notifications.user_id = user_id AND read = false)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;