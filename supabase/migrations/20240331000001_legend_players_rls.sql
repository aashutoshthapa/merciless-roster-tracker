-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to legend players" ON legend_players;
DROP POLICY IF EXISTS "Allow authenticated users to insert legend players" ON legend_players;
DROP POLICY IF EXISTS "Allow authenticated users to delete legend players" ON legend_players;

-- Add RLS policies for legend_players table
ALTER TABLE legend_players ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read legend players
CREATE POLICY "Allow public read access to legend players"
    ON legend_players FOR SELECT
    USING (true);

-- Allow anyone to insert new players
CREATE POLICY "Allow public to insert legend players"
    ON legend_players FOR INSERT
    WITH CHECK (true);

-- Only allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete legend players"
    ON legend_players FOR DELETE
    TO authenticated
    USING (true); 