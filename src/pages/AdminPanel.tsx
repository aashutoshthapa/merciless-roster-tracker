import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Trash2, Plus, ArrowLeft, Save } from 'lucide-react';
import { AdminLogin } from '@/components/AdminLogin';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from '@/hooks/use-toast';
import { clanDataService, type Player, type Clan } from '@/services/clanDataService';
import { useAuth } from '@/contexts/AuthContext';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  
  const [newTitle, setNewTitle] = useState('');
  const [newClanName, setNewClanName] = useState('');
  const [newClanTag, setNewClanTag] = useState('');
  const [editingClan, setEditingClan] = useState<Clan | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTag, setNewPlayerTag] = useState('');
  const [newPlayerDiscord, setNewPlayerDiscord] = useState('');

  const { data: appData, isLoading, error } = useQuery({
    queryKey: ['app-data'],
    queryFn: () => clanDataService.getClanData(),
  });

  useEffect(() => {
    if (appData) {
      setNewTitle(appData.title);
    }
  }, [appData]);

  const saveTitleMutation = useMutation(clanDataService.saveTitle, {
    onSuccess: () => {
      queryClient.invalidateQueries(['app-data']);
      toast({
        title: "Title Saved",
        description: "Application title has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Saving Title",
        description: error.message || "Failed to save title. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveClansMutation = useMutation(clanDataService.saveClans, {
    onSuccess: () => {
      queryClient.invalidateQueries(['app-data']);
      toast({
        title: "Clans Saved",
        description: "Clans have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Saving Clans",
        description: error.message || "Failed to save clans. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTitleSave = () => {
    saveTitleMutation.mutate(newTitle);
  };

  const addClan = () => {
    if (!newClanName.trim() || !newClanTag.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both clan name and tag.",
        variant: "destructive",
      });
      return;
    }

    const newClan: Clan = {
      id: Date.now().toString(),
      name: newClanName.trim(),
      tag: newClanTag.trim(),
      players: [],
    };

    const updatedClans = [...(appData?.clans || []), newClan];
    saveClansMutation.mutate(updatedClans);
    setNewClanName('');
    setNewClanTag('');
  };

  const deleteClan = (clanId: string) => {
    const updatedClans = (appData?.clans || []).filter(clan => clan.id !== clanId);
    saveClansMutation.mutate(updatedClans);
  };

  const removePlayerFromClan = (clanId: string, playerIndex: number) => {
    const updatedClans = (appData?.clans || []).map(clan => {
      if (clan.id === clanId) {
        const updatedPlayers = [...clan.players];
        updatedPlayers.splice(playerIndex, 1);
        return { ...clan, players: updatedPlayers };
      }
      return clan;
    });

    saveClansMutation.mutate(updatedClans);
  };

  const addPlayerToClan = (clanId: string) => {
    if (!newPlayerName.trim() || !newPlayerTag.trim() || !newPlayerDiscord.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in player name, tag, and Discord username.",
        variant: "destructive",
      });
      return;
    }

    const updatedClans = (appData?.clans || []).map(clan => {
      if (clan.id === clanId) {
        return {
          ...clan,
          players: [...clan.players, { 
            name: newPlayerName.trim(), 
            tag: newPlayerTag.trim(),
            discordUsername: newPlayerDiscord.trim()
          }]
        };
      }
      return clan;
    });

    saveClansMutation.mutate(updatedClans);
    setNewPlayerName('');
    setNewPlayerTag('');
    setNewPlayerDiscord('');
  };

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-lg border-b-4 border-primary">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-secondary">Admin Panel</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                onClick={logout}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="settings">App Settings</TabsTrigger>
            <TabsTrigger value="clans">Manage Clans</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Application Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Application Title</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      id="title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={appData?.title || 'Enter title'}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleTitleSave}
                      disabled={!newTitle.trim() || saveTitleMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveTitleMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clans">
            <div className="space-y-6">
              {/* Add New Clan */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Clan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="clanName">Clan Name</Label>
                      <Input
                        id="clanName"
                        value={newClanName}
                        onChange={(e) => setNewClanName(e.target.value)}
                        placeholder="Enter clan name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clanTag">Clan Tag</Label>
                      <Input
                        id="clanTag"
                        value={newClanTag}
                        onChange={(e) => setNewClanTag(e.target.value)}
                        placeholder="#CLANTAGX"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={addClan}
                        disabled={!newClanName.trim() || !newClanTag.trim() || saveClansMutation.isPending}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Clan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Clans */}
              <div className="space-y-4">
                {(appData?.clans || []).map((clan) => (
                  <Card key={clan.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">{clan.name}</CardTitle>
                            <p className="text-sm text-muted-foreground font-mono">{clan.tag}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            {clan.players.length} players
                          </Badge>
                          <Button
                            onClick={() => deleteClan(clan.id)}
                            variant="outline"
                            size="sm"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Add Player Form */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-muted rounded-lg">
                        <div>
                          <Label htmlFor={`playerName-${clan.id}`}>Player Name</Label>
                          <Input
                            id={`playerName-${clan.id}`}
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            placeholder="Player name"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`playerTag-${clan.id}`}>Player Tag</Label>
                          <Input
                            id={`playerTag-${clan.id}`}
                            value={newPlayerTag}
                            onChange={(e) => setNewPlayerTag(e.target.value)}
                            placeholder="#PLAYERX"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`playerDiscord-${clan.id}`}>Discord Username</Label>
                          <Input
                            id={`playerDiscord-${clan.id}`}
                            value={newPlayerDiscord}
                            onChange={(e) => setNewPlayerDiscord(e.target.value)}
                            placeholder="discord_username"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                            onClick={() => addPlayerToClan(clan.id)}
                            disabled={saveClansMutation.isPending}
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Player
                          </Button>
                        </div>
                      </div>

                      {/* Players List */}
                      {clan.players.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No players added yet</p>
                      ) : (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Players:</h4>
                          <div className="grid gap-2">
                            {clan.players.map((player, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-card border rounded">
                                <div className="flex items-center space-x-4">
                                  <span className="font-medium">{player.name}</span>
                                  <span className="font-mono text-sm text-muted-foreground">{player.tag}</span>
                                  <Badge variant="outline">@{player.discordUsername}</Badge>
                                </div>
                                <Button
                                  onClick={() => removePlayerFromClan(clan.id, index)}
                                  variant="outline"
                                  size="sm"
                                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
