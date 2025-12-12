import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockLogin } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { Building2 } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !role) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await mockLogin(email, password, role);
      toast({
        title: 'Welcome to Nexus!',
        description: 'Successfully logged in',
      });
      // Redirect tenants to tenant portal, others to dashboard
      navigate(role === 'tenant' ? '/tenant-portal' : '/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (demoRole: string) => {
    setEmail(`demo.${demoRole}@nexus.com`);
    setPassword('demo123');
    setRole(demoRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl nexus-gradient-primary mb-4 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nexus
          </h1>
          <p className="text-muted-foreground mt-2">Unified Real Estate CRM + PMS</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Choose your role to explore the demo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="demo@nexus.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
              <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="property_manager">Property Manager</SelectItem>
                    <SelectItem value="leasing_agent">Leasing Agent</SelectItem>
                    <SelectItem value="maintenance_tech">Maintenance Tech</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full nexus-gradient-primary text-white hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-3 text-center">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('admin')}
                  type="button"
                >
                  Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('property_manager')}
                  type="button"
                >
                  Manager
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('leasing_agent')}
                  type="button"
                >
                  Agent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('maintenance_tech')}
                  type="button"
                >
                  Tech
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('tenant')}
                  type="button"
                >
                  Tenant
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('owner')}
                  type="button"
                >
                  Owner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          This is a frontend demo. All data is simulated.
        </p>
      </div>
    </div>
  );
};

export default Auth;
