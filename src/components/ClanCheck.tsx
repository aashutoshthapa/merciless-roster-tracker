import { useState } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, XCircle, RefreshCw, AlertCircle, Hash } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { clashApiService } from '@/services/clashApiService';
import { Player } from '@/services/clanDataService';

interface Clan {
  id: string;
  name: string;
  tag: string;
  players: Player[];
}

interface ClanCheckProps {
  clans: Clan[];
}

// Fetch clan members using the proxy function
const fetchClanMembers = async (clanTag: string): Promise<Player[]> => {
  if (!clanTag) return [];
  
  try {
    console.log(`Fetching clan data for tag: ${clanTag}`);
    const members = await clashApiService.getClanMembers(clanTag);
    console.log('API response for clan', clanTag, ':', members);
    
    return members;
  } catch (error) {
    console.error('Error fetching clan members:', error);
    throw error;
  }
};

// Fetch single player data for validation
const fetchPlayer = async (playerTag: string) => {
   if (!playerTag) return null;
   try {
     console.log(`Validating player tag: ${playerTag}`);
     const player = await clashApiService.getPlayer(playerTag);
     console.log('Player validation response for tag', playerTag, ':', player);
     return player;
   } catch (error) {
     console.error('Error validating player tag:', error);
     return null; // Assume invalid if there's an error other than 404
   }
};

const normalizeTag = (tag: string): string => {
  return tag.replace('#', '').toUpperCase().replace(/O/g, '0');
};

