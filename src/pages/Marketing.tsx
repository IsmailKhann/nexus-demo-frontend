import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, MessageSquare, Send, Users, Target, Megaphone, 
  TrendingUp, Play, Pause, Plus, Eye, Edit, Copy, 
  Trash2, ChevronRight, Clock, Zap, Globe, BarChart3,
  Bot, Sparkles, Filter, Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "sms" | "drip";
  status: "draft" | "active" | "paused" | "completed";
  audience: number;
  sent: number;
  opened?: number;
  clicked?: number;
  converted?: number;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  type: "email" | "sms";
  subject?: string;
  preview: string;
}

interface Listing {
  id: string;
  propertyName: string;
  unitNumber: string;
  beds: number;
  baths: number;
  rent: number;
  syndicatedTo: {
    zillow: boolean;
    apartments: boolean;
    realtor: boolean;
    trulia: boolean;
  };
}

const mockCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "Spring Move-In Special",
    type: "email",
    status: "active",
    audience: 450,
    sent: 450,
    opened: 287,
    clicked: 89,
    converted: 12,
    createdAt: "2025-01-10T10:00:00Z"
  },
  {
    id: "camp-2",
    name: "Tour Reminder Drip",
    type: "drip",
    status: "active",
    audience: 124,
    sent: 98,
    opened: 76,
    clicked: 34,
    converted: 8,
    createdAt: "2025-01-05T14:30:00Z"
  },
  {
    id: "camp-3",
    name: "Weekend Availability SMS",
    type: "sms",
    status: "completed",
    audience: 220,
    sent: 220,
    converted: 15,
    createdAt: "2025-01-12T09:00:00Z"
  },
  {
    id: "camp-4",
    name: "Renewal Incentive Campaign",
    type: "email",
    status: "draft",
    audience: 0,
    sent: 0,
    createdAt: "2025-01-15T16:00:00Z"
  }
];

const mockTemplates: Template[] = [
  {
    id: "tmpl-1",
    name: "Welcome to Community",
    type: "email",
    subject: "Welcome to {{property_name}}!",
    preview: "Thank you for your interest in {{property_name}}. We're excited to help you find your new home..."
  },
  {
    id: "tmpl-2",
    name: "Tour Follow-Up",
    type: "email",
    subject: "Thank you for touring {{property_name}}",
    preview: "Hi {{first_name}}, it was great showing you around today! Here's what we discussed..."
  },
  {
    id: "tmpl-3",
    name: "Quick Availability Alert",
    type: "sms",
    preview: "Hi {{first_name}}! A {{beds}}BR just became available at {{property_name}}. Move-in ready! Reply YES for details."
  },
  {
    id: "tmpl-4",
    name: "Application Reminder",
    type: "sms",
    preview: "{{first_name}}, your application is almost complete! Just 2 steps left. Click here: {{link}}"
  }
];

const mockListings: Listing[] = [
  {
    id: "list-1",
    propertyName: "Sunset Towers",
    unitNumber: "205",
    beds: 2,
    baths: 2,
    rent: 2200,
    syndicatedTo: { zillow: true, apartments: true, realtor: true, trulia: false }
  },
  {
    id: "list-2",
    propertyName: "Harbor View Apartments",
    unitNumber: "102",
    beds: 1,
    baths: 1,
    rent: 1650,
    syndicatedTo: { zillow: true, apartments: true, realtor: false, trulia: true }
  },
  {
    id: "list-3",
    propertyName: "Downtown Lofts",
    unitNumber: "8B",
    beds: 2,
    baths: 1,
    rent: 1950,
    syndicatedTo: { zillow: true, apartments: false, realtor: true, trulia: true }
  }
];

