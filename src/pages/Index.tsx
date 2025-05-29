import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, Users, RefreshCw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClanRoster } from '@/components/ClanRoster';
import { ClanCheck } from '@/components/ClanCheck';
import { PlayerSearch } from '@/components/PlayerSearch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { clanDataService } from '@/services/clanDataService';

const Index = () => {
  const [activeTab, setActiveTab] = useState('search');

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
      <header className="bg-card shadow-lg border-b-4 border-primary">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {appData?.title || 'MERCILESS CWL TRACKER'}
                </h1>
                <p className="text-muted-foreground responsive-text">CWL Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/admin">
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-8 responsive-padding space-y-8 responsive-gap">
        <div className="flex items-center space-x-2">
          <img src="/images/archer-queen.png" alt="Archer Queen" className="h-6 w-6" />
          <h2 className="responsive-subheader font-semibold text-foreground">CWL Management Dashboard</h2>
        </div>
            
         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
           <TabsList className="grid w-full grid-cols-3 bg-muted rounded-xl p-1">
             <TabsTrigger 
               value="search" 
               className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium responsive-text"
             >
               <Search className="h-4 w-4 mr-2" />
               Find My Clan
             </TabsTrigger>
             <TabsTrigger 
               value="roster" 
               className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium responsive-text"
             >
               CWL Roster
             </TabsTrigger>
             <TabsTrigger 
               value="check" 
               className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium responsive-text"
             >
               Clan Check
             </TabsTrigger>
           </TabsList>

           <TabsContent value="search" className="mt-6">
             <PlayerSearch clans={appData?.clans || []} />
           </TabsContent>

           <TabsContent value="roster" className="mt-6">
             <ClanRoster clans={appData?.clans || []} />
           </TabsContent>

           <TabsContent value="check" className="mt-6">
             <ClanCheck clans={appData?.clans || []} />
           </TabsContent>
         </Tabs>
      </main>
    </div>
  );
};

export default Index;
