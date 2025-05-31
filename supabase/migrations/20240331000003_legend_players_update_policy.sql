-- Add update policy for legend_players table
CREATE POLICY "Allow public to update legend players"
    ON legend_players FOR UPDATE
    USING (true)
    WITH CHECK (true); 