-- Create eod_records table
CREATE TABLE IF NOT EXISTS eod_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    records JSONB NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on recorded_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_eod_records_recorded_at ON eod_records(recorded_at DESC);

-- Add RLS policies
ALTER TABLE eod_records ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read EOD records
CREATE POLICY "Allow public read access to EOD records"
    ON eod_records FOR SELECT
    USING (true);

-- Only allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert EOD records"
    ON eod_records FOR INSERT
    TO authenticated
    WITH CHECK (true); 