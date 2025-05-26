
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center text-gray-700">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading CWL Tracker...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center text-gray-700">
          <p className="text-red-500 mb-4">Error loading data</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg border-b-4 border-orange-400">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-10 w-10 text-orange-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {appData?.title || 'MERCILESS CWL TRACKER'}
                </h1>
                <p className="text-blue-100">Clash of Clans War League Management</p>
              </div>
            </div>
            <Link to="/admin">
              <Button variant="outline" className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white bg-white/10 backdrop-blur-sm">
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-6 w-6 text-orange-500" />
              <CardTitle className="text-2xl text-gray-800">CWL Management Dashboard</CardTitle>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl">
                <TabsTrigger 
                  value="roster" 
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg"
                >
                  CWL Roster
                </TabsTrigger>
                <TabsTrigger 
                  value="check" 
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg"
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
