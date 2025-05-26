
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, XCircle, RefreshCw, AlertCircle, Hash } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Player {
  name: string;
  tag: string;
}

interface Clan {
  id: string;
  name: string;
  tag: string;
  players: Player[];
}

interface ClanCheckProps {
  clans: Clan[];
}

interface ClanMember {
  name: string;
  tag: string;
  role: string;
  expLevel: number;
  trophies: number;
  townhall: number;
}

interface ClanApiResponse {
  memberList?: ClanMember[];
}

const fetchClanMembers = async (clanTag: string): Promise<ClanMember[]> => {
  if (!clanTag) return [];
  
  // Remove # if present and clean the tag
  const cleanTag = clanTag.replace('#', '').toUpperCase();
  const url = `https://api.clashk.ing/clan/${cleanTag}/basic`;
  
  try {
    console.log(`Fetching clan data from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch clan data: ${response.status}`);
    }
    
    const data: ClanApiResponse = await response.json();
    console.log('API response for clan', cleanTag, ':', data);
    
    // Handle case where memberList might be null or undefined
    return data.memberList || [];
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
      staleTime: 5 * 60 * 1000, // 5 minutes
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

  const checkPlayerInClan = (playerTag: string, clanMembers: ClanMember[]): boolean => {
    const normalizedPlayerTag = normalizeTag(playerTag);
    return clanMembers.some(member => normalizeTag(member.tag) === normalizedPlayerTag);
  };

  return (
    <div className="space-y-6">
      {clans.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Clans to Check</h3>
          <p className="text-gray-500">Add some clans in the admin panel to start checking member status.</p>
        </div>
      ) : (
        <Accordion type="multiple" className="w-full">
          {clans.map((clan, index) => {
            const query = clanQueries[index];
            const isRefreshing = refreshingClans.has(clan.id);
            const clanMembers = query.data || [];
            const hasError = query.error;

            return (
              <AccordionItem key={clan.id} value={clan.id} className="border-2 border-slate-200 rounded-lg mb-4">
                <AccordionTrigger className="bg-[#1a237e] text-white px-6 py-4 rounded-t-lg hover:no-underline">
                  <div className="flex items-center justify-between w-full mr-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-[#ff6f00]" />
                      <span className="font-semibold text-lg">{clan.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-blue-200">
                        <Hash className="h-4 w-4" />
                        <span className="font-mono">{clan.tag}</span>
                      </div>
                      {hasError && <AlertCircle className="h-5 w-5 text-red-300" />}
                      {query.isLoading || isRefreshing ? (
                        <Badge variant="secondary" className="bg-yellow-500 text-white">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Loading...
                        </Badge>
                      ) : hasError ? (
                        <Badge variant="secondary" className="bg-red-500 text-white">
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
                        className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                      >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  {hasError ? (
                    <div className="p-6 text-center">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to Load Clan Data</h3>
                      <p className="text-gray-600 mb-4">
                        Could not fetch member data for this clan. Please check the clan tag and try again.
                      </p>
                      <Button 
                        onClick={() => handleRefreshClan(clan.id, clan.tag)}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : clan.players.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No players in this clan's roster
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {clan.players.map((player, playerIndex) => {
                        const isInClan = checkPlayerInClan(player.tag, clanMembers);
                        
                        return (
                          <div key={playerIndex} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {isInClan ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <div>
                                  <span className="font-medium text-gray-900">{player.name}</span>
                                  <p className="text-sm font-mono text-gray-600">{player.tag}</p>
                                </div>
                              </div>
                              <Badge 
                                variant={isInClan ? "default" : "destructive"}
                                className={isInClan ? "bg-green-500" : ""}
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
