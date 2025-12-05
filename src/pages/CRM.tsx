import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Search, Phone, Mail, MessageSquare, Calendar as CalendarIcon, User, TrendingUp, 
  LayoutGrid, List, Star, ChevronRight, Users, Target, Eye, CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// =============== HARDCODED DATA ===============
const users = [
  { id: "USR_001", name: "Sarah Jenkins", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: "USR_002", name: "Mike Ross", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: "USR_003", name: "Jessica Pearson", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: "USR_005", name: "David Lee", avatar: "https://i.pravatar.cc/150?u=5" },
  { id: "USR_006", name: "Louis Litt", avatar: "https://i.pravatar.cc/150?u=6" }
];

const properties = [
  { id: "PROP_001", name: "Sunset Towers" },
  { id: "PROP_002", name: "Downtown Lofts" },
  { id: "PROP_003", name: "Riverside Garden" },
  { id: "PROP_005", name: "Oceanview Estates" }
];

const initialLeads = [
  { id: "LEA_001", full_name: "John Smith", status: "Contacted", priority: "High", lead_score: 85, sentiment: "Positive", property_id: "PROP_001", assigned_to: "USR_001", rent_range: "$3k-$3.5k", move_in: "2026-01-15", phone: "555-0100", email: "john.smith@example.com", notes: "Has a golden retriever", next_task_date: "2025-12-03 10:00" },
  { id: "LEA_002", full_name: "Emily Davis", status: "Tour Scheduled", priority: "High", lead_score: 92, sentiment: "High Intent", property_id: "PROP_002", assigned_to: "USR_002", rent_range: "$1.8k-$2.2k", move_in: "2026-02-01", phone: "555-0101", email: "emily.d@example.com", notes: "Looking for quiet unit", next_task_date: "2025-12-05 13:00" },
  { id: "LEA_003", full_name: "Robert Ford", status: "Lost", priority: "Low", lead_score: 20, sentiment: "Negative", property_id: "PROP_001", assigned_to: "USR_001", rent_range: "$4k-$5k", move_in: "2025-11-30", phone: "555-0102", email: "r.ford@example.com", notes: "Price too high", next_task_date: null },
  { id: "LEA_004", full_name: "Michael Chen", status: "Application Pending", priority: "High", lead_score: 95, sentiment: "Neutral", property_id: "PROP_003", assigned_to: "USR_005", rent_range: "$1.4k-$1.6k", move_in: "2025-12-20", phone: "555-0103", email: "m.chen@example.com", notes: "Docs submitted", next_task_date: null },
  { id: "LEA_006", full_name: "Bruce Wayne", status: "Leased", priority: "High", lead_score: 99, sentiment: "Positive", property_id: "PROP_005", assigned_to: "USR_003", rent_range: "$12k-$15k", move_in: "2025-12-15", phone: "555-0105", email: "b.wayne@example.com", notes: "VIP client", next_task_date: null },
  { id: "LEA_007", full_name: "Clark Kent", status: "Contacted", priority: "Medium", lead_score: 45, sentiment: "Neutral", property_id: "PROP_002", assigned_to: "USR_006", rent_range: "$2k-$2.5k", move_in: "2026-03-01", phone: "555-0106", email: "c.kent@example.com", notes: "Reporter discount?", next_task_date: null },
  { id: "LEA_010", full_name: "Arthur Curry", status: "New", priority: "Medium", lead_score: 60, sentiment: "Positive", property_id: "PROP_005", assigned_to: "USR_003", rent_range: "$8k-$9k", move_in: "2026-02-15", phone: "555-0109", email: "a.curry@example.com", notes: "Needs ocean view", next_task_date: null }
];

const initialInteractions = [
  { id: "INT_001", lead_id: "LEA_001", type: "Email", direction: "Inbound", summary: "Inquired about 1BHK", date: "2025-12-01 09:00" },
  { id: "INT_002", lead_id: "LEA_001", type: "Email", direction: "Outbound", summary: "Sent brochure", date: "2025-12-01 09:15" },
  { id: "INT_004", lead_id: "LEA_002", type: "SMS", direction: "Outbound", summary: "Confirmed tour for Friday", date: "2025-12-02 14:30" },
  { id: "INT_005", lead_id: "LEA_004", type: "Email", direction: "Inbound", summary: "Where do I upload paystubs?", date: "2025-12-04 14:00" },
  { id: "INT_006", lead_id: "LEA_004", type: "Email", direction: "Outbound", summary: "Uploaded portal link", date: "2025-12-04 15:00" }
];

