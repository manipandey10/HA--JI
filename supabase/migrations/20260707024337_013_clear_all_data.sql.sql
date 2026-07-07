/*
# Clear All Previous Data

1. Purpose
   - Remove all existing rows from application tables to start fresh.
   - Preserves all table structures, triggers, functions, policies, and indexes.

2. Tables Cleared
   - `workflow_stages` — child of ideas, truncated first
   - `ideas` — all submitted ideas
   - `notifications` — all in-app notifications
   - `activity_logs` — all activity log entries
   - `email_queue` — all queued/sent/failed emails

3. Notes
   - `profiles` is NOT cleared — user accounts in auth.users and their profiles remain intact.
   - TRUNCATE with RESTART IDENTITY resets serial/identity sequences.
   - CASCADE ensures child tables (workflow_stages) are cleared when parent (ideas) is truncated.
*/

TRUNCATE TABLE
  public.workflow_stages,
  public.ideas,
  public.notifications,
  public.activity_logs,
  public.email_queue
RESTART IDENTITY CASCADE;
