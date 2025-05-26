
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const AdminLogin = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(email, password)) {
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
      <div className="w-full max-w-md p-4">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-[#ff6f00]" />
            </div>
            <CardTitle className="text-2xl text-[#1a237e]">Admin Login</CardTitle>
            <p className="text-gray-600">Access the CWL Tracker management panel</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#1a237e] hover:bg-[#1a237e]/90"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/">
                <Button variant="outline" className="border-[#ff6f00] text-[#ff6f00] hover:bg-[#ff6f00] hover:text-white">
                  Back to Tracker
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
