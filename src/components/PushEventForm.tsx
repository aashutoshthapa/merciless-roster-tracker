import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PushEventFormProps {
  onPlayerAdded: () => void;
}

export const PushEventForm = ({ onPlayerAdded }: PushEventFormProps) => {
  const [playerTag, setPlayerTag] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerTag.trim() || !discordUsername.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize the tag - remove # if present and convert to uppercase
      const sanitizedTag = playerTag.trim().replace('#', '').toUpperCase();
      
      // Check if player is already tracked
      const { data: existingPlayer, error: checkError } = await supabase
        .from('legend_players')
        .select('player_name')
        .eq('player_tag', sanitizedTag)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error('Database error');
      }

      if (existingPlayer) {
        toast({
          title: "Error",
          description: `${existingPlayer.player_name} is already being tracked`,
          variant: "destructive",
        });
        return;
      }

      // Fetch player data from Clash of Clans API
      const cocApiUrl = `https://cocproxy.royaleapi.dev/v1/players/%23${sanitizedTag}`;
      const cocResponse = await fetch(cocApiUrl, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_COC_API_TOKEN}`,
          'Accept': 'application/json',
        },
      });

      if (!cocResponse.ok) {
        if (cocResponse.status === 404) {
          throw new Error('Player not found. Please check the tag and try again.');
        }
        throw new Error('Failed to fetch player data from Clash of Clans API');
      }

      const playerData = await cocResponse.json();

      // Insert the player into the database
      const { error: insertError } = await supabase
        .from('legend_players')
        .insert({
          player_name: playerData.name,
          player_tag: sanitizedTag,
          trophies: playerData.trophies,
          discord_username: discordUsername.trim(),
        });

      if (insertError) {
        throw new Error('Failed to save player data');
      }

      toast({
        title: "Success",
        description: `${playerData.name} tracking successful!`,
      });

      // Clear form
      setPlayerTag('');
      setDiscordUsername('');
      
      // Refresh the leaderboard
      onPlayerAdded();

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-foreground">Join Push Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Player Tag (e.g. #8VJLQPUYR)"
              value={playerTag}
              onChange={(e) => setPlayerTag(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="text"
              placeholder="Discord Username (e.g. @king#1234)"
              value={discordUsername}
              onChange={(e) => setDiscordUsername(e.target.value)}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Tracking...' : 'Track'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 