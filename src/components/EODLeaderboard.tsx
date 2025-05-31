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
}

export const EODLeaderboard = () => {
  const [records, setRecords] = useState<EODRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('eod_records')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const { data: players, error: playersError } = await supabase
          .from('legend_players')
          .select('*')
          .in('player_tag', data[0].records.map((r: any) => r.player_tag));

        if (playersError) throw playersError;

        // Combine the EOD records with player data
        const combinedRecords = data[0].records.map((record: any) => {
          const player = players.find((p: any) => p.player_tag === record.player_tag);
          return {
            id: record.id,
            player_name: player?.player_name || 'Unknown',
            player_tag: record.player_tag,
            trophies: record.trophies,
            discord_username: player?.discord_username || 'Unknown',
            recorded_at: data[0].recorded_at,
          };
        });

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
            {records.map((record, index) => (
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
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-yellow-500">
                    {record.trophies.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rank #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 