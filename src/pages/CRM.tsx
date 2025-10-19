import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchLeads, updateLeadStatus } from '@/lib/mockApi';
import type { Lead } from '@/types';
import { Search, Filter, Phone, Mail, MessageSquare, Calendar, User, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<Lead['status'], string> = {
  new: 'bg-blue-500',
  contacted: 'bg-yellow-500',
  tour_scheduled: 'bg-purple-500',
  applied: 'bg-indigo-500',
  leased: 'bg-green-500',
  lost: 'bg-gray-500',
};

const sourceIcons: Record<Lead['source'], typeof Phone> = {
  phone: Phone,
  email: Mail,
  sms: MessageSquare,
  website: TrendingUp,
  ils: TrendingUp,
  referral: User,
  walk_in: User,
};

const CRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [searchQuery, statusFilter, leads]);

  const loadLeads = async () => {
    try {
      const data = await fetchLeads();
      setLeads(data);
      setFilteredLeads(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load leads',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    if (searchQuery) {
      filtered = filtered.filter((lead) =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  };

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
      toast({
        title: 'Status updated',
        description: 'Lead status has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lead status',
        variant: 'destructive',
      });
    }
  };

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getSourceIcon = (source: Lead['source']) => {
    const Icon = sourceIcons[source];
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM & Leads</h1>
          <p className="text-muted-foreground">Omni-channel lead management and tracking</p>
        </div>
        <Button className="nexus-gradient-primary text-white">
          <User className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-3xl">{leads.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New This Week</CardDescription>
            <CardTitle className="text-3xl">{leads.filter(l => l.status === 'new').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tours Scheduled</CardDescription>
            <CardTitle className="text-3xl">{leads.filter(l => l.status === 'tour_scheduled').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversion Rate</CardDescription>
            <CardTitle className="text-3xl">
              {((leads.filter(l => l.status === 'leased').length / leads.length) * 100).toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="tour_scheduled">Tour Scheduled</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="leased">Leased</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">Loading leads...</CardContent>
          </Card>
        ) : filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No leads found matching your criteria
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => (
            <Card
              key={lead.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openLeadDetail(lead)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.email}`} />
                    <AvatarFallback>{lead.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{lead.name}</h3>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[lead.status]} text-white`}
                      >
                        {lead.status.replace('_', ' ')}
                      </Badge>
                      {lead.sentiment && (
                        <Badge variant="outline" className="capitalize">
                          {lead.sentiment}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {getSourceIcon(lead.source)}
                        {lead.source}
                      </span>
                      <span>{lead.email}</span>
                      <span>{lead.phone}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium mb-1">Score: {lead.leadScore}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Lead Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedLead.email}`} />
                    <AvatarFallback>
                      {selectedLead.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{selectedLead.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Lead Score: {selectedLead.leadScore}
                    </div>
                  </div>
                </SheetTitle>
                <SheetDescription>
                  Unified profile across all inquiries and touchpoints
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="timeline" className="mt-6">
                <TabsList className="w-full">
                  <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="actions" className="flex-1">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="space-y-4 mt-4">
                  {selectedLead.timeline.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {event.type === 'call' && <Phone className="h-4 w-4" />}
                            {event.type === 'email' && <Mail className="h-4 w-4" />}
                            {event.type === 'sms' && <MessageSquare className="h-4 w-4" />}
                            {event.type === 'tour' && <Calendar className="h-4 w-4" />}
                            {event.type === 'note' && <User className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="capitalize">
                                {event.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm">{event.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedLead.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{selectedLead.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Language:</span>
                        <span className="font-medium">{selectedLead.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Source:</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedLead.source}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Lead Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={`${statusColors[selectedLead.status]} text-white capitalize`}>
                          {selectedLead.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lead Score:</span>
                        <span className="font-medium">{selectedLead.leadScore}/100</span>
                      </div>
                      {selectedLead.sentiment && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sentiment:</span>
                          <Badge variant="outline" className="capitalize">
                            {selectedLead.sentiment}
                          </Badge>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">{formatDate(selectedLead.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="actions" className="space-y-3 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Change Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={selectedLead.status}
                        onValueChange={(value) => handleStatusChange(selectedLead.id, value as Lead['status'])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="tour_scheduled">Tour Scheduled</SelectItem>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="leased">Leased</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <div className="grid gap-3">
                    <Button className="w-full gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule Tour
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Mail className="h-4 w-4" />
                      Send Email
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Send SMS
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Phone className="h-4 w-4" />
                      Log Call
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CRM;
