import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Target, BarChart3, 
  ArrowRight, ChevronDown, Download, Calendar, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  campaigns, 
  marketingLeads, 
  syndicationStatuses,
  leadSources,
  type Campaign 
} from "@/data/marketing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChannelPerformance {
  channel: string;
  leads: number;
  cost: number;
  cpl: number;
  conversions: number;
  conversionRate: number;
  spend: number;
  roi: number;
}

const getChannelPerformance = (): ChannelPerformance[] => {
  const channelMap = new Map<string, ChannelPerformance>();
  
  // Aggregate from campaigns
  campaigns.forEach(c => {
    const existing = channelMap.get(c.channel) || {
      channel: c.channel,
      leads: 0,
      cost: 0,
      cpl: 0,
      conversions: 0,
      conversionRate: 0,
      spend: 0,
      roi: 0
    };
    
    existing.leads += c.leads_generated;
    existing.spend += c.spend_to_date;
    existing.conversions += Math.round(c.leads_generated * 0.08); // Simulated conversion
    
    channelMap.set(c.channel, existing);
  });

  // Calculate derived metrics
  return Array.from(channelMap.values()).map(ch => ({
    ...ch,
    cpl: ch.leads > 0 ? Math.round(ch.spend / ch.leads) : 0,
    conversionRate: ch.leads > 0 ? Math.round((ch.conversions / ch.leads) * 100 * 10) / 10 : 0,
    roi: ch.spend > 0 ? Math.round(((ch.conversions * 1500) / ch.spend) * 100) : 0 // Avg lease value $1500
  })).sort((a, b) => b.leads - a.leads);
};

const AttributionModelSelector = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (v: string) => void 
}) => (
  <div className="flex gap-1 border rounded-lg p-1 bg-muted/30">
    {['Last-touch', 'First-touch', 'Linear', 'Time-decay'].map((model) => (
      <Button
        key={model}
        variant={value === model ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange(model)}
        className="text-xs"
      >
        {model}
      </Button>
    ))}
  </div>
);

export function AttributionTab() {
  const [dateRange, setDateRange] = useState<string>("30d");
  const [attributionModel, setAttributionModel] = useState<string>("Last-touch");
  
  const channelPerformance = getChannelPerformance();

  // KPI calculations
  const totalLeads = marketingLeads.filter(l => !l.deleted_at).length;
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend_to_date, 0);
  const totalConversions = marketingLeads.filter(l => l.status === 'Leased').length;
  const costPerLead = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;
  const conversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : '0';
  const avgROI = Math.round(campaigns.reduce((sum, c) => sum + c.roi_percent, 0) / campaigns.length);

  // Funnel data
  const funnelData = [
    { stage: 'Impressions', count: 125000, percent: 100 },
    { stage: 'Clicks', count: 8750, percent: 7 },
    { stage: 'Leads', count: totalLeads * 100, percent: 0.6 },
    { stage: 'Tours', count: marketingLeads.filter(l => l.status === 'Tour Scheduled').length * 20, percent: 0.3 },
    { stage: 'Applications', count: marketingLeads.filter(l => l.status === 'Application Pending').length * 15, percent: 0.15 },
    { stage: 'Leases', count: totalConversions * 10, percent: 0.08 }
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <AttributionModelSelector value={attributionModel} onChange={setAttributionModel} />
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Leads</CardDescription>
            <CardTitle className="text-3xl">{(totalLeads * 100).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              <span>+12.5% vs last period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Cost Per Lead</CardDescription>
            <CardTitle className="text-3xl">${costPerLead}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-emerald-600">
              <TrendingDown className="h-4 w-4" />
              <span>-8% vs last period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Conversion Rate</CardDescription>
            <CardTitle className="text-3xl">{conversionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              <span>+1.2% vs last period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-primary/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Marketing ROI</CardDescription>
            <CardTitle className="text-3xl text-primary">{avgROI}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              <span>+23% vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Channel Performance Table */}
        <Card className="col-span-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>Performance breakdown by marketing channel ({attributionModel} attribution)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {channelPerformance.map((channel) => (
                <div 
                  key={channel.channel} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{channel.channel}</p>
                      {channel.roi > 200 && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">Top Performer</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{channel.leads} leads</span>
                      <span>${channel.cpl} CPL</span>
                      <span>${channel.spend.toLocaleString()} spend</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary text-lg">{channel.conversions} conversions</p>
                    <p className="text-sm text-muted-foreground">
                      {channel.conversionRate}% rate • {channel.roi}% ROI
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Lead progression through stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelData.map((stage, index) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <span className="text-sm text-muted-foreground">{stage.count.toLocaleString()}</span>
                  </div>
                  <div className="h-8 bg-muted rounded overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded transition-all",
                        index === 0 ? "bg-primary" :
                        index === funnelData.length - 1 ? "bg-emerald-500" :
                        "bg-primary/70"
                      )}
                      style={{ 
                        width: `${Math.max((stage.count / funnelData[0].count) * 100, 5)}%` 
                      }}
                    />
                  </div>
                  {index < funnelData.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Drill-down */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Attribution</CardTitle>
          <CardDescription>Click a campaign to view detailed event timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {campaigns.slice(0, 5).map((campaign) => (
              <div 
                key={campaign.id}
                className="border rounded-lg p-3 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
              >
                <p className="font-medium text-sm mb-1 line-clamp-1">{campaign.name}</p>
                <Badge variant="outline" className="text-xs mb-2">{campaign.channel}</Badge>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Leads</span>
                    <span className="font-medium text-foreground">{campaign.leads_generated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spend</span>
                    <span className="font-medium text-foreground">${campaign.spend_to_date.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI</span>
                    <span className="font-medium text-primary">{campaign.roi_percent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
