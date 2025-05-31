-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Allow public to update legend players" ON legend_players;

-- Add update policy for legend_players table
CREATE POLICY "Allow public to update legend players"
    ON legend_players FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Enable RLS
ALTER TABLE legend_players ENABLE ROW LEVEL SECURITY; 