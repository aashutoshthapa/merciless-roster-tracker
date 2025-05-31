import { useEffect } from 'react';
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

export const PushEventLeaderboard = ({ refreshTrigger }: PushEventLeaderboardProps) => {
  const { toast } = useToast();

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
    try {
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
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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