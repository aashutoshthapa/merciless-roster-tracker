import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Hash, MessageCircle, Trophy, Zap } from 'lucide-react';

interface Player {
  name: string;
  tag: string;
  discordUsername: string;
}

interface Clan {
  id: string;
  name: string;
  tag: string;
  cwlType: 'Lazy' | 'Regular';
  league: 'Champion 1' | 'Champion 2' | 'Champion 3' | 'Master 1' | 'Master 2' | 'Master 3' | 'Crystal 1';
  players: Player[];
}

interface ClanRosterProps {
  clans: Clan[];
}

const getLeagueRank = (league: Clan['league']): number => {
  const ranks: Record<Clan['league'], number> = {
    'Champion 1': 7,
    'Champion 2': 6,
    'Champion 3': 5,
    'Master 1': 4,
    'Master 2': 3,
    'Master 3': 2,
    'Crystal 1': 1
  };
  return ranks[league];
};

export const ClanRoster = ({ clans }: ClanRosterProps) => {
  const sortedClans = [...clans].sort((a, b) => {
    // First sort by CWL type (Regular first)
    if (a.cwlType !== b.cwlType) {
      return a.cwlType === 'Regular' ? -1 : 1;
    }
    // Then sort by league (higher to lower)
    return getLeagueRank(b.league) - getLeagueRank(a.league);
  });

  return (
    <div className="space-y-6">
      {clans.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="responsive-header text-gray-600 mb-2">No Clans Yet</h3>
          <p className="text-gray-500">Add some clans in the admin panel to get started.</p>
        </div>
      ) : (
        <Accordion type="multiple" className="w-full">
          {sortedClans.map((clan) => (
            <AccordionItem key={clan.id} value={clan.id} className="border-2 border-slate-200 dark:border-slate-700 rounded-lg mb-4">
              <AccordionTrigger className="bg-[#1a237e] dark:bg-slate-800 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg hover:no-underline">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mr-4 gap-2 sm:gap-0">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-[#ff6f00]" />
                    <span className="font-semibold responsive-text">{clan.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center space-x-2 text-blue-200">
                      <Hash className="h-4 w-4" />
                      <span className="font-mono text-sm">{clan.tag.replace('#', '')}</span>
                    </div>
                    <Badge variant={clan.cwlType === 'Lazy' ? 'destructive' : 'default'} className={clan.cwlType === 'Lazy' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}>
                      <Zap className="h-3 w-3 mr-1" />
                      {clan.cwlType} CWL
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-500 text-white border-yellow-600">
                      <Trophy className="h-3 w-3 mr-1" />
                      {clan.league}
                    </Badge>
                    <Badge variant="secondary" className="bg-[#ff6f00] text-white">
                      {clan.players.length} players
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                {clan.players.length === 0 ? (
                  <div className="p-4 sm:p-6 text-center text-gray-500">
                    No players in this clan yet
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {clan.players.map((player, index) => (
                      <div key={index} className="p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                          <div className="space-y-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100 block">{player.name}</span>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Hash className="h-3 w-3" />
                                <span className="font-mono">{player.tag.replace('#', '')}</span>
                              </div>
                              {player.discordUsername && (
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>@{player.discordUsername}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};
