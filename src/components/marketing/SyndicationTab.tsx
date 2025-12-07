import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Globe, Search, Eye, AlertCircle, CheckCircle, Clock, 
  ExternalLink, Upload, RefreshCw, Image as ImageIcon, Building, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  syndicationStatuses, 
  properties, 
  units,
  type SyndicationStatus,
  type Property,
  type Unit
} from "@/data/marketing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertyWithSyndication extends Property {
  syndicationChannels: SyndicationStatus[];
  unitCount: number;
  vacantCount: number;
}

const getPropertyWithSyndication = (): PropertyWithSyndication[] => {
  return properties.map(prop => ({
    ...prop,
    syndicationChannels: syndicationStatuses.filter(s => s.property_id === prop.id),
    unitCount: units.filter(u => u.property_id === prop.id).length,
    vacantCount: units.filter(u => u.property_id === prop.id && u.status === 'Vacant').length
  }));
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'published': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'sync error': return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'manual': return <Clock className="h-4 w-4 text-amber-500" />;
    case 'unpublished': return <Globe className="h-4 w-4 text-muted-foreground" />;
    default: return <Globe className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'published': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    case 'sync error': return 'bg-red-500/10 text-red-600 border-red-200';
    case 'manual': return 'bg-amber-500/10 text-amber-600 border-amber-200';
    case 'unpublished': return 'bg-slate-500/10 text-slate-600 border-slate-200';
    default: return 'bg-muted text-muted-foreground';
  }
};

const CHANNELS = ['Zillow', 'Apartments.com', 'Realtor.com', 'Craigslist', 'Facebook Marketplace', 'LuxuryEstates.com'];

export function SyndicationTab() {
  const { toast } = useToast();
  const [propertiesData, setPropertiesData] = useState<PropertyWithSyndication[]>(getPropertyWithSyndication());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithSyndication | null>(null);
  const [channelFilter, setChannelFilter] = useState<string>("all");

  const filteredProperties = propertiesData.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSyndication = (propertyId: string, channelName: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Published' ? 'Unpublished' : 'Published';
    
    setPropertiesData(prev => prev.map(prop => {
      if (prop.id === propertyId) {
        const existingChannel = prop.syndicationChannels.find(c => c.channel_name === channelName);
        if (existingChannel) {
          return {
            ...prop,
            syndicationChannels: prop.syndicationChannels.map(c => 
              c.channel_name === channelName 
                ? { ...c, status: newStatus, last_synced_at: new Date().toISOString() }
                : c
            )
          };
        }
      }
      return prop;
    }));

    toast({
      title: "Syndication Updated",
      description: `${channelName} listing ${newStatus.toLowerCase()} for ${propertiesData.find(p => p.id === propertyId)?.name}`
    });
  };

  // Stats
  const totalViews = syndicationStatuses.reduce((sum, s) => sum + s.views_last_30d, 0);
  const totalLeads = syndicationStatuses.reduce((sum, s) => sum + s.leads_last_30d, 0);
  const publishedCount = syndicationStatuses.filter(s => s.status === 'Published').length;
  const errorCount = syndicationStatuses.filter(s => s.status === 'Sync Error').length;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Views (30d)</CardDescription>
            <CardTitle className="text-2xl">{totalViews.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Leads Generated (30d)</CardDescription>
            <CardTitle className="text-2xl text-primary">{totalLeads}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-emerald-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Published Listings</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">{publishedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={cn(errorCount > 0 && "border-red-200")}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Sync Errors</CardDescription>
            <CardTitle className={cn("text-2xl", errorCount > 0 ? "text-red-600" : "text-muted-foreground")}>
              {errorCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Listing Syndication</CardTitle>
              <CardDescription>Manage where your listings appear across rental platforms</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  {CHANNELS.map(ch => (
                    <SelectItem key={ch} value={ch}>{ch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Sync All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <div 
                key={property.id} 
                className="border rounded-lg overflow-hidden hover:border-primary/50 transition-all"
              >
                {/* Property Header */}
                <div className="bg-muted/30 p-4 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {property.address_line1}, {property.city}, {property.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{property.unitCount} Units</p>
                        <p className="text-xs text-muted-foreground">{property.vacantCount} Vacant</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Syndication Channels */}
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {CHANNELS.map((channelName) => {
                      const channelData = property.syndicationChannels.find(
                        c => c.channel_name === channelName
                      );
                      const isPublished = channelData?.status === 'Published';
                      const hasError = channelData?.status === 'Sync Error';

                      return (
                        <div 
                          key={channelName}
                          className={cn(
                            "border rounded-lg p-3 transition-all",
                            hasError && "border-red-200 bg-red-50/50",
                            isPublished && !hasError && "border-emerald-200 bg-emerald-50/30"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{channelName}</span>
                            </div>
                            <Switch
                              checked={isPublished}
                              onCheckedChange={() => handleToggleSyndication(
                                property.id, 
                                channelName, 
                                channelData?.status || 'Unpublished'
                              )}
                              disabled={hasError}
                            />
                          </div>
                          
                          {channelData ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(channelData.status)}
                                <Badge className={cn("text-xs", getStatusBadge(channelData.status))}>
                                  {channelData.status}
                                </Badge>
                                {channelData.is_featured && (
                                  <Badge variant="secondary" className="text-xs">Featured</Badge>
                                )}
                              </div>
                              
                              {channelData.status === 'Published' && (
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                                  <span>{channelData.views_last_30d} views</span>
                                  <span>{channelData.leads_last_30d} leads</span>
                                  {channelData.listing_url && (
                                    <a 
                                      href={`https://${channelData.listing_url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-primary hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      View
                                    </a>
                                  )}
                                </div>
                              )}

                              {hasError && channelData.error_log && (
                                <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="font-medium">Sync Error:</p>
                                      <p>{channelData.error_log}</p>
                                      <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="h-auto p-0 text-xs text-red-700 underline mt-1"
                                      >
                                        <Upload className="h-3 w-3 mr-1" />
                                        Replace Image
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {channelData.last_synced_at && channelData.status !== 'Sync Error' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Last synced: {new Date(channelData.last_synced_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Not configured</p>
                          )}
                        </div>
                      );
                    })}
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
