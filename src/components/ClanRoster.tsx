import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Hash, MessageCircle, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="space-y-8">
      {clans.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="responsive-header text-foreground mb-2">No Clans Yet</h3>
          <p className="text-muted-foreground">Add some clans in the admin panel to get started.</p>
        </div>
      ) : (
        <Accordion type="multiple" className="w-full">
          {sortedClans.map((clan) => (
            <AccordionItem key={clan.id} value={clan.id} className="border border-border rounded-xl mb-4 overflow-hidden card">
              <AccordionTrigger className="bg-card text-card-foreground px-6 py-4 rounded-t-xl hover:no-underline">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mr-4 gap-3 sm:gap-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div className="flex items-center gap-2">
                      <span className="font-semibold responsive-text text-foreground">{clan.name}</span>
                      {clan.league === 'Champion 1' && (
                        <img src="/images/champion1.png" alt="Champion 1" className="h-5 w-auto" />
                      )}
                      {clan.league === 'Champion 2' && (
                        <img src="/images/champion2.png" alt="Champion 2" className="h-5 w-auto" />
                      )}
                      {clan.league === 'Champion 3' && (
                        <img src="/images/champion3.png" alt="Champion 3" className="h-5 w-auto" />
                      )}
                      {clan.league === 'Master 1' && (
                        <img src="/images/master1.png" alt="Master 1" className="h-5 w-auto" />
                      )}
                      {clan.league === 'Master 2' && (
                        <img src="/images/master2.png" alt="Master 2" className="h-5 w-auto" />
                      )}
                      {clan.league === 'Master 3' && (
                        <img src="/images/master3.png" alt="Master 3" className="h-5 w-auto" />
                      )}
                      {clan.league === 'Crystal 1' && (
                        <img src="/images/crystal1.png" alt="Crystal 1" className="h-5 w-auto" />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      <span className="font-mono text-sm">🔗 {clan.tag.replace('#', '')}</span>
                    </div>
                    <Badge variant={clan.cwlType === 'Lazy' ? 'destructive' : 'default'} className={clan.cwlType === 'Lazy' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}>
                      <Zap className="h-3 w-3 mr-1" />
                      {clan.cwlType} CWL
                    </Badge>
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                      <Trophy className="h-3 w-3 mr-1 text-primary" />
                      {clan.league}
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      {clan.players.length} players
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => window.open(`https://link.clashofclans.com/en?action=OpenClanProfile&tag=${clan.tag.replace('#', '')}`, '_blank')}
                    >
                      🔗
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                {clan.players.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No players in this clan yet
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {clan.players.map((player, index) => (
                      <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                          <div className="space-y-1">
                            <span className="font-medium responsive-text text-foreground block">{player.name}</span>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