export const ClanCheck = ({ clans }: ClanCheckProps) => {
  const [refreshingClans, setRefreshingClans] = useState<Set<string>>(new Set());

  // Use useQueries to manage multiple queries for clans and players
  const queries = useQueries({
    queries: clans.map((clan) => ({
      queryKey: ['clan-members', clan.tag],
      queryFn: () => fetchClanMembers(clan.tag),
      enabled: !!clan.tag,
      retry: 2,
      staleTime: 5 * 60 * 1000,
      select: (data: Player[]) => {
        // For each player in the clan roster, check if they are in the fetched member list
        return clan.players.map(rosterPlayer => {
          const isInClan = data.some(apiPlayer => normalizeTag(apiPlayer.tag) === normalizeTag(rosterPlayer.tag));
          return { ...rosterPlayer, isInClan };
        });
      },
    })),
  });

  // Separate queries for player tag validation if needed
  const playerValidationQueries = useQueries({
    queries: clans.flatMap(clan => 
      clan.players.map(player => ({
        queryKey: ['player-validation', player.tag],
        queryFn: () => fetchPlayer(player.tag),
        // Only enable this query if the clan members query for this clan has finished loading
        // and the player was NOT found in the initial clan member list.
        enabled: !queries.find(q => q.queryKey[1] === clan.tag)?.isLoading &&
                 !queries.find(q => q.queryKey[1] === clan.tag)?.data?.find(p => normalizeTag(p.tag) === normalizeTag(player.tag))?.isInClan &&
                 !!player.tag,
        retry: 1, // Retry player validation once
        staleTime: Infinity, // Don't re-fetch unless explicitly invalidated
      }))
    )
  });


  const handleRefreshClan = async (clanId: string, clanTag: string) => {
    setRefreshingClans(prev => new Set(prev).add(clanId));
    
    try {
      const queryIndex = clans.findIndex(c => c.id === clanId);
      if (queryIndex !== -1) {
        // Refetch the clan members query
        await queries[queryIndex].refetch();
        
        // Invalidate player validation queries for this clan's players
        // This will cause them to refetch if the player is still not found in the updated list
        const playersToInvalidate = clans[queryIndex].players.map(p => ['player-validation', p.tag]);
        // You would typically use queryClient.invalidateQueries here, but we'll simulate refetch for simplicity
        // In a real app, you'd inject queryClient
        // queryClient.invalidateQueries({ queryKey: ['player-validation'] }); 

        toast({
          title: "Clan Updated",
          description: "Clan member data has been refreshed.",
        });
      }
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to update clan data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshingClans(prev => {
        const newSet = new Set(prev);
        newSet.delete(clanId);
        return newSet;
      });
    }
  };


  return (
    <div className="space-y-8">
      {clans.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="responsive-header text-foreground mb-2">No Clans to Check</h3>
          <p className="text-muted-foreground responsive-text">Add some clans in the admin panel to start checking member status.</p>
        </div>
      ) : (
        <Accordion type="multiple" className="w-full">
          {clans.map((clan, index) => {
            const clanQuery = queries[index];
            const isRefreshing = refreshingClans.has(clan.id);
            const hasError = clanQuery.error;
            // The data is now the transformed list with isInClan property
            const playersWithStatus = clanQuery.data || [];

            // Find the player validation queries for this clan's players
            const currentPlayerValidationQueries = playerValidationQueries.filter(pq =>
               clan.players.some(cp => normalizeTag(cp.tag) === normalizeTag(pq.queryKey[1] as string))
            );
            const isPlayerValidating = currentPlayerValidationQueries.some(pq => pq.isLoading);
            const hasPlayerValidationError = currentPlayerValidationQueries.some(pq => pq.error);

            return (
              <AccordionItem key={clan.id} value={clan.id} className="border border-border rounded-xl mb-4 overflow-hidden card">
                <AccordionTrigger className="bg-card text-card-foreground px-6 py-4 hover:no-underline hover:bg-muted/50 transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mr-4 gap-3 sm:gap-4">
                    <div className="flex items-center space-x-3">
                      {/* Show warning if any player tag might be invalid */}
                       {hasPlayerValidationError ? (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        ) : hasError ? (
                         <XCircle className="h-5 w-5 text-destructive" />
                        ) : (
                         <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      <span className="font-semibold responsive-text text-foreground">{clan.name}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        <span className="font-mono text-sm">{clan.tag.replace('#', '')}</span>
                      </div>
                      {hasError && <AlertCircle className="h-5 w-5 text-destructive" />}
                      {clanQuery.isLoading || isRefreshing || isPlayerValidating ? (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Loading...
                        </Badge>
                      ) : hasError ? (
                        <Badge variant="destructive" className="bg-destructive text-destructive-foreground">
                          Error
                        </Badge>
                      ) : hasPlayerValidationError ? (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                           Tag Check Needed
                         </Badge>
                      ) : null}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefreshClan(clan.id, clan.tag);
                        }}
                        disabled={clanQuery.isLoading || isRefreshing || isPlayerValidating || !clan.tag}
                        size="sm"
                        variant="outline"
                        className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 shadow-sm"
                      >
                        <RefreshCw className={`h-4 w-4 ${(isRefreshing || isPlayerValidating) ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0 bg-card">
                  {hasError ? (
                    <div className="p-6 text-center">
                      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                      <h3 className="responsive-header text-destructive mb-2">Failed to Load Clan Data</h3>
                      <p className="text-muted-foreground responsive-text mb-4">
                        Could not fetch member data for this clan. Please check the clan tag and try again.
                      </p>
                      <Button 
                        onClick={() => handleRefreshClan(clan.id, clan.tag)}
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : clan.players.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No players in this clan's roster
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {playersWithStatus.map((player, playerIndex) => {
                        // Find the corresponding player validation query result
                         const playerValidationQuery = playerValidationQueries.find(pq =>
                           normalizeTag(pq.queryKey[1] as string) === normalizeTag(player.tag)
                         );
                         const isPlayerTagValid = playerValidationQuery?.data !== null && !playerValidationQuery?.error;
                         const isPlayerValidationLoading = playerValidationQuery?.isLoading;

                        return (
                          <div key={playerIndex} className="p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {player.isInClan ? (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                ) : isPlayerValidationLoading ? (
                                   <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />
                                 ) : isPlayerTagValid ? (
                                  <XCircle className="h-5 w-5 text-destructive" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                                )}
                                <div>
                                  <span className="font-medium responsive-text text-foreground">{player.name}</span>
                                  <p className="text-sm font-mono text-muted-foreground">{player.tag.replace('#', '')}</p>
                                </div>
                              </div>
                              <Badge 
                                variant={player.isInClan ? "default" : isPlayerValidationLoading ? "secondary" : isPlayerTagValid ? "destructive" : "outline"}
                                className={player.isInClan ? "bg-primary hover:bg-primary/90 text-primary-foreground" : isPlayerValidationLoading ? "bg-muted text-muted-foreground border-0" : isPlayerTagValid ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "border-yellow-500 text-yellow-500 bg-yellow-500/10"}
                              >
                                {player.isInClan ? "In Clan" : isPlayerValidationLoading ? "Checking Tag..." : isPlayerTagValid ? "Not Found in Clan" : "Invalid Player Tag"}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};
