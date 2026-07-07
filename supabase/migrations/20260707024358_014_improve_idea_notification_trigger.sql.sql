/*
# Improve Idea Submission Notification & Email Flow

1. Purpose
   - Replace the existing `send_idea_submission_email()` trigger function with an improved version that:
     a) Creates an in-app notification for the submitter confirming their submission.
     b) Creates in-app notifications for all admins and reviewers about the new idea.
     c) Queues a confirmation email to the submitter.
     d) Queues a "new idea requires review" email to all admins and reviewers.
     e) Creates an activity log entry recording the submission.
   - The trigger fires AFTER INSERT on `public.ideas`.

2. Functions Modified
   - `public.send_idea_submission_email()` — SECURITY DEFINER trigger function, replaced with improved version.

3. Security
   - Function runs as SECURITY DEFINER so it can insert into notifications, email_queue, and activity_logs regardless of the caller's RLS.
   - No changes to RLS policies.

4. Notes
   - The function is idempotent in the sense that re-applying this migration just replaces the function body.
   - All emails are queued with status 'pending' in the email_queue table; the email-sender edge function processes them.
*/
CREATE OR REPLACE FUNCTION public.send_idea_submission_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  submitter_email TEXT;
  submitter_name  TEXT;
  admin_row       RECORD;
BEGIN
  -- Get submitter details
  SELECT email, full_name INTO submitter_email, submitter_name
  FROM profiles WHERE id = NEW.submitter_id;

  -- 1. Queue confirmation email to the submitter
  INSERT INTO email_queue (to_email, subject, body, status)
  VALUES (
    submitter_email,
    'Idea Submitted Successfully - ' || NEW.project_name,
    '<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; padding: 32px; border-radius: 16px;">
      <div style="background: linear-gradient(135deg, #3b82f6, #14b8a6); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">Idea Submitted Successfully!</h1>
      </div>
      <p style="color: #cbd5e1; font-size: 16px;">Dear ' || COALESCE(submitter_name, 'User') || ',</p>
      <p style="color: #94a3b8; font-size: 15px;">Your idea has been successfully submitted to the TSDPL BI Corporate Workflow system.</p>
      <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="color: #64748b; margin: 0 0 8px; font-size: 13px;">PROJECT ID</p>
        <p style="color: #3b82f6; margin: 0 0 16px; font-size: 16px; font-weight: 600;">' || NEW.project_id || '</p>
        <p style="color: #64748b; margin: 0 0 8px; font-size: 13px;">PROJECT NAME</p>
        <p style="color: #f8fafc; margin: 0 0 16px; font-size: 16px; font-weight: 600;">' || NEW.project_name || '</p>
        <p style="color: #64748b; margin: 0 0 8px; font-size: 13px;">STATUS</p>
        <p style="color: #22c55e; margin: 0; font-size: 16px; font-weight: 600; text-transform: capitalize;">' || REPLACE(NEW.status, '_', ' ') || '</p>
      </div>
      <p style="color: #94a3b8; font-size: 14px;">You will be notified as your idea progresses through the workflow stages.</p>
      <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;">
      <p style="color: #475569; font-size: 12px;">TSDPL BI Corporate Workflow Portal</p>
    </div>',
    'pending'
  );

  -- 2. Create in-app notification for the submitter
  INSERT INTO notifications (user_id, title, message, type, read)
  VALUES (
    NEW.submitter_id,
    'Idea Submitted Successfully!',
    'Your idea "' || NEW.project_name || '" (' || NEW.project_id || ') has been submitted and is now in the review queue.',
    'success',
    false
  );

  -- 3. Notify all admins and reviewers via in-app notification + email
  FOR admin_row IN
    SELECT id, email, full_name FROM profiles
    WHERE role IN ('admin', 'reviewer') AND id != NEW.submitter_id
  LOOP
    -- In-app notification
    INSERT INTO notifications (user_id, title, message, type, read)
    VALUES (
      admin_row.id,
      'New Idea Requires Review',
      'A new idea "' || NEW.project_name || '" (' || NEW.project_id || ') has been submitted by ' || COALESCE(submitter_name, submitter_email) || ' and requires your review.',
      'info',
      false
    );

    -- Email to admin/reviewer
    INSERT INTO email_queue (to_email, subject, body, status)
    VALUES (
      admin_row.email,
      'New Idea Requires Review - ' || NEW.project_name,
      '<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; padding: 32px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">New Idea Requires Your Review</h1>
        </div>
        <p style="color: #cbd5e1; font-size: 16px;">Dear ' || COALESCE(admin_row.full_name, 'Reviewer') || ',</p>
        <p style="color: #94a3b8; font-size: 15px;">A new idea has been submitted and requires your review in the TSDPL BI Corporate Workflow system.</p>
        <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="color: #64748b; margin: 0 0 8px; font-size: 13px;">PROJECT ID</p>
          <p style="color: #3b82f6; margin: 0 0 16px; font-size: 16px; font-weight: 600;">' || NEW.project_id || '</p>
          <p style="color: #64748b; margin: 0 0 8px; font-size: 13px;">PROJECT NAME</p>
          <p style="color: #f8fafc; margin: 0 0 16px; font-size: 16px; font-weight: 600;">' || NEW.project_name || '</p>
          <p style="color: #64748b; margin: 0 0 8px; font-size: 13px;">SUBMITTED BY</p>
          <p style="color: #f8fafc; margin: 0; font-size: 16px; font-weight: 600;">' || COALESCE(submitter_name, submitter_email) || '</p>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">Please log in to the TSDPL BI Dashboard to review this submission.</p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;">
        <p style="color: #475569; font-size: 12px;">TSDPL BI Corporate Workflow Portal</p>
      </div>',
      'pending'
    );
  END LOOP;

  -- 4. Create activity log entry
  INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    NEW.submitter_id,
    'create',
    'idea',
    NEW.id,
    jsonb_build_object(
      'project_id', NEW.project_id,
      'project_name', NEW.project_name,
      'status', NEW.status
    )
  );

  RETURN NEW;
END;
$function$;
