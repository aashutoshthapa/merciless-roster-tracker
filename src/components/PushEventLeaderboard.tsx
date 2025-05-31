import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LegendPlayer {
  id: string;
  player_name: string;
  player_tag: string;
  trophies: number;
  discord_username: string;
  created_at: string;
}

interface PushEventLeaderboardProps {
  refreshTrigger: number;
}

const fetchPlayerData = async (playerTag: string) => {
  const formattedTag = playerTag.startsWith('#') ? playerTag.substring(1) : playerTag;
  console.log('Fetching player data for tag:', formattedTag);
  const response = await fetch(`/.netlify/functions/getPlayerData?tag=${formattedTag}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch player data');
  }
  
  const data = await response.json();
  console.log('API response for player', formattedTag, ':', data);
  return data;
};

export const PushEventLeaderboard = ({ refreshTrigger }: PushEventLeaderboardProps) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: players = [], isLoading, refetch } = useQuery({
    queryKey: ['legend-players', refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_players')
        .select('*')
        .order('trophies', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 0, // Always consider the data stale to allow immediate refreshes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // First, get the current players from Supabase
      const { data: currentPlayers, error } = await supabase
        .from('legend_players')
        .select('*');

      if (error) throw error;

      // Update each player's data
      for (const player of currentPlayers) {
        try {
          const playerData = await fetchPlayerData(player.player_tag);
          
          // Update the player's data in Supabase
          const { error: updateError } = await supabase
            .from('legend_players')
            .update({
              player_name: playerData.name,
              trophies: playerData.trophies
            })
            .eq('player_tag', player.player_tag);

          if (updateError) {
            console.error(`Error updating player ${player.player_name}:`, updateError);
          }
        } catch (error) {
          console.error(`Error fetching data for player ${player.player_name}:`, error);
        }
      }

      // Refetch the data to update the UI
      await refetch();
      
      toast({
        title: "Success",
        description: "Leaderboard refreshed successfully",
      });
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to refresh leaderboard",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold text-foreground">Leaderboard</CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading || isRefreshing ? (
          <div className="text-center py-8">Loading...</div>
        ) : players.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No players tracked yet. Be the first to join!
          </div>
        ) : (
          <div className="space-y-4">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 rounded-lg bg-card border"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-muted-foreground w-8">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-foreground">
                      {player.player_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {player.player_tag} • {player.discord_username}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-500">
                  {player.trophies.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 