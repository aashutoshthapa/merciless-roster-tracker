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
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const { data: players = [], isLoading, refetch } = useQuery({
    queryKey: ['legend-players', refreshTrigger],
    queryFn: async () => {
      console.log('Fetching players for display...');
      const { data, error } = await supabase
        .from('legend_players')
        .select('*')
        .order('trophies', { ascending: false });

      if (error) {
        console.error('Error fetching players:', error);
        throw error;
      }

      console.log('Fetched players for display:', data);
      setLastRefreshed(new Date());
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

      console.log(`Starting parallel refresh for ${currentPlayers.length} players...`);

      // Create an array of promises for all player data fetches
      const playerDataPromises = currentPlayers.map(async (player) => {
        try {
          const playerData = await fetchPlayerData(player.player_tag);
          console.log('Fetched data for player', player.player_name, 'with trophies:', playerData.trophies);
          return {
            player,
            playerData,
            success: true
          };
        } catch (error) {
          console.error(`Error fetching data for player ${player.player_name}:`, error);
          return {
            player,
            playerData: null,
            success: false,
            error
          };
        }
      });

      // Wait for all API calls to complete in parallel
      const results = await Promise.all(playerDataPromises);
      console.log('All player data fetches completed');

      // Update all players in parallel as well
      const updatePromises = results
        .filter(result => result.success && result.playerData)
        .map(async ({ player, playerData }) => {
          try {
            const { error: updateError } = await supabase
              .from('legend_players')
              .update({
                player_name: playerData.name,
                trophies: playerData.trophies,
                updated_at: new Date().toISOString()
              })
              .eq('player_tag', player.player_tag);

            if (updateError) {
              console.error(`Error updating player ${player.player_name}:`, updateError);
              return { player: player.player_name, success: false, error: updateError };
            }

            console.log('Successfully updated player', player.player_name);
            return { player: player.player_name, success: true };
          } catch (error) {
            console.error(`Error updating player ${player.player_name}:`, error);
            return { player: player.player_name, success: false, error };
          }
        });

      // Wait for all database updates to complete
      const updateResults = await Promise.all(updatePromises);
      const successfulUpdates = updateResults.filter(result => result.success).length;
      const failedUpdates = updateResults.filter(result => !result.success);

      console.log(`Update completed: ${successfulUpdates} successful, ${failedUpdates.length} failed`);

      // Refetch the data to update the UI
      await refetch();
      setLastRefreshed(new Date());
      
      toast({
        title: "Success",
        description: `Leaderboard refreshed successfully (${successfulUpdates}/${currentPlayers.length} players updated)`,
      });

      if (failedUpdates.length > 0) {
        console.warn('Some players failed to update:', failedUpdates);
      }
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
      <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
          Live Leaderboard
          {lastRefreshed && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Last updated: {lastRefreshed.toLocaleString('en-US', {
                timeZone: 'Asia/Kathmandu',
                dateStyle: 'medium',
                timeStyle: 'short'
              })})
            </span>
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading || isRefreshing ? (
          <div className="text-center py-8">
            {isRefreshing ? 
              "Refreshing..." :
              "Fetching latest trophy data..."
            }
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No players tracked yet. Be the first to join!
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-card border"
              >
                <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                  <div className="text-lg sm:text-2xl font-bold text-muted-foreground w-6 sm:w-8 flex-shrink-0">
                    #{index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-base sm:text-xl font-bold text-foreground truncate">
                      {player.player_name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      {player.player_tag} • {player.discord_username}
                    </div>
                  </div>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-yellow-500 ml-2 sm:ml-4 flex-shrink-0">
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
