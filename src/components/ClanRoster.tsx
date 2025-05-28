
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

export const ClanRoster = ({ clans }: ClanRosterProps) => {
  return (
    <div className="space-y-6">
      {clans.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Clans Yet</h3>
          <p className="text-gray-500">Add some clans in the admin panel to get started.</p>
        </div>
      ) : (
        <Accordion type="multiple" className="w-full">
          {clans.map((clan) => (
            <AccordionItem key={clan.id} value={clan.id} className="border-2 border-slate-200 rounded-lg mb-4">
              <AccordionTrigger className="bg-[#1a237e] text-white px-6 py-4 rounded-t-lg hover:no-underline">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-[#ff6f00]" />
                    <span className="font-semibold text-lg">{clan.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-blue-200">
                      <Hash className="h-4 w-4" />
                      <span className="font-mono">{clan.tag}</span>
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
                  <div className="p-6 text-center text-gray-500">
                    No players in this clan yet
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {clan.players.map((player, index) => (
                      <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="font-medium text-gray-900 block">{player.name}</span>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Hash className="h-3 w-3" />
                                <span className="font-mono">{player.tag}</span>
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
