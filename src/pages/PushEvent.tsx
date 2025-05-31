import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { PushEventForm } from '@/components/PushEventForm';
import { PushEventLeaderboard } from '@/components/PushEventLeaderboard';
import { EODLeaderboard } from '@/components/EODLeaderboard';

const PushEvent = () => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePlayerAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

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
              <h1 className="text-2xl font-bold text-foreground">Push Event</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-1">
            <PushEventForm onPlayerAdded={handlePlayerAdded} />
          </div>

          {/* Leaderboards */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="live" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="live">Live Leaderboard</TabsTrigger>
                <TabsTrigger value="eod">Last EOD Leaderboard</TabsTrigger>
              </TabsList>

              <TabsContent value="live">
                <PushEventLeaderboard refreshTrigger={refreshTrigger} />
              </TabsContent>

              <TabsContent value="eod">
                <EODLeaderboard />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PushEvent; 