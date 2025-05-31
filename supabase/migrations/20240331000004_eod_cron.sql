-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to record EOD data
CREATE OR REPLACE FUNCTION record_eod_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert current player data into eod_records
  INSERT INTO eod_records (records)
  SELECT jsonb_agg(
    jsonb_build_object(
      'player_tag', player_tag,
      'trophies', trophies
    )
  )
  FROM legend_players;
END;
$$;

-- Schedule the function to run daily at 4:55 UTC
SELECT cron.schedule(
  'record-eod-daily',
  '55 4 * * *',  -- Run at 4:55 UTC every day (10:40 AM Nepal time)
  'SELECT record_eod_data();'
);

-- Show all current schedules
SELECT * FROM cron.job; 