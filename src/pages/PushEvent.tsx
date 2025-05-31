import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PushEventForm } from '@/components/PushEventForm';
import { PushEventLeaderboard } from '@/components/PushEventLeaderboard';

const PushEvent = () => {
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
              <img src="/images/archer-queen.png" alt="Archer Queen" className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  PUSH EVENT
                </h1>
                <p className="text-muted-foreground">Trophy Push Tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/">
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Back to Home
                </Button>
              </Link>
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
      <main className="container mx-auto p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Join the Trophy Push Competition
          </h2>
          <p className="text-muted-foreground">
            Track your progress and compete with other players for the highest trophy count!
          </p>
        </div>

        {/* Sign-up Form */}
        <div className="flex justify-center">
          <PushEventForm onPlayerAdded={handlePlayerAdded} />
        </div>

        {/* Leaderboard */}
        <PushEventLeaderboard refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
};

export default PushEvent; 