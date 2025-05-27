
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, Users, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClanRoster } from '@/components/ClanRoster';
import { ClanCheck } from '@/components/ClanCheck';
import { ThemeToggle } from '@/components/ThemeToggle';
import { clanDataService } from '@/services/clanDataService';

const Index = () => {
  const [activeTab, setActiveTab] = useState('roster');

  const { data: appData, isLoading, error } = useQuery({
    queryKey: ['app-data'],
    queryFn: () => clanDataService.getClanData(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-foreground">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading CWL Tracker...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4 font-medium">Error loading data</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-lg border-b-4 border-primary">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-secondary dark:text-white">
                  {appData?.title || 'MERCILESS CWL TRACKER'}
                </h1>
                <p className="text-muted-foreground">Clash of Clans War League Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/admin">
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-white/90 dark:bg-slate-700 backdrop-blur-sm"
                >
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="bg-white dark:bg-slate-800 shadow-xl border-border rounded-2xl">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl text-foreground">CWL Management Dashboard</CardTitle>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted rounded-xl">
                <TabsTrigger 
                  value="roster" 
                  className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-lg font-medium"
                >
                  CWL Roster
                </TabsTrigger>
                <TabsTrigger 
                  value="check" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium"
                >
                  Clan Check
                </TabsTrigger>
              </TabsList>

              <TabsContent value="roster" className="mt-6">
                <ClanRoster clans={appData?.clans || []} />
              </TabsContent>

              <TabsContent value="check" className="mt-6">
                <ClanCheck clans={appData?.clans || []} />
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
};

export default Index;
