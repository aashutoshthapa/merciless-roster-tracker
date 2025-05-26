
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, Users, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClanRoster } from '@/components/ClanRoster';
import { ClanCheck } from '@/components/ClanCheck';
import { clanDataService } from '@/services/clanDataService';

const Index = () => {
  const [activeTab, setActiveTab] = useState('roster');

  const { data: appData, isLoading, error } = useQuery({
    queryKey: ['app-data'],
    queryFn: () => clanDataService.getClanData(),
    refetchInterval: 30000, // Refetch every 30 seconds to keep data fresh
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading CWL Tracker...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-red-400 mb-4">Error loading data</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-slate-900"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-[#1a237e] shadow-2xl border-b-4 border-[#ff6f00]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-10 w-10 text-[#ff6f00]" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {appData?.title || 'MERCILESS CWL TRACKER'}
                </h1>
                <p className="text-blue-200">Clash of Clans War League Management</p>
              </div>
            </div>
            <Link to="/admin">
              <Button variant="outline" className="border-[#ff6f00] text-[#ff6f00] hover:bg-[#ff6f00] hover:text-white">
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-6 w-6 text-[#ff6f00]" />
              <CardTitle className="text-2xl text-[#1a237e]">CWL Management Dashboard</CardTitle>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                <TabsTrigger 
                  value="roster" 
                  className="data-[state=active]:bg-[#1a237e] data-[state=active]:text-white"
                >
                  CWL Roster
                </TabsTrigger>
                <TabsTrigger 
                  value="check" 
                  className="data-[state=active]:bg-[#ff6f00] data-[state=active]:text-white"
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
