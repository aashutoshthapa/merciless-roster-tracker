import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8 responsive-padding">
      {/* Main Content */}
      <div className="container mx-auto flex flex-col items-center text-center space-y-8 responsive-gap">
        <h1 className="responsive-header font-bold">moclytics</h1> {/* Placeholder title */}
        <p className="responsive-text text-muted-foreground max-w-2xl"> {/* Placeholder description */}
          Get your profile stats for mo.co, and find strategies to beat the hardest
          Rifts and Dojos!
        </p>

        {/* Search Input (example) */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
          <input
            type="text"
            placeholder="Enter hunter tag (e.g. 2YC8)"
            className="flex-1 px-4 py-2 rounded-md border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground responsive-text px-6 py-2 rounded-md">
            Search <Search className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Info Cards */}
        <div className="responsive-grid w-full max-w-4xl mx-auto pt-8 responsive-padding">
          <Card className="card bg-card text-card-foreground rounded-xl">
            <CardHeader>
              <CardTitle className="responsive-subheader font-semibold">Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="responsive-text text-muted-foreground">View your mo.co hunter stats</p>
            </CardContent>
          </Card>

          <Card className="card bg-card text-card-foreground rounded-xl">
            <CardHeader>
              <CardTitle className="responsive-subheader font-semibold">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="responsive-text text-muted-foreground">Check out the top 200 mo.co players!</p>
            </CardContent>
          </Card>

          <Card className="card bg-card text-card-foreground rounded-xl col-span-full sm:col-span-1"> {/* Adjust span for mobile */}
             <CardHeader className="flex flex-row justify-between items-center">
               <CardTitle className="responsive-subheader font-semibold">Guides</CardTitle>
               <Badge variant="destructive" className="bg-destructive text-destructive-foreground">NEW</Badge>
             </CardHeader>
             <CardContent>
               <p className="responsive-text text-muted-foreground">Browse guides from top mo.co players</p>
             </CardContent>
           </Card>
        </div>

      </div>

      {/* Theme Toggle in bottom-right */}
      <div className="fixed bottom-4 right-4 z-10">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default LandingPage; 