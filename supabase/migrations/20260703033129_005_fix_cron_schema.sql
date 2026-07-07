-- Delete old cron job
SELECT cron.unschedule('process_email_queue');

-- Create new cron job with public schema
SELECT cron.schedule(
  'process_email_queue',
  '*/2 * * * *',
  $$
  SELECT
    public.net.http_post(
      url := 'https://bxbbqhnhzipndbfcsmfs.supabase.co/functions/v1/email-sender',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4YmJxaG5oemlwbmRiZmNzbWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NjM4NjcsImV4cCI6MjA2NjAzOTg2N30.9oPbHbKpCqzVLhUu3Qh3vMq2ZQCQJVhPjLzN0PpNvTE"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);