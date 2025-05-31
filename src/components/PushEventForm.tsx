import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

      // Fetch player data from Netlify Function
      const response = await fetch(`/.netlify/functions/getPlayerData?tag=${sanitizedTag}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Player not found. Please check the tag and try again.');
        }
        throw new Error('Failed to fetch player data');
      }

      const playerData = await response.json();

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
    <Card>
      <CardHeader>
        <CardTitle>Register for Push Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="playerTag">Player Tag</Label>
            <Input
              id="playerTag"
              value={playerTag}
              onChange={(e) => setPlayerTag(e.target.value)}
              placeholder="#PLAYERTAG"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="discordUsername">Discord Username</Label>
            <Input
              id="discordUsername"
              value={discordUsername}
              onChange={(e) => setDiscordUsername(e.target.value)}
              placeholder="discord_username"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 