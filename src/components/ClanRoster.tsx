
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Hash } from 'lucide-react';

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

interface ClanRosterProps {
  clans: Clan[];
}

export const ClanRoster = ({ clans }: ClanRosterProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clans.map((clan) => (
          <Card key={clan.id} className="border-2 border-slate-200 hover:border-[#ff6f00] transition-colors">
            <CardHeader className="bg-[#1a237e] text-white">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{clan.name}</span>
              </CardTitle>
              <div className="flex items-center space-x-2 text-blue-200">
                <Hash className="h-4 w-4" />
                <span className="font-mono">{clan.tag}</span>
                <Badge variant="secondary" className="bg-[#ff6f00] text-white">
                  {clan.players.length} players
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-64 overflow-y-auto">
                {clan.players.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No players in this clan yet
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {clan.players.map((player, index) => (
                      <div key={index} className="p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{player.name}</span>
                          <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {player.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clans.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Clans Yet</h3>
          <p className="text-gray-500">Add some clans in the admin panel to get started.</p>
        </div>
      )}
    </div>
  );
};