export default function Marketing() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [aliaOpen, setAliaOpen] = useState(false);
  const [aliaChatHistory, setAliaChatHistory] = useState<Array<{role: 'user' | 'alia'; message: string}>>([
    { role: 'alia', message: 'Hi! I\'m ALIA, your AI Leasing Assistant. How can I help you with your marketing campaigns today?' }
  ]);
  const [aliaInput, setAliaInput] = useState("");

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSyndication = (listingId: string, platform: keyof Listing['syndicatedTo']) => {
    setListings(prev => prev.map(listing => {
      if (listing.id === listingId) {
        return {
          ...listing,
          syndicatedTo: {
            ...listing.syndicatedTo,
            [platform]: !listing.syndicatedTo[platform]
          }
        };
      }
      return listing;
    }));
    
    toast({
      title: "Syndication Updated",
      description: `Listing syndication preferences saved.`
    });
  };

  const handleAliaMessage = () => {
    if (!aliaInput.trim()) return;
    
    const userMessage = aliaInput;
    setAliaChatHistory(prev => [...prev, { role: 'user', message: userMessage }]);
    setAliaInput("");
    
    // Simulate ALIA response
    setTimeout(() => {
      let response = "I can help with that! ";
      if (userMessage.toLowerCase().includes('campaign')) {
        response += "To create a new campaign, click the 'New Campaign' button and choose your audience. Would you like me to suggest segments based on your current leads?";
      } else if (userMessage.toLowerCase().includes('template')) {
        response += "I found 4 email templates and 2 SMS templates. The 'Tour Follow-Up' template has a 68% open rate. Would you like to use it?";
      } else if (userMessage.toLowerCase().includes('performance')) {
        response += "Your campaigns this month show a 63% open rate and 19% click-through rate, which is above industry average! The 'Spring Move-In Special' is your top performer.";
      } else {
        response += "I can help you create campaigns, analyze performance, build audience segments, or optimize your drip sequences. What would you like to do?";
      }
      setAliaChatHistory(prev => [...prev, { role: 'alia', message: response }]);
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Automation</h1>
          <p className="text-muted-foreground">Campaign builder, drip sequences, and listing syndication</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAliaOpen(true)} variant="outline" className="gap-2">
            <Bot className="h-4 w-4" />
            Ask ALIA
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="drip">Drip Sequences</TabsTrigger>
          <TabsTrigger value="syndication">Listing Syndication</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Campaigns</CardTitle>
                  <CardDescription>Email, SMS, and automated drip campaigns</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredCampaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <Badge variant={
                            campaign.status === "active" ? "default" :
                            campaign.status === "completed" ? "secondary" :
                            "outline"
                          }>
                            {campaign.status}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            {campaign.type === "email" ? <Mail className="h-3 w-3" /> :
                             campaign.type === "sms" ? <MessageSquare className="h-3 w-3" /> :
                             <Zap className="h-3 w-3" />}
                            {campaign.type}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Audience</p>
                            <p className="text-lg font-semibold">{campaign.audience}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Sent</p>
                            <p className="text-lg font-semibold">{campaign.sent}</p>
                          </div>
                          {campaign.opened !== undefined && (
                            <div>
                              <p className="text-sm text-muted-foreground">Opened</p>
                              <p className="text-lg font-semibold">
                                {campaign.opened} 
                                <span className="text-sm text-muted-foreground ml-1">
                                  ({campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%)
                                </span>
                              </p>
                            </div>
                          )}
                          {campaign.clicked !== undefined && (
                            <div>
                              <p className="text-sm text-muted-foreground">Clicked</p>
                              <p className="text-lg font-semibold">
                                {campaign.clicked}
                                <span className="text-sm text-muted-foreground ml-1">
                                  ({campaign.opened && campaign.opened > 0 ? Math.round((campaign.clicked / campaign.opened) * 100) : 0}%)
                                </span>
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground">Converted</p>
                            <p className="text-lg font-semibold text-primary">{campaign.converted || 0}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Email & SMS Templates</h3>
                <div className="grid grid-cols-2 gap-3">
                  {mockTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1">
                            {template.type === "email" ? <Mail className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                            {template.type}
                          </Badge>
                          <span className="font-medium text-sm">{template.name}</span>
                        </div>
                      </div>
                      {template.subject && (
                        <p className="text-xs font-medium text-muted-foreground mb-1">{template.subject}</p>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.preview}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drip Sequence Builder</CardTitle>
              <CardDescription>Create automated multi-step campaigns with triggers and delays</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Visual Drip Sequence Builder</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create multi-step campaigns with triggers, delays, and conditional logic
                  </p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Sequence
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Active Sequences</h3>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">New Lead Welcome Sequence</h4>
                          <p className="text-sm text-muted-foreground">5 steps • 124 active leads</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="default">Active</Badge>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 ml-12">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 border rounded-lg p-3 bg-background">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="text-sm">Welcome Email</span>
                          <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-6">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Wait 2 days</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 border rounded-lg p-3 bg-background">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="text-sm">Follow-up SMS</span>
                          <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-6">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Wait 3 days</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 border rounded-lg p-3 bg-background">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="text-sm">Tour Invitation</span>
                          <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Post-Tour Follow-Up</h4>
                          <p className="text-sm text-muted-foreground">3 steps • 45 active leads</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="default">Active</Badge>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 ml-12">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 border rounded-lg p-3 bg-background">
                          <Mail className="h-4 w-4 text-accent" />
                          <span className="text-sm">Thank You Email</span>
                          <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-6">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Wait 1 day</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 border rounded-lg p-3 bg-background">
                          <MessageSquare className="h-4 w-4 text-accent" />
                          <span className="text-sm">Application Reminder</span>
                          <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syndication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listing Syndication</CardTitle>
              <CardDescription>Manage where your listings appear across rental platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{listing.propertyName} - Unit {listing.unitNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {listing.beds} bed • {listing.baths} bath • ${listing.rent.toLocaleString()}/mo
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span className="text-sm font-medium">Zillow</span>
                        </div>
                        <Switch
                          checked={listing.syndicatedTo.zillow}
                          onCheckedChange={() => handleToggleSyndication(listing.id, 'zillow')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span className="text-sm font-medium">Apartments.com</span>
                        </div>
                        <Switch
                          checked={listing.syndicatedTo.apartments}
                          onCheckedChange={() => handleToggleSyndication(listing.id, 'apartments')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span className="text-sm font-medium">Realtor.com</span>
                        </div>
                        <Switch
                          checked={listing.syndicatedTo.realtor}
                          onCheckedChange={() => handleToggleSyndication(listing.id, 'realtor')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span className="text-sm font-medium">Trulia</span>
                        </div>
                        <Switch
                          checked={listing.syndicatedTo.trulia}
                          onCheckedChange={() => handleToggleSyndication(listing.id, 'trulia')}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Attribution</CardTitle>
              <CardDescription>Multi-touch attribution and ROI analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total Leads</CardDescription>
                      <CardTitle className="text-3xl">1,247</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1 text-sm text-accent">
                        <TrendingUp className="h-4 w-4" />
                        <span>+12.5% vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Cost Per Lead</CardDescription>
                      <CardTitle className="text-3xl">$42</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1 text-sm text-accent">
                        <TrendingUp className="h-4 w-4" />
                        <span>-8% vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Conversion Rate</CardDescription>
                      <CardTitle className="text-3xl">6.8%</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1 text-sm text-accent">
                        <TrendingUp className="h-4 w-4" />
                        <span>+1.2% vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Marketing ROI</CardDescription>
                      <CardTitle className="text-3xl">385%</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1 text-sm text-accent">
                        <TrendingUp className="h-4 w-4" />
                        <span>+23% vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Channel Performance</h3>
                  <div className="space-y-3">
                    {[
                      { channel: "ILS (Apartments.com)", leads: 458, cost: 38, conversions: 34 },
                      { channel: "Website", leads: 312, cost: 28, conversions: 28 },
                      { channel: "SMS Campaigns", leads: 245, cost: 52, conversions: 18 },
                      { channel: "Email Campaigns", leads: 189, cost: 45, conversions: 12 },
                      { channel: "Referrals", leads: 43, cost: 15, conversions: 8 }
                    ].map((item) => (
                      <div key={item.channel} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.channel}</p>
                          <p className="text-sm text-muted-foreground">{item.leads} leads • ${item.cost} CPL</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">{item.conversions} conversions</p>
                          <p className="text-sm text-muted-foreground">
                            {((item.conversions / item.leads) * 100).toFixed(1)}% rate
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ALIA Chat Widget */}
      <Dialog open={aliaOpen} onOpenChange={setAliaOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              ALIA - AI Marketing Assistant
            </DialogTitle>
            <DialogDescription>
              Get instant help with campaigns, audience segments, and performance insights
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {aliaChatHistory.map((msg, idx) => (
                <div key={idx} className={cn("flex gap-3", msg.role === 'user' && "justify-end")}>
                  {msg.role === 'alia' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    msg.role === 'alia' ? "bg-muted" : "bg-primary text-primary-foreground"
                  )}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              placeholder="Ask ALIA about your marketing..."
              value={aliaInput}
              onChange={(e) => setAliaInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAliaMessage()}
            />
            <Button onClick={handleAliaMessage} className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
