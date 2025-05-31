-- Create legend_players table
CREATE TABLE IF NOT EXISTS legend_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name TEXT NOT NULL,
    player_tag TEXT NOT NULL UNIQUE,
    trophies INTEGER NOT NULL,
    discord_username TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on player_tag for faster lookups
CREATE INDEX IF NOT EXISTS idx_legend_players_tag ON legend_players(player_tag);

-- Create index on trophies for faster sorting
CREATE INDEX IF NOT EXISTS idx_legend_players_trophies ON legend_players(trophies DESC);

-- Add RLS policies
ALTER TABLE legend_players ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read legend players
CREATE POLICY "Allow public read access to legend players"
    ON legend_players FOR SELECT
    USING (true);

-- Only allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert legend players"
    ON legend_players FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Only allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete legend players"
    ON legend_players FOR DELETE
    TO authenticated
    USING (true); 