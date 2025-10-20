import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Search, Phone, Mail, MessageSquare, Calendar, User, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<Lead['status'], { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500' },
  contacted: { label: 'Contacted', color: 'bg-yellow-500' },
  tour_scheduled: { label: 'Tour Scheduled', color: 'bg-purple-500' },
  applied: { label: 'Applied', color: 'bg-indigo-500' },
  leased: { label: 'Leased', color: 'bg-green-500' },
  lost: { label: 'Lost', color: 'bg-gray-500' },
};

const statusOrder: Lead['status'][] = ['new', 'contacted', 'tour_scheduled', 'applied', 'leased', 'lost'];

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
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [searchQuery, leads]);

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

    setFilteredLeads(filtered);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as Lead['status'];
    handleStatusChange(draggableId, newStatus);
  };

  const getLeadsByStatus = (status: Lead['status']) => {
    return filteredLeads.filter((lead) => lead.status === status);
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

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">Loading leads...</CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {statusOrder.map((status) => {
              const statusLeads = getLeadsByStatus(status);
              const config = statusConfig[status];

              return (
                <div key={status} className="flex-shrink-0 w-80">
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${config.color}`} />
                          {config.label}
                        </CardTitle>
                        <Badge variant="secondary">{statusLeads.length}</Badge>
                      </div>
                    </CardHeader>
                    
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <CardContent
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[600px] ${
                            snapshot.isDraggingOver ? 'bg-accent/50' : ''
                          }`}
                        >
                          <ScrollArea className="h-[calc(100vh-320px)]">
                            <div className="space-y-3 pr-4">
                              {statusLeads.map((lead, index) => (
                                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                  {(provided, snapshot) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                                        snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''
                                      }`}
                                      onClick={() => openLeadDetail(lead)}
                                    >
                                      <CardContent className="p-4">
                                        <div className="space-y-3">
                                          <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10">
                                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.email}`} />
                                              <AvatarFallback>{lead.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                              <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
                                              <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                                            </div>
                                          </div>

                                          <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                              {getSourceIcon(lead.source)}
                                              <span className="capitalize">{lead.source}</span>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                              Score: {lead.leadScore}
                                            </Badge>
                                          </div>

                                          {lead.sentiment && (
                                            <Badge variant="outline" className="text-xs capitalize w-fit">
                                              {lead.sentiment}
                                            </Badge>
                                          )}

                                          <div className="text-xs text-muted-foreground">
                                            {formatDate(lead.createdAt)}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      )}
                    </Droppable>
                  </Card>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

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
                        <Badge className={`${statusConfig[selectedLead.status].color} text-white`}>
                          {statusConfig[selectedLead.status].label}
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
