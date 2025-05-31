-- Create a cron job to run the EOD recording function daily at 23:59 UTC
SELECT cron.schedule(
  'record-eod-daily',
  '59 23 * * *',  -- Run at 23:59 UTC every day
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