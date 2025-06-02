
-- Schedule the refresh live leaderboard function to run daily at 4:54 UTC (1 minute before EOD recording)
SELECT cron.schedule(
  'refresh-live-leaderboard-daily',
  '54 4 * * *',  -- Run at 4:54 UTC every day (1 minute before EOD recording)
  $$
  SELECT
    net.http_post(
        url:='https://srxwgoximioevyadffwb.supabase.co/functions/v1/refresh-live-leaderboard',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeHdnb3hpbWlvZXZ5YWRmZndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTA0MDMsImV4cCI6MjA2MzgyNjQwM30.kaJH8wkisM5b34rNHl5XUkj6l5WrWiOCWDu-Qiq96RA"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Show all current schedules to verify
SELECT * FROM cron.job;
