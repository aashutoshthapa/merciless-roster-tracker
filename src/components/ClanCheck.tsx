import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, XCircle, RefreshCw, AlertCircle, Hash, Users } from 'lucide-react';
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

const normalizeTag = (tag: string): string => {
  return tag.replace('#', '').toUpperCase().replace(/O/g, '0');
};

export const ClanCheck = ({ clans }: ClanCheckProps) => {
  const [refreshingClans, setRefreshingClans] = useState<Set<string>>(new Set());

  const clanQueries = clans.map((clan) => 
    useQuery({
      queryKey: ['clan-members', clan.tag],
      queryFn: () => fetchClanMembers(clan.tag),
      enabled: !!clan.tag,
      retry: 2,
      staleTime: 5 * 60 * 1000,
    })
  );

  const handleRefreshClan = async (clanId: string, clanTag: string) => {
    setRefreshingClans(prev => new Set(prev).add(clanId));
    
    try {
      const queryIndex = clans.findIndex(c => c.id === clanId);
      if (queryIndex !== -1) {
        await clanQueries[queryIndex].refetch();
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

  const checkPlayerInClan = (playerTag: string, clanMembers: Player[]): boolean => {
    const normalizedPlayerTag = normalizeTag(playerTag);
    return clanMembers.some(member => normalizeTag(member.tag) === normalizedPlayerTag);
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
            const query = clanQueries[index];
            const isRefreshing = refreshingClans.has(clan.id);
            const clanMembers = query.data || [];
            const hasError = query.error;

            // Calculate how many players from the roster are found in the fetched clan members
            const playersInClanCount = clan.players.filter(player => 
              checkPlayerInClan(player.tag, clanMembers)
            ).length;

            return (
              <AccordionItem key={clan.id} value={clan.id} className="border border-border rounded-xl mb-4 overflow-hidden card">
                <AccordionTrigger className="bg-card text-card-foreground px-6 py-4 hover:no-underline hover:bg-muted/50 transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mr-4 gap-3 sm:gap-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="font-semibold responsive-text text-foreground">{clan.name}</span>
                      <div className="flex items-center text-muted-foreground text-sm space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{playersInClanCount}/{clan.players.length}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm space-x-2">
                        <Hash className="h-4 w-4" />
                        <span className="font-mono">{clan.tag.replace('#', '')}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {hasError && <AlertCircle className="h-5 w-5 text-destructive" />}
                      {query.isLoading || isRefreshing ? (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Loading...
                        </Badge>
                      ) : hasError ? (
                        <Badge variant="destructive" className="bg-destructive text-destructive-foreground">
                          Error
                        </Badge>
                      ) : null}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefreshClan(clan.id, clan.tag);
                        }}
                        disabled={query.isLoading || isRefreshing || !clan.tag}
                        size="sm"
                        variant="outline"
                        className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 shadow-sm"
                      >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                      {clan.players.map((player, playerIndex) => {
                        const isInClan = checkPlayerInClan(player.tag, clanMembers);
                        
                        return (
                          <div key={playerIndex} className="p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {isInClan ? (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-destructive" />
                                )}
                                <div>
                                  <span className="font-medium responsive-text text-foreground">{player.name}</span>
                                  <p className="text-sm font-mono text-muted-foreground">{player.tag.replace('#', '')}</p>
                                </div>
                              </div>
                              <Badge 
                                variant={isInClan ? "default" : "destructive"}
                                className={isInClan ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"}
                              >
                                {isInClan ? "In Clan" : "Not Found"}
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