const initialTasks = [
  { id: "TSK_001", lead_id: "LEA_001", title: "Follow Up Call", due_at: "2025-12-03 10:00", status: "Pending", assigned_to: "USR_001" },
  { id: "TSK_002", lead_id: "LEA_002", title: "Prep Tour Keys", due_at: "2025-12-05 13:00", status: "Pending", assigned_to: "USR_002" },
  { id: "TSK_003", lead_id: "LEA_004", title: "Review Income", due_at: "2025-12-05 10:00", status: "In Progress", assigned_to: "USR_005" }
];

const statusOptions = ["New", "Contacted", "Tour Scheduled", "Application Pending", "Leased", "Lost"];

// =============== TYPES ===============
type LeadStatus = 'New' | 'Contacted' | 'Tour Scheduled' | 'Application Pending' | 'Leased' | 'Lost';
type Priority = 'High' | 'Medium' | 'Low';
type Sentiment = 'Positive' | 'Neutral' | 'Negative' | 'High Intent';

interface Lead {
  id: string;
  full_name: string;
  status: LeadStatus;
  priority: Priority;
  lead_score: number;
  sentiment: Sentiment;
  property_id: string;
  assigned_to: string;
  rent_range: string;
  move_in: string;
  phone: string;
  email: string;
  notes: string;
  next_task_date: string | null;
}

interface Interaction {
  id: string;
  lead_id: string;
  type: string;
  direction: string;
  summary: string;
  date: string;
}

interface Task {
  id: string;
  lead_id: string;
  title: string;
  due_at: string;
  status: string;
  assigned_to: string;
}

// =============== CONFIGS ===============
const statusConfig: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  'New': { label: 'New', color: 'bg-blue-500', bgColor: 'bg-blue-500/10' },
  'Contacted': { label: 'Contacted', color: 'bg-amber-500', bgColor: 'bg-amber-500/10' },
  'Tour Scheduled': { label: 'Tour Scheduled', color: 'bg-purple-500', bgColor: 'bg-purple-500/10' },
  'Application Pending': { label: 'Application Pending', color: 'bg-indigo-500', bgColor: 'bg-indigo-500/10' },
  'Leased': { label: 'Leased', color: 'bg-emerald-500', bgColor: 'bg-emerald-500/10' },
  'Lost': { label: 'Lost', color: 'bg-slate-400', bgColor: 'bg-slate-400/10' },
};

const statusOrder: LeadStatus[] = ['New', 'Contacted', 'Tour Scheduled', 'Application Pending', 'Leased', 'Lost'];

