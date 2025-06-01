import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Hash, MessageCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { type Clan, type Player } from '@/services/clanDataService';
import { clashApiService } from '@/services/clashApiService';
import { useQuery } from '@tanstack/react-query';

interface PlayerSearchProps {
  clans: Clan[];
}

interface SearchResult {
  playerName: string;
  playerTag: string;
  discordUsername: string;
  clanName: string;
  clanTag: string;
}

type PlayerStatus = 'in_clan' | 'not_in_clan' | 'not_found';

const fetchClanMembers = async (clanTag: string): Promise<Player[]> => {
  if (!clanTag) return [];
  try {
    console.log('Fetching clan members for:', clanTag);
    const members = await clashApiService.getClanMembers(clanTag);
    console.log('Fetched members:', members);
    return members;
  } catch (error) {
    console.error('Error fetching clan members:', error);
    throw error;
  }
};

const checkPlayerStatus = async (playerTag: string, clanTag: string): Promise<PlayerStatus> => {
  try {
    // First verify if the player exists
    const playerResponse = await fetch(`/.netlify/functions/getPlayer?tag=${playerTag.replace('#', '')}`);
    if (!playerResponse.ok) {
      return 'not_found';
    }

    // Then check if they're in the clan
    const clanMembers = await fetchClanMembers(clanTag);
    if (!clanMembers || clanMembers.length === 0) {
      return 'not_in_clan';
    }

    const normalizedPlayerTag = playerTag.replace('#', '').toUpperCase();
    const isInClan = clanMembers.some(member => member.tag.replace('#', '').toUpperCase() === normalizedPlayerTag);
    return isInClan ? 'in_clan' : 'not_in_clan';
  } catch (error) {
    console.error('Error checking player status:', error);
    return 'not_found';
  }
};

export const PlayerSearch = ({ clans }: PlayerSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const results: SearchResult[] = [];

    clans.forEach(clan => {
      clan.players.forEach(player => {
        // Search by Discord username
        if (player.discordUsername && player.discordUsername.toLowerCase().includes(query)) {
          results.push({
            playerName: player.name,
            playerTag: player.tag,
            discordUsername: player.discordUsername,
            clanName: clan.name,
            clanTag: clan.tag,
          });
        }
        // Search by player tag (remove # for comparison)
        else if (player.tag && player.tag.replace('#', '').toLowerCase().includes(query.replace('#', ''))) {
          results.push({
            playerName: player.name,
            playerTag: player.tag,
            discordUsername: player.discordUsername,
            clanName: clan.name,
            clanTag: clan.tag,
          });
        }
      });
    });

    setSearchResults(results);
    setHasSearched(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="bg-card shadow-xl border-border rounded-2xl">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center space-x-2 text-foreground">
          <Search className="h-6 w-6 text-primary" />
          <span className="responsive-header">Find Your Clan Assignment</span>
        </CardTitle>
        <p className="text-muted-foreground responsive-text">
          Search by Discord username or player tag to find which clan you're assigned to
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter Discord username or player tag (e.g., #PLAYERX)"
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-primary-foreground"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-4">
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="responsive-header text-muted-foreground mb-2">No Results Found</h3>
                <p className="text-muted-foreground responsive-text">
                  No players found matching "{searchQuery}". Try searching with a different Discord username or player tag.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="responsive-subheader text-foreground">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}:
                </h3>
                {searchResults.map((result, index) => {
                  const { data: playerStatus, isLoading, error } = useQuery({
                    queryKey: ['player-status', result.playerTag, result.clanTag],
                    queryFn: () => checkPlayerStatus(result.playerTag, result.clanTag),
                    enabled: !!result.playerTag && !!result.clanTag,
                  });

                  return (
                    <Card key={index} className="border border-border bg-card rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              {isLoading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : playerStatus === 'in_clan' ? (
                                <CheckCircle className="h-5 w-5 text-primary" />
                              ) : playerStatus === 'not_in_clan' ? (
                                <XCircle className="h-5 w-5 text-destructive" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-destructive" />
                              )}
                              <span className="font-semibold responsive-text text-foreground">{result.playerName}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Hash className="h-4 w-4" />
                                <span className="font-mono">{result.playerTag.replace('#', '')}</span>
                              </div>
                              {result.discordUsername && (
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="h-4 w-4" />
                                  <span>@{result.discordUsername}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-secondary text-secondary-foreground">
                                {result.clanName}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => window.open(`https://link.clashofclans.com/en?action=OpenClanProfile&tag=${result.clanTag.replace('#', '')}`, '_blank')}
                              >
                                🔗
                              </Button>
                            </div>
                            <p className="text-sm font-mono text-muted-foreground">{result.clanTag}</p>
                            {!isLoading && !error && (
                              <Badge 
                                variant={playerStatus === 'in_clan' ? "default" : "destructive"}
                                className={playerStatus === 'in_clan' ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"}
                              >
                                {playerStatus === 'in_clan' ? "In Clan" : 
                                 playerStatus === 'not_in_clan' ? "Not in Clan" : 
                                 "Player Not Found"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
