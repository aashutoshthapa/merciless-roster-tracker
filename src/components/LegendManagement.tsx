import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface LegendPlayer {
  id: string;
  player_name: string;
  player_tag: string;
  trophies: number;
  discord_username: string;
  created_at: string;
}

export const LegendManagement = () => {
  const [players, setPlayers] = useState<LegendPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPlayers = async () => {
    try {
      console.log('Fetching players...');
      const { data, error } = await supabase
        .from('legend_players')
        .select('*')
        .order('trophies', { ascending: false });

      if (error) {
        console.error('Error in fetchPlayers:', error);
        throw error;
      }
      console.log('Fetched players:', data);
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        title: "Error",
        description: "Failed to load legend players",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlayer = async (playerId: string) => {
    console.log('Delete attempt for player ID:', playerId);
    console.log('Current user:', user);

    if (!user) {
      console.log('No user found, deletion cancelled');
      toast({
        title: "Error",
        description: "You must be logged in to delete players",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting to delete player...');
      
      // First verify the player exists
      const { data: verifyData, error: verifyError } = await supabase
        .from('legend_players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (verifyError) {
        console.error('Error verifying player:', verifyError);
        throw new Error('Could not verify player exists');
      }

      console.log('Player to delete:', verifyData);

      // Attempt the delete
      const { error: deleteError } = await supabase
        .from('legend_players')
        .delete()
        .eq('id', playerId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      console.log('Delete operation completed');

      // Update local state immediately
      setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== playerId));

      toast({
        title: "Success",
        description: "Player removed from tracking",
      });

      // Refresh the list to ensure consistency
      await fetchPlayers();
    } catch (error: any) {
      console.error('Error deleting player:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove player",
        variant: "destructive",
      });
    }
  };

  // Initial fetch
  useEffect(() => {
    console.log('Component mounted, fetching initial data...');
    fetchPlayers();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold text-foreground">Legend Players</CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchPlayers}
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
            No players tracked yet
          </div>
        ) : (
          <div className="space-y-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 rounded-lg bg-card border"
              >
                <div>
                  <div className="text-xl font-bold text-foreground">
                    {player.player_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {player.player_tag} • {player.discord_username}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Joined: {new Date(player.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-yellow-500">
                    {player.trophies.toLocaleString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      console.log('Delete button clicked for player:', player);
                      deletePlayer(player.id);
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 