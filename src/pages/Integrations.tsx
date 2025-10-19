import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plug,
  Search,
  Code,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  Mail,
  MessageSquare,
  Calendar,
  Phone,
  FileText,
  CreditCard,
  Users,
  BarChart3,
  Key,
  Settings,
  ExternalLink,
  Copy,
  RefreshCw,
  Shield,
  Zap,
  Database,
  Cloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Integrations = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Connected integrations
  const connectedIntegrations = [
    {
      id: 1,
      name: 'QuickBooks Online',
      category: 'Accounting',
      icon: DollarSign,
      status: 'connected',
      lastSync: '2 hours ago',
      syncFrequency: 'Every 4 hours',
      description: 'Automated accounting and financial management'
    },
    {
      id: 2,
      name: 'Mailchimp',
      category: 'Marketing',
      icon: Mail,
      status: 'connected',
      lastSync: '1 day ago',
      syncFrequency: 'Daily',
      description: 'Email marketing and campaign management'
    },
    {
      id: 3,
      name: 'Twilio',
      category: 'Communications',
      icon: MessageSquare,
      status: 'connected',
      lastSync: '5 minutes ago',
      syncFrequency: 'Real-time',
      description: 'SMS and voice communication platform'
    },
    {
      id: 4,
      name: 'Google Calendar',
      category: 'Scheduling',
      icon: Calendar,
      status: 'warning',
      lastSync: '3 days ago',
      syncFrequency: 'Real-time',
      description: 'Calendar and appointment synchronization'
    }
  ];

  // Available integrations
  const availableIntegrations = [
    {
      id: 5,
      name: 'Stripe',
      category: 'Payments',
      icon: CreditCard,
      status: 'available',
      description: 'Online payment processing for rent and fees',
      popular: true,
      pricing: 'Free'
    },
    {
      id: 6,
      name: 'Zapier',
      category: 'Automation',
      icon: Zap,
      status: 'available',
      description: 'Connect to 5000+ apps with automated workflows',
      popular: true,
      pricing: 'Free'
    },
    {
      id: 7,
      name: 'DocuSign',
      category: 'Documents',
      icon: FileText,
      status: 'available',
      description: 'Electronic signature and document management',
      popular: true,
      pricing: 'Paid'
    },
    {
      id: 8,
      name: 'Salesforce',
      category: 'CRM',
      icon: Users,
      status: 'available',
      description: 'Advanced customer relationship management',
      popular: false,
      pricing: 'Paid'
    },
    {
      id: 9,
      name: 'RentRedi',
      category: 'Property Management',
      icon: Database,
      status: 'available',
      description: 'Rent collection and tenant screening',
      popular: true,
      pricing: 'Paid'
    },
    {
      id: 10,
      name: 'Checkr',
      category: 'Screening',
      icon: Shield,
      status: 'available',
      description: 'Background and credit checks for applicants',
      popular: true,
      pricing: 'Pay per use'
    },
    {
      id: 11,
      name: 'Slack',
      category: 'Communications',
      icon: MessageSquare,
      status: 'available',
      description: 'Team communication and notifications',
      popular: false,
      pricing: 'Free'
    },
    {
      id: 12,
      name: 'HubSpot',
      category: 'Marketing',
      icon: TrendingUp,
      status: 'available',
      description: 'Inbound marketing and sales platform',
      popular: false,
      pricing: 'Freemium'
    },
    {
      id: 13,
      name: 'Plaid',
      category: 'Payments',
      icon: CreditCard,
      status: 'available',
      description: 'Bank account verification and ACH payments',
      popular: true,
      pricing: 'Pay per use'
    },
    {
      id: 14,
      name: 'RingCentral',
      category: 'Communications',
      icon: Phone,
      status: 'available',
      description: 'Cloud phone system and video meetings',
      popular: false,
      pricing: 'Paid'
    }
  ];

  // Categories
  const categories = [
    { id: 'all', name: 'All', count: availableIntegrations.length },
    { id: 'Accounting', name: 'Accounting', count: 1 },
    { id: 'Payments', name: 'Payments', count: 2 },
    { id: 'Marketing', name: 'Marketing', count: 2 },
    { id: 'Communications', name: 'Communications', count: 3 },
    { id: 'Documents', name: 'Documents', count: 1 },
    { id: 'CRM', name: 'CRM', count: 1 },
    { id: 'Property Management', name: 'Property Mgmt', count: 1 },
    { id: 'Screening', name: 'Screening', count: 1 },
    { id: 'Automation', name: 'Automation', count: 1 }
  ];

  // API keys
  const apiKeys = [
    {
      id: 1,
      name: 'Production API Key',
      key: 'nxs_prod_key_abc123...',
      created: '2025-01-01',
      lastUsed: '2 hours ago',
      requests: 15420
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'nxs_dev_key_xyz789...',
      created: '2025-01-15',
      lastUsed: 'Never',
      requests: 0
    }
  ];

  // Webhooks
  const webhooks = [
    {
      id: 1,
      name: 'Lead Created Webhook',
      url: 'https://api.example.com/webhooks/lead',
      events: ['lead.created', 'lead.updated'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Application Status Webhook',
      url: 'https://api.example.com/webhooks/application',
      events: ['application.submitted', 'application.approved'],
      status: 'active'
    }
  ];

  const filteredIntegrations = availableIntegrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const handleConnect = (integrationName: string) => {
    toast({
      title: "Connecting...",
      description: `Connecting to ${integrationName}. You'll be redirected to authorize.`,
    });
  };

  const handleDisconnect = (integrationName: string) => {
    toast({
      title: "Disconnected",
      description: `${integrationName} has been disconnected.`,
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Plug className="h-8 w-8 text-blue-500" />
            Integrations
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect your favorite tools and manage API access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Code className="h-4 w-4 mr-2" />
            API Docs
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">3 syncing normally</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.4K</div>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">All active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">1 active key</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="marketplace">
            <Cloud className="h-4 w-4 mr-2" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="connected">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Connected
          </TabsTrigger>
          <TabsTrigger value="api">
            <Code className="h-4 w-4 mr-2" />
            API & Webhooks
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Settings className="h-4 w-4 mr-2" />
            Custom
          </TabsTrigger>
        </TabsList>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search integrations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name} ({category.count})
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Integrations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Integrations</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.filter(i => i.popular).map((integration) => {
                const Icon = integration.icon;
                return (
                  <Card key={integration.id} className="hover-scale">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Icon className="h-8 w-8 text-primary" />
                        <Badge variant="secondary">{integration.pricing}</Badge>
                      </div>
                      <CardTitle className="mt-4">{integration.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mb-2">{integration.category}</Badge>
                        <p className="mt-2">{integration.description}</p>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full" 
                        onClick={() => handleConnect(integration.name)}
                      >
                        <Plug className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* All Integrations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">All Integrations</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.filter(i => !i.popular).map((integration) => {
                const Icon = integration.icon;
                return (
                  <Card key={integration.id} className="hover-scale">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Icon className="h-8 w-8 text-primary" />
                        <Badge variant="secondary">{integration.pricing}</Badge>
                      </div>
                      <CardTitle className="mt-4">{integration.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mb-2">{integration.category}</Badge>
                        <p className="mt-2">{integration.description}</p>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full" 
                        onClick={() => handleConnect(integration.name)}
                      >
                        <Plug className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Connected Tab */}
        <TabsContent value="connected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Integrations</CardTitle>
              <CardDescription>Manage your active integrations and sync settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedIntegrations.map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <Card key={integration.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{integration.name}</h4>
                                <Badge variant={integration.status === 'connected' ? 'default' : 'destructive'}>
                                  {integration.status === 'connected' ? (
                                    <><CheckCircle2 className="h-3 w-3 mr-1" />Connected</>
                                  ) : (
                                    <><Clock className="h-3 w-3 mr-1" />Needs attention</>
                                  )}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{integration.description}</p>
                              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Last sync: {integration.lastSync}</span>
                                <span>•</span>
                                <span>Frequency: {integration.syncFrequency}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Sync Now
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3 mr-1" />
                              Configure
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDisconnect(integration.name)}
                            >
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Webhooks Tab */}
        <TabsContent value="api" className="space-y-4">
          {/* API Keys */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage your API keys for external access</CardDescription>
                </div>
                <Button>
                  <Key className="h-4 w-4 mr-2" />
                  Generate New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{apiKey.name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {apiKey.key}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCopyKey(apiKey.key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Created: {apiKey.created}</span>
                        <span>•</span>
                        <span>Last used: {apiKey.lastUsed}</span>
                        <span>•</span>
                        <span>Requests: {apiKey.requests.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Usage
                      </Button>
                      <Button variant="ghost" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Webhooks */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>Configure webhooks to receive real-time updates</CardDescription>
                </div>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{webhook.name}</h4>
                        <Badge variant="default">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {webhook.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <code className="bg-muted px-2 py-1 rounded">{webhook.url}</code>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {webhook.events.map((event, idx) => (
                          <Badge key={idx} variant="secondary">{event}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Learn how to integrate with Nexus API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <Code className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">REST API Reference</div>
                    <p className="text-xs text-muted-foreground mt-1">Complete API documentation</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Quick Start Guide</div>
                    <p className="text-xs text-muted-foreground mt-1">Get started in minutes</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-center">
                    <Database className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Code Examples</div>
                    <p className="text-xs text-muted-foreground mt-1">Sample implementations</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Tab */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Integration</CardTitle>
              <CardDescription>Build your own integration with Nexus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create custom integrations using our REST API, webhooks, and SDKs. Perfect for connecting internal tools or building specialized workflows.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">SDK Libraries</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        JavaScript / TypeScript
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Python
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Ruby
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        PHP
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Developer Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        API Playground
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Postman Collection
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Code className="h-4 w-4 mr-2" />
                        OpenAPI Spec
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Developer Forum
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integrations;