const priorityConfig: Record<Priority, { color: string; bgColor: string }> = {
  'High': { color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  'Medium': { color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  'Low': { color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-700/30' },
};

const sentimentConfig: Record<Sentiment, { color: string; dotColor: string }> = {
  'Positive': { color: 'text-emerald-600', dotColor: 'bg-emerald-500' },
  'Neutral': { color: 'text-amber-600', dotColor: 'bg-amber-500' },
  'Negative': { color: 'text-red-600', dotColor: 'bg-red-500' },
  'High Intent': { color: 'text-emerald-600', dotColor: 'bg-emerald-500' },
};

// =============== HELPER FUNCTIONS ===============
const getUser = (userId: string) => users.find(u => u.id === userId);
const getProperty = (propertyId: string) => properties.find(p => p.id === propertyId);

const getScoreColor = (score: number) => {
  if (score > 80) return 'bg-emerald-500 text-white';
  if (score >= 50) return 'bg-amber-500 text-white';
  return 'bg-red-500 text-white';
};

const CRM = () => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads as Lead[]);
  const [interactions, setInteractions] = useState<Interaction[]>(initialInteractions);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [tourDate, setTourDate] = useState<Date | undefined>(undefined);
  const [tourTime, setTourTime] = useState('10:00');
  const { toast } = useToast();

  // Helper functions using state
  const getLeadInteractions = (leadId: string) => interactions.filter(i => i.lead_id === leadId);
  const getLeadTasks = (leadId: string) => tasks.filter(t => t.lead_id === leadId);

  // Get earliest pending task date for a lead
  const getNextTaskDate = (leadId: string) => {
    const leadTasks = tasks
      .filter(t => t.lead_id === leadId && t.status !== 'Completed')
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
    return leadTasks.length > 0 ? leadTasks[0].due_at : null;
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.full_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [leads, searchQuery, statusFilter, priorityFilter]);

  // Stats calculations
  const stats = useMemo(() => {
    const totalActive = leads.length;
    const highPriority = leads.filter(l => l.priority === 'High').length;
    const toursScheduled = leads.filter(l => l.status === 'Tour Scheduled').length;
    const avgScore = leads.length > 0 
      ? Math.round(leads.reduce((acc, l) => acc + l.lead_score, 0) / leads.length) 
      : 0;
    return { totalActive, highPriority, toursScheduled, avgScore };
  }, [leads]);

  const getLeadsByStatus = (status: LeadStatus) => {
    return filteredLeads.filter(lead => lead.status === status);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as LeadStatus;
    setLeads(prev => prev.map(lead => 
      lead.id === draggableId ? { ...lead, status: newStatus } : lead
    ));
    if (selectedLead && selectedLead.id === draggableId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
    toast({
      title: 'Status updated',
      description: `Lead moved to ${newStatus}`,
    });
  };

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  // Actions
  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
    toast({
      title: 'Status updated',
      description: `Lead status changed to ${newStatus}`,
    });
  };

  const handleScheduleTour = (leadId: string) => {
    if (!tourDate) {
      toast({ title: 'Select a date', description: 'Please select a tour date', variant: 'destructive' });
      return;
    }
    const dateTimeStr = `${format(tourDate, 'yyyy-MM-dd')} ${tourTime}`;
    const newTask: Task = {
      id: `TSK_${Date.now()}`,
      lead_id: leadId,
      title: 'Tour',
      due_at: dateTimeStr,
      status: 'Pending',
      assigned_to: 'USR_001' // current user
    };
    setTasks(prev => [...prev, newTask]);
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, next_task_date: dateTimeStr, status: 'Tour Scheduled' } : lead
    ));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, next_task_date: dateTimeStr, status: 'Tour Scheduled' });
    }
    setTourDate(undefined);
    toast({
      title: 'Tour scheduled',
      description: `Tour scheduled for ${formatDateTime(dateTimeStr)}`,
    });
  };

  const handleLogInteraction = (leadId: string, type: 'Email' | 'SMS' | 'Call') => {
    const newInteraction: Interaction = {
      id: `INT_${Date.now()}`,
      lead_id: leadId,
      type,
      direction: 'Outbound',
      summary: `${type} sent`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setInteractions(prev => [...prev, newInteraction]);
    toast({
      title: `${type} logged`,
      description: `${type} interaction recorded`,
    });
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'Completed' ? 'Pending' : 'Completed' } 
        : task
    ));
  };

  // Lead Card Component
  const LeadCard = ({ lead, index }: { lead: Lead; index: number }) => {
    const user = getUser(lead.assigned_to);
    const property = getProperty(lead.property_id);
    const leadInteractions = getLeadInteractions(lead.id);
    const inboundCount = leadInteractions.filter(i => i.direction === 'Inbound').length;
    const outboundCount = leadInteractions.filter(i => i.direction === 'Outbound').length;

    return (
      <Draggable key={lead.id} draggableId={lead.id} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            tabIndex={0}
            className={`cursor-pointer hover:shadow-md transition-all border-slate-200 dark:border-slate-700 ${
              snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => openLeadDetail(lead)}
            onKeyDown={(e) => e.key === 'Enter' && openLeadDetail(lead)}
          >
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">{lead.full_name}</h4>
                  <p className="text-xs text-muted-foreground">{lead.rent_range}</p>
                </div>
                <Badge className={`text-xs ${priorityConfig[lead.priority].bgColor} ${priorityConfig[lead.priority].color} border-0`}>
                  {lead.priority}
                </Badge>
              </div>

              {/* Sentiment */}
              <div className="flex items-center gap-1.5">
                {lead.sentiment === 'High Intent' ? (
                  <Star className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${sentimentConfig[lead.sentiment].dotColor}`} />
                )}
                <span className={`text-xs ${sentimentConfig[lead.sentiment].color}`}>
                  {lead.sentiment}
                </span>
              </div>

              {/* Property */}
              <div className="text-xs text-muted-foreground">
                {property?.name || 'Unknown Property'}
              </div>

              {/* Interactions count */}
              {leadInteractions.length > 0 && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {inboundCount > 0 && <span>↓{inboundCount} in</span>}
                  {outboundCount > 0 && <span>↑{outboundCount} out</span>}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-xs bg-slate-200 dark:bg-slate-700">
                      {user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                    {user?.name || 'Unassigned'}
                  </span>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getScoreColor(lead.lead_score)}`}>
                  {lead.lead_score}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-full mx-auto animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">CRM & Leads</h1>
          <p className="text-slate-500 dark:text-slate-400">Omni-channel lead management and tracking</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <User className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              Total Active Leads
            </CardDescription>
            <CardTitle className="text-3xl text-slate-900 dark:text-slate-100">{stats.totalActive}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4 text-red-500" />
              High Priority
            </CardDescription>
            <CardTitle className="text-3xl text-slate-900 dark:text-slate-100">{stats.highPriority}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-purple-500" />
              Tours Scheduled
            </CardDescription>
            <CardTitle className="text-3xl text-slate-900 dark:text-slate-100">{stats.toursScheduled}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Avg Lead Score
            </CardDescription>
            <CardTitle className="text-3xl text-slate-900 dark:text-slate-100">{stats.avgScore}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters & View Toggle */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOrder.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className={viewMode === 'kanban' ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-slate-200 dark:border-slate-700'}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-slate-200 dark:border-slate-700'}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {statusOrder.map((status) => {
              const statusLeads = getLeadsByStatus(status);
              const config = statusConfig[status];

              return (
                <div key={status} className="flex-shrink-0 w-72">
                  <Card className="h-full bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <div className={`w-3 h-3 rounded-full ${config.color}`} />
                          {config.label}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {statusLeads.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <CardContent
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[500px] ${
                            snapshot.isDraggingOver ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                          }`}
                        >
                          <ScrollArea className="h-[calc(100vh-400px)]">
                            <div className="space-y-3 pr-2">
                              {statusLeads.map((lead, index) => (
                                <LeadCard key={lead.id} lead={lead} index={index} />
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

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-700">
                  <TableHead className="text-slate-600 dark:text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Phone</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Property</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Next Task Date</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Score</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map(lead => {
                  const property = getProperty(lead.property_id);
                  const nextTask = getNextTaskDate(lead.id);
                  return (
                    <TableRow 
                      key={lead.id} 
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-200 dark:border-slate-700"
                      onClick={() => openLeadDetail(lead)}
                    >
                      <TableCell className="font-medium text-slate-900 dark:text-slate-100">{lead.full_name}</TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[lead.status].bgColor} ${statusConfig[lead.status].color.replace('bg-', 'text-').replace('-500', '-600')} border-0`}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{lead.phone || '—'}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{lead.email || '—'}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{property?.name || '—'}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{nextTask ? formatDateTime(nextTask) : '—'}</TableCell>
                      <TableCell>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getScoreColor(lead.lead_score)}`}>
                          {lead.lead_score}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Lead Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white dark:bg-slate-900">
          {selectedLead && (() => {
            const user = getUser(selectedLead.assigned_to);
            const property = getProperty(selectedLead.property_id);
            const leadInteractions = getLeadInteractions(selectedLead.id);
            const leadTasks = getLeadTasks(selectedLead.id);

            return (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedLead.id}`} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600">
                        {selectedLead.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{selectedLead.full_name}</div>
                      <div className="text-sm text-slate-500 font-normal">
                        Lead Score: {selectedLead.lead_score}
                      </div>
                    </div>
                  </SheetTitle>
                  <SheetDescription className="text-slate-500">
                    <div className="flex flex-col gap-1">
                      <span><Phone className="inline h-3 w-3 mr-1" />{selectedLead.phone || '—'}</span>
                      <span><Mail className="inline h-3 w-3 mr-1" />{selectedLead.email || '—'}</span>
                    </div>
                  </SheetDescription>
                  
                  {/* Contact Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700" onClick={() => handleLogInteraction(selectedLead.id, 'Call')}>
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700" onClick={() => handleLogInteraction(selectedLead.id, 'Email')}>
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700" onClick={() => handleLogInteraction(selectedLead.id, 'SMS')}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      SMS
                    </Button>
                  </div>
                </SheetHeader>

                <Tabs defaultValue="timeline" className="mt-6">
                  <TabsList className="w-full bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger value="timeline" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Timeline</TabsTrigger>
                    <TabsTrigger value="tasks" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Tasks</TabsTrigger>
                    <TabsTrigger value="profile" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Profile</TabsTrigger>
                    <TabsTrigger value="actions" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="timeline" className="space-y-4 mt-4">
                    {leadInteractions.length > 0 ? (
                      leadInteractions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((interaction) => (
                          <Card key={interaction.id} className="border-slate-200 dark:border-slate-700">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 p-1.5 rounded ${interaction.direction === 'Inbound' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                  {interaction.type === 'Email' && <Mail className="h-3 w-3" />}
                                  {interaction.type === 'SMS' && <MessageSquare className="h-3 w-3" />}
                                  {interaction.type === 'Call' && <Phone className="h-3 w-3" />}
                                  {interaction.type === 'View' && <Eye className="h-3 w-3" />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700">
                                        {interaction.type}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800">
                                        {interaction.direction}
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                      {formatDateTime(interaction.date)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-700 dark:text-slate-300">{interaction.summary}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No interactions recorded
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tasks" className="space-y-4 mt-4">
                    {leadTasks.length > 0 ? (
                      leadTasks.map((task) => (
                        <Card key={task.id} className="border-slate-200 dark:border-slate-700">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Checkbox 
                                checked={task.status === 'Completed'}
                                onCheckedChange={() => handleToggleTask(task.id)}
                              />
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                  {task.title}
                                </p>
                                <p className="text-xs text-slate-500">Due: {formatDateTime(task.due_at)}</p>
                              </div>
                              <Badge variant="secondary" className={`text-xs ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : task.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                {task.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No tasks
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="profile" className="space-y-4 mt-4">
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-base text-slate-900 dark:text-slate-100">Lead Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Status:</span>
                          <Badge className={`${statusConfig[selectedLead.status].color} text-white`}>
                            {selectedLead.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Priority:</span>
                          <Badge className={`${priorityConfig[selectedLead.priority].bgColor} ${priorityConfig[selectedLead.priority].color} border-0`}>
                            {selectedLead.priority}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Sentiment:</span>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${sentimentConfig[selectedLead.sentiment].dotColor}`} />
                            <span className={sentimentConfig[selectedLead.sentiment].color}>{selectedLead.sentiment}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Lead Score:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedLead.lead_score}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Rent Range:</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{selectedLead.rent_range}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Move-in Date:</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{formatDate(selectedLead.move_in)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Property:</span>
                          <span className="font-medium text-indigo-600">{property?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Assigned To:</span>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user?.avatar} />
                              <AvatarFallback className="text-xs bg-slate-200 dark:bg-slate-700">
                                {user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900 dark:text-slate-100">{user?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                        {selectedLead.notes && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-slate-500">Notes:</span>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selectedLead.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4 mt-4">
                    {/* Change Status */}
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-700 dark:text-slate-300">Change Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Select value={selectedLead.status} onValueChange={(val) => handleStatusChange(selectedLead.id, val as LeadStatus)}>
                          <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            {statusOptions.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>

                    {/* Schedule Tour */}
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-700 dark:text-slate-300">Schedule Tour</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal border-slate-200 dark:border-slate-700",
                                !tourDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {tourDate ? format(tourDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" align="start">
                            <Calendar
                              mode="single"
                              selected={tourDate}
                              onSelect={setTourDate}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="time"
                          value={tourTime}
                          onChange={(e) => setTourTime(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleScheduleTour(selectedLead.id)}>
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Schedule Tour
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Log Interactions */}
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-700 dark:text-slate-300">Log Interaction</CardTitle>
                      </CardHeader>
                      <CardContent className="flex gap-2">
                        <Button variant="outline" className="flex-1 border-slate-200 dark:border-slate-700" onClick={() => handleLogInteraction(selectedLead.id, 'Email')}>
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                        <Button variant="outline" className="flex-1 border-slate-200 dark:border-slate-700" onClick={() => handleLogInteraction(selectedLead.id, 'SMS')}>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          SMS
                        </Button>
                        <Button variant="outline" className="flex-1 border-slate-200 dark:border-slate-700" onClick={() => handleLogInteraction(selectedLead.id, 'Call')}>
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CRM;
