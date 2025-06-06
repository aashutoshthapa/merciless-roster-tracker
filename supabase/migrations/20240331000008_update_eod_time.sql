-- Drop the existing cron job
SELECT cron.unschedule('update-eod-daily');

-- Schedule the edge function to run daily at 3:21 UTC
SELECT cron.schedule(
  'update-eod-daily',
  '21 3 * * *',  -- Run at 3:21 UTC every day (9:06 AM Nepal time)
  $$
  SELECT
    net.http_post(
        url:='https://srxwgoximioevyadffwb.supabase.co/functions/v1/update-eod-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeHdnb3hpbWlvZXZ5YWRmZndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTA0MDMsImV4cCI6MjA2MzgyNjQwM30.kaJH8wkisM5b34rNHl5XUkj6l5WrWiOCWDu-Qiq96RA"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Show all current schedules to verify
SELECT * FROM cron.job; 