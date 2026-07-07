-- Drop existing pg_net extension
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Reinstall pg_net in extensions schema
CREATE EXTENSION pg_net SCHEMA extensions;

-- Delete old cron jobs
SELECT cron.unschedule('process_email_queue');

-- Create new cron job using extensions schema
SELECT cron.schedule(
  'process_email_queue',
  '*/2 * * * *',
  $$
  SELECT extensions.net.http_post(
    url := 'https://bxbbqhnhzipndbfcsmfs.supabase.co/functions/v1/email-sender',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4YmJxaG5oemlwbmRiZmNzbWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NjM4NjcsImV4cCI6MjA2NjAzOTg2N30.9oPbHbKpCqzVLhUu3Qh3vMq2ZQCQJVhPjLzN0PpNvTE"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);