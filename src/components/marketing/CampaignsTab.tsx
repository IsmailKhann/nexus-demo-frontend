import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Mail, MessageSquare, Zap, TrendingUp, Play, Pause, Plus, Eye, Edit, Copy, 
  Search, Archive, DollarSign, Target, Users, Calendar, ExternalLink, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  campaigns as importedCampaigns, 
  templates as importedTemplates,
  users,
  type Campaign 
} from "@/data/marketing";

interface CampaignWithMetrics extends Campaign {
  type?: string;
  audience?: number;
  sent?: number;
  opened?: number;
  clicked?: number;
  converted?: number;
}

const transformCampaigns = (campaigns: Campaign[]): CampaignWithMetrics[] => {
  return campaigns.map(c => ({
    ...c,
    type: c.channel.toLowerCase(),
    audience: c.leads_generated * 10,
    sent: c.leads_generated * 8,
    opened: Math.round(c.leads_generated * 8 * 0.63),
    clicked: Math.round(c.leads_generated * 8 * 0.19),
    converted: c.leads_generated
  }));
};

const getOwnerName = (userId: string) => {
  const user = users.find(u => u.id === userId);
  return user?.full_name || 'Unknown';
};

const getChannelIcon = (channel: string) => {
  const lc = channel.toLowerCase();
  if (lc === 'email') return <Mail className="h-3.5 w-3.5" />;
  if (lc === 'sms') return <MessageSquare className="h-3.5 w-3.5" />;
  if (lc === 'ppc' || lc === 'display') return <Target className="h-3.5 w-3.5" />;
  if (lc === 'social') return <Users className="h-3.5 w-3.5" />;
  return <Zap className="h-3.5 w-3.5" />;
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    case 'scheduled': return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'completed': return 'bg-slate-500/10 text-slate-600 border-slate-200';
    case 'draft': return 'bg-amber-500/10 text-amber-600 border-amber-200';
    case 'paused': return 'bg-orange-500/10 text-orange-600 border-orange-200';
    default: return 'bg-muted text-muted-foreground';
  }
};

interface CampaignsTabProps {
  onNewCampaign: () => void;
}

export function CampaignsTab({ onNewCampaign }: CampaignsTabProps) {
  const [campaigns] = useState<CampaignWithMetrics[]>(transformCampaigns(importedCampaigns));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'Active').length,
    scheduled: campaigns.filter(c => c.status === 'Scheduled').length,
    avgRoi: Math.round(campaigns.reduce((sum, c) => sum + c.roi_percent, 0) / campaigns.length)
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Campaigns</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-emerald-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Active</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Scheduled</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.scheduled}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Avg ROI</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-1">
              {stats.avgRoi}%
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>Email, SMS, PPC, and social campaigns</CardDescription>
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
              <div className="flex gap-1 border rounded-lg p-1">
                {['all', 'active', 'scheduled', 'completed', 'draft'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="text-xs capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
              <Button onClick={onNewCampaign} className="gap-2 crm-gradient-primary">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCampaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                className="border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all bg-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                      <Badge className={cn("text-xs", getStatusColor(campaign.status))}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-xs">
                        {getChannelIcon(campaign.channel)}
                        {campaign.channel}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {campaign.start_date} — {campaign.end_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        ${campaign.spend_to_date.toLocaleString()} / ${campaign.budget.toLocaleString()}
                      </span>
                      <span>Owner: {getOwnerName(campaign.created_by_user_id)}</span>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-4">
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Audience</p>
                        <p className="text-lg font-semibold">{campaign.audience?.toLocaleString()}</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Sent</p>
                        <p className="text-lg font-semibold">{campaign.sent?.toLocaleString()}</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Opened</p>
                        <p className="text-lg font-semibold">
                          {campaign.opened?.toLocaleString()}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({campaign.sent && campaign.sent > 0 ? Math.round((campaign.opened! / campaign.sent) * 100) : 0}%)
                          </span>
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Clicked</p>
                        <p className="text-lg font-semibold">
                          {campaign.clicked?.toLocaleString()}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({campaign.opened && campaign.opened > 0 ? Math.round((campaign.clicked! / campaign.opened) * 100) : 0}%)
                          </span>
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Converted</p>
                        <p className="text-lg font-semibold text-primary">{campaign.converted || 0}</p>
                      </div>
                      <div className="bg-primary/5 rounded p-2 border border-primary/20">
                        <p className="text-xs text-muted-foreground">ROI</p>
                        <p className="text-lg font-semibold text-primary">{campaign.roi_percent}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 ml-4">
                    <Button variant="ghost" size="icon" title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Duplicate">
                      <Copy className="h-4 w-4" />
                    </Button>
                    {campaign.status === 'Active' ? (
                      <Button variant="ghost" size="icon" title="Pause">
                        <Pause className="h-4 w-4" />
                      </Button>
                    ) : campaign.status === 'Paused' ? (
                      <Button variant="ghost" size="icon" title="Resume">
                        <Play className="h-4 w-4" />
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="icon" title="Archive">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Email & SMS Templates</h3>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {importedTemplates.map((template) => (
                <div 
                  key={template.id} 
                  className="border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1 text-xs">
                        {template.type === "email" ? <Mail className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                        {template.type}
                      </Badge>
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  {template.subject && (
                    <p className="text-xs font-medium text-muted-foreground mb-1">{template.subject}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2">{template.body.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
