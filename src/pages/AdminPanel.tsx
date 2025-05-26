
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, LogOut, Plus, Trash2, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { AdminLogin } from '@/components/AdminLogin';
import { mockData } from '@/utils/mockData';

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

const AdminPanel = () => {
  const { isAuthenticated, logout } = useAuth();
  const [title, setTitle] = useState('');
  const [clans, setClans] = useState<Clan[]>([]);
  const [selectedClan, setSelectedClan] = useState<string>('');
  const [bulkInput, setBulkInput] = useState('');

  useEffect(() => {
    // Load initial data
    setTitle(mockData.title);
    setClans(mockData.clans);
    if (mockData.clans.length > 0) {
      setSelectedClan(mockData.clans[0].id);
    }
  }, []);

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const handleSaveTitle = () => {
    toast({
      title: "Title Updated",
      description: "Website title has been saved successfully.",
    });
  };

  const handleAddClan = () => {
    const newClan: Clan = {
      id: Date.now().toString(),
      name: `New Clan ${clans.length + 1}`,
      tag: '',
      players: []
    };
    setClans([...clans, newClan]);
    setSelectedClan(newClan.id);
  };

  const handleDeleteClan = (clanId: string) => {
    setClans(clans.filter(c => c.id !== clanId));
    if (selectedClan === clanId && clans.length > 1) {
      setSelectedClan(clans[0].id);
    }
  };

  const handleUpdateClan = (clanId: string, updates: Partial<Clan>) => {
    setClans(clans.map(c => c.id === clanId ? { ...c, ...updates } : c));
  };

  const handleAddPlayer = (clanId: string) => {
    const clan = clans.find(c => c.id === clanId);
    if (clan) {
      const newPlayer: Player = { name: '', tag: '' };
      handleUpdateClan(clanId, {
        players: [...clan.players, newPlayer]
      });
    }
  };

  const handleDeletePlayer = (clanId: string, playerIndex: number) => {
    const clan = clans.find(c => c.id === clanId);
    if (clan) {
      const newPlayers = clan.players.filter((_, index) => index !== playerIndex);
      handleUpdateClan(clanId, { players: newPlayers });
    }
  };

  const handleUpdatePlayer = (clanId: string, playerIndex: number, updates: Partial<Player>) => {
    const clan = clans.find(c => c.id === clanId);
    if (clan) {
      const newPlayers = clan.players.map((player, index) => 
        index === playerIndex ? { ...player, ...updates } : player
      );
      handleUpdateClan(clanId, { players: newPlayers });
    }
  };

  const handleBulkImport = () => {
    if (!selectedClan || !bulkInput.trim()) return;

    const lines = bulkInput.trim().split('\n');
    const newPlayers: Player[] = [];

    lines.forEach(line => {
      const parts = line.split('\t').map(part => part.trim());
      if (parts.length >= 2) {
        newPlayers.push({
          name: parts[0],
          tag: parts[1].startsWith('#') ? parts[1] : `#${parts[1]}`
        });
      }
    });

    const clan = clans.find(c => c.id === selectedClan);
    if (clan) {
      handleUpdateClan(selectedClan, {
        players: [...clan.players, ...newPlayers]
      });
      setBulkInput('');
      toast({
        title: "Players Imported",
        description: `Successfully imported ${newPlayers.length} players.`,
      });
    }
  };

  const selectedClanData = clans.find(c => c.id === selectedClan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <header className="bg-[#1a237e] shadow-2xl border-b-4 border-[#ff6f00]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-10 w-10 text-[#ff6f00]" />
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                <p className="text-blue-200">CWL Tracker Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" className="border-blue-300 text-blue-300 hover:bg-blue-300 hover:text-[#1a237e]">
                  Back to Tracker
                </Button>
              </Link>
              <Button 
                onClick={logout}
                variant="outline" 
                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1a237e]">Management Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100">
                <TabsTrigger value="settings" className="data-[state=active]:bg-[#1a237e] data-[state=active]:text-white">
                  Settings
                </TabsTrigger>
                <TabsTrigger value="clans" className="data-[state=active]:bg-[#ff6f00] data-[state=active]:text-white">
                  Manage Clans
                </TabsTrigger>
                <TabsTrigger value="bulk" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  Bulk Import
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="title" className="text-lg font-semibold">Website Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter website title"
                    className="text-lg"
                  />
                  <Button onClick={handleSaveTitle} className="bg-[#1a237e] hover:bg-[#1a237e]/90">
                    <Save className="h-4 w-4 mr-2" />
                    Save Title
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="clans" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Manage Clans</h3>
                  <Button onClick={handleAddClan} className="bg-[#ff6f00] hover:bg-[#ff6f00]/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Clan
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Clan List */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Clans</h4>
                    {clans.map((clan) => (
                      <Card 
                        key={clan.id} 
                        className={`cursor-pointer transition-all ${
                          selectedClan === clan.id ? 'ring-2 ring-[#ff6f00]' : ''
                        }`}
                        onClick={() => setSelectedClan(clan.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{clan.name}</p>
                              <p className="text-sm text-gray-600">{clan.tag}</p>
                              <p className="text-xs text-gray-500">{clan.players.length} players</p>
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClan(clan.id);
                              }}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Clan Editor */}
                  {selectedClanData && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Edit Clan: {selectedClanData.name}</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="clan-name">Clan Name</Label>
                          <Input
                            id="clan-name"
                            value={selectedClanData.name}
                            onChange={(e) => handleUpdateClan(selectedClan, { name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="clan-tag">Clan Tag</Label>
                          <Input
                            id="clan-tag"
                            value={selectedClanData.tag}
                            onChange={(e) => handleUpdateClan(selectedClan, { tag: e.target.value })}
                            placeholder="#CLANTAGHERE"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold">Players ({selectedClanData.players.length})</h5>
                          <Button 
                            onClick={() => handleAddPlayer(selectedClan)}
                            size="sm"
                            className="bg-[#ff6f00] hover:bg-[#ff6f00]/90"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Player
                          </Button>
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {selectedClanData.players.map((player, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                placeholder="Player Name"
                                value={player.name}
                                onChange={(e) => handleUpdatePlayer(selectedClan, index, { name: e.target.value })}
                                className="flex-1"
                              />
                              <Input
                                placeholder="#TAG"
                                value={player.tag}
                                onChange={(e) => handleUpdatePlayer(selectedClan, index, { tag: e.target.value })}
                                className="w-32"
                              />
                              <Button
                                onClick={() => handleDeletePlayer(selectedClan, index)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Bulk Import Players</h3>
                  <p className="text-sm text-gray-600">
                    Paste Excel-formatted data (tab-separated): Name [TAB] Tag
                  </p>
                  
                  <div className="space-y-3">
                    <Label htmlFor="clan-select">Select Clan</Label>
                    <select
                      id="clan-select"
                      value={selectedClan}
                      onChange={(e) => setSelectedClan(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {clans.map((clan) => (
                        <option key={clan.id} value={clan.id}>
                          {clan.name} ({clan.tag})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="bulk-input">Player Data</Label>
                    <Textarea
                      id="bulk-input"
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      placeholder="Mercurial	#L08YQV88C&#10;mercurial	#QJP2LVC2C"
                      rows={8}
                      className="font-mono"
                    />
                  </div>

                  <Button 
                    onClick={handleBulkImport}
                    className="bg-green-600 hover:bg-green-600/90"
                    disabled={!selectedClan || !bulkInput.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Import Players
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPanel;
