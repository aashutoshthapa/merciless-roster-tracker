
-- Remove the refresh live leaderboard cron job since we're not using it anymore
SELECT cron.unschedule('refresh-live-leaderboard-daily');

-- Show remaining schedules to confirm
SELECT * FROM cron.job;
