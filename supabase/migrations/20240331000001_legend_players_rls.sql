-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow public read access to legend players" ON legend_players;
DROP POLICY IF EXISTS "Allow public to insert legend players" ON legend_players;
DROP POLICY IF EXISTS "Allow authenticated users to delete legend players" ON legend_players;
DROP POLICY IF EXISTS "Allow authenticated users to update legend players" ON legend_players;
DROP POLICY IF EXISTS "Allow public to update legend players" ON legend_players;

-- Disable and re-enable RLS to ensure clean state
ALTER TABLE legend_players DISABLE ROW LEVEL SECURITY;
ALTER TABLE legend_players ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read legend players
CREATE POLICY "Allow public read access to legend players"
    ON legend_players FOR SELECT
    USING (true);

-- Allow anyone to insert new players
CREATE POLICY "Allow public to insert legend players"
    ON legend_players FOR INSERT
    WITH CHECK (true);

-- Allow anyone to delete
CREATE POLICY "Allow public to delete legend players"
    ON legend_players FOR DELETE
    USING (true);

-- Allow anyone to update
CREATE POLICY "Allow public to update legend players"
    ON legend_players FOR UPDATE
    USING (true)
    WITH CHECK (true); 