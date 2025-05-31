-- Create a cron job to run the EOD recording function daily at 4:55 UTC
SELECT cron.schedule(
  'record-eod-daily',
  '55 4 * * *',  -- Run at 4:55 UTC every day (10:40 AM Nepal time)
  $$
  SELECT
    net.http_post(
      url := CONCAT(current_setting('app.settings.pgrest_url'), '/functions/v1/record-eod'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key'))
      )
    ) AS request_id;
  $$
); 