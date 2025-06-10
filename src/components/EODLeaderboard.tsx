
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EODRecord {
  id: string;
  player_name: string;
  player_tag: string;
  trophies: number;
  discord_username: string;
  recorded_at: string;
  trophy_change?: number;
}

export const EODLeaderboard = () => {
  const [records, setRecords] = useState<EODRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecords = async () => {
    try {
      // Get the latest 2 EOD records to calculate differences
      const { data, error } = await supabase
        .from('eod_records')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(2);

      if (error) throw error;

      if (data && data.length > 0) {
        const { data: players, error: playersError } = await supabase
          .from('legend_players')
          .select('*')
          .in('player_tag', (data[0].records as any[]).map((r: any) => r.player_tag));

        if (playersError) throw playersError;

        // Get current records (latest)
        const currentRecords = data[0].records as any[];
        
        // Get previous records if available
        const previousRecords = data.length > 1 ? (data[1].records as any[]) : [];
        
        // Create a map of previous trophies for quick lookup
        const previousTrophiesMap = new Map();
        previousRecords.forEach((record: any) => {
          previousTrophiesMap.set(record.player_tag, record.trophies);
        });

        // Combine the EOD records with player data and calculate trophy changes
        const combinedRecords = currentRecords
          .map((record: any) => {
            const player = players.find((p: any) => p.player_tag === record.player_tag);
            const previousTrophies = previousTrophiesMap.get(record.player_tag);
            const trophyChange = previousTrophies !== undefined ? record.trophies - previousTrophies : undefined;
            
            return {
              id: record.player_tag,
              player_name: player?.player_name || 'Unknown',
              player_tag: record.player_tag,
              trophies: record.trophies,
              discord_username: player?.discord_username || 'Unknown',
              recorded_at: data[0].recorded_at,
              trophy_change: trophyChange,
            };
          })
          .sort((a: any, b: any) => b.trophies - a.trophies);

        setRecords(combinedRecords);
      }
    } catch (error) {
      console.error('Error fetching EOD records:', error);
      toast({
        title: "Error",
        description: "Failed to load EOD records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const formatTrophyChange = (change: number | undefined) => {
    if (change === undefined) return null;
    
    const sign = change >= 0 ? '+' : '';
    const colorClass = change >= 0 ? 'text-green-500' : 'text-red-500';
    
    return (
      <div className={`text-sm font-medium ${colorClass}`}>
        {sign}{change}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold text-foreground">
          Last EOD Leaderboard
          {records.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({new Date(records[0].recorded_at).toLocaleString('en-US', {
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
          onClick={fetchRecords}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No EOD records available yet
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 rounded-lg bg-card border"
              >
                <div>
                  <div className="text-xl font-bold text-foreground">
                    {record.player_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {record.player_tag} • {record.discord_username}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-500">
                    {record.trophies.toLocaleString()}
                  </div>
                  {formatTrophyChange(record.trophy_change)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
