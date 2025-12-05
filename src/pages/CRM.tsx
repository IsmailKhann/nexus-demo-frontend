import { useState, useMemo, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { 
  Search, Phone, Mail, MessageSquare, Calendar as CalendarIcon, User, TrendingUp, 
  LayoutGrid, List, Star, ChevronRight, Users, Target, Eye, CheckCircle2,
  Globe, MapPin, PhoneCall, UserPlus, Play, Pause, Download, Mic, Upload, AlertCircle, Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import PropertyProfile, { PropertyProfileData } from '@/components/PropertyProfile';

// =============== HARDCODED DATA ===============
const users = [
  { id: "USR_001", name: "Sarah Jenkins", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: "USR_002", name: "Mike Ross", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: "USR_003", name: "Jessica Pearson", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: "USR_005", name: "David Lee", avatar: "https://i.pravatar.cc/150?u=5" },
  { id: "USR_006", name: "Louis Litt", avatar: "https://i.pravatar.cc/150?u=6" }
];

// Extended properties with full details
const properties: PropertyProfileData[] = [
  {
    id: "PROP_001",
    name: "Sunset Towers",
    address_line1: "123 Sunset Blvd",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90028",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
    ],
    description: "Luxury high-rise with rooftop pool and concierge service. Premium amenities including fitness center, spa, and 24/7 security.",
    units_count: 120,
    vacant_count: 6,
    avg_rent: 3200,
    timezone: "PST",
    created_at: "2024-01-01"
  },
  {
    id: "PROP_002",
    name: "Downtown Lofts",
    address_line1: "450 Main St",
    city: "Seattle",
    state: "WA",
    postal_code: "98104",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"
    ],
    description: "Converted industrial lofts in the heart of downtown. High ceilings, exposed brick, and modern finishes.",
    units_count: 80,
    vacant_count: 10,
    avg_rent: 2100,
    timezone: "PST",
    created_at: "2024-01-15"
  },
  {
    id: "PROP_003",
    name: "Riverside Garden",
    address_line1: "789 River Road",
    city: "Portland",
    state: "OR",
    postal_code: "97201",
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
    ],
    description: "Peaceful garden-style apartments along the river. Pet-friendly with walking trails and community garden.",
    units_count: 60,
    vacant_count: 4,
    avg_rent: 1500,
    timezone: "PST",
    created_at: "2024-02-01"
  },
  {
    id: "PROP_005",
    name: "Oceanview Estates",
    address_line1: "1 Ocean Drive",
    city: "Miami",
    state: "FL",
    postal_code: "33139",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
    ],
    description: "Ultra-luxury beachfront condos with panoramic ocean views. Private beach access, valet parking, and concierge services.",
    units_count: 45,
    vacant_count: 2,
    avg_rent: 12000,
    timezone: "EST",
    created_at: "2024-03-01"
  }
];

// Leads with properties_interested for multi-property support
const initialLeads = [
  { id: "LEA_001", full_name: "John Smith", status: "Contacted", priority: "High", lead_score: 85, sentiment: "Positive", property_id: "PROP_001", properties_interested: ["PROP_001", "PROP_002"], assigned_to: "USR_001", rent_range: "$3k-$3.5k", move_in: "2026-01-15", phone: "555-0100", email: "john.smith@example.com", notes: "Has a golden retriever", next_task_date: "2025-12-03 10:00", source: "ILS", source_detail: "zillow" },
  { id: "LEA_002", full_name: "Emily Davis", status: "Tour Scheduled", priority: "High", lead_score: 92, sentiment: "High Intent", property_id: "PROP_002", properties_interested: ["PROP_002", "PROP_001", "PROP_003"], assigned_to: "USR_002", rent_range: "$1.8k-$2.2k", move_in: "2026-02-01", phone: "555-0101", email: "emily.d@example.com", notes: "Looking for quiet unit", next_task_date: "2025-12-05 13:00", source: "Website", source_detail: "contact form" },
  { id: "LEA_003", full_name: "Robert Ford", status: "Lost", priority: "Low", lead_score: 20, sentiment: "Negative", property_id: "PROP_001", properties_interested: ["PROP_001"], assigned_to: "USR_001", rent_range: "$4k-$5k", move_in: "2025-11-30", phone: "555-0102", email: "r.ford@example.com", notes: "Price too high", next_task_date: null, source: "Craigslist", source_detail: "craigslist ad #12345" },
  { id: "LEA_004", full_name: "Michael Chen", status: "Application Pending", priority: "High", lead_score: 95, sentiment: "Neutral", property_id: "PROP_003", properties_interested: ["PROP_003"], assigned_to: "USR_005", rent_range: "$1.4k-$1.6k", move_in: "2025-12-20", phone: "555-0103", email: "m.chen@example.com", notes: "Docs submitted", next_task_date: null, source: "Referral", source_detail: "referred by John Smith" },
  { id: "LEA_006", full_name: "Bruce Wayne", status: "Leased", priority: "High", lead_score: 99, sentiment: "Positive", property_id: "PROP_005", properties_interested: ["PROP_005", "PROP_001"], assigned_to: "USR_003", rent_range: "$12k-$15k", move_in: "2025-12-15", phone: "555-0105", email: "b.wayne@example.com", notes: "VIP client", next_task_date: null, source: "Call", source_detail: "inbound call from +1-555-0105" },
  { id: "LEA_007", full_name: "Clark Kent", status: "Contacted", priority: "Medium", lead_score: 45, sentiment: "Neutral", property_id: "PROP_002", properties_interested: ["PROP_002"], assigned_to: "USR_006", rent_range: "$2k-$2.5k", move_in: "2026-03-01", phone: "555-0106", email: "c.kent@example.com", notes: "Reporter discount?", next_task_date: null, source: "Email", source_detail: "email subject: availability" },
  { id: "LEA_010", full_name: "Arthur Curry", status: "New", priority: "Medium", lead_score: 60, sentiment: "Positive", property_id: "PROP_005", properties_interested: ["PROP_005", "PROP_003", "PROP_002"], assigned_to: "USR_003", rent_range: "$8k-$9k", move_in: "2026-02-15", phone: "555-0109", email: "a.curry@example.com", notes: "Needs ocean view", next_task_date: null, source: "Walk-In", source_detail: "visited property on 12/01" }
];

const initialInteractions = [
  { id: "INT_001", lead_id: "LEA_001", type: "Email", direction: "Inbound", summary: "Inquired about 1BHK", date: "2025-12-01 09:00", attachments: [] },
  { id: "INT_002", lead_id: "LEA_001", type: "Email", direction: "Outbound", summary: "Sent brochure", date: "2025-12-01 09:15", attachments: [] },
  { id: "INT_004", lead_id: "LEA_002", type: "SMS", direction: "Outbound", summary: "Confirmed tour for Friday", date: "2025-12-02 14:30", attachments: [] },
  { id: "INT_005", lead_id: "LEA_004", type: "Email", direction: "Inbound", summary: "Where do I upload paystubs?", date: "2025-12-04 14:00", attachments: [] },
  { id: "INT_006", lead_id: "LEA_004", type: "Email", direction: "Outbound", summary: "Uploaded portal link", date: "2025-12-04 15:00", attachments: [] }
];

const initialTasks = [
  { id: "TSK_001", lead_id: "LEA_001", title: "Follow Up Call", due_at: "2025-12-03 10:00", status: "Pending", assigned_to: "USR_001" },
  { id: "TSK_002", lead_id: "LEA_002", title: "Prep Tour Keys", due_at: "2025-12-05 13:00", status: "Pending", assigned_to: "USR_002" },
  { id: "TSK_003", lead_id: "LEA_004", title: "Review Income", due_at: "2025-12-05 10:00", status: "In Progress", assigned_to: "USR_005" }
];

const statusOptions = ["New", "Contacted", "Tour Scheduled", "Application Pending", "Leased", "Lost"];
const sourceOptions = ["ILS", "Website", "Referral", "Call", "SMS", "Email", "Craigslist", "Walk-In", "Other"];

// =============== TYPES ===============
type LeadStatus = 'New' | 'Contacted' | 'Tour Scheduled' | 'Application Pending' | 'Leased' | 'Lost';
type Priority = 'High' | 'Medium' | 'Low';
type Sentiment = 'Positive' | 'Neutral' | 'Negative' | 'High Intent';
type LeadSource = 'ILS' | 'Website' | 'Referral' | 'Call' | 'SMS' | 'Email' | 'Craigslist' | 'Walk-In' | 'Other';

interface AudioAttachment {
  type: 'audio';
  filename: string;
  url: string;
  duration?: number;
  error?: boolean;
}

interface Lead {
  id: string;
  full_name: string;
  status: LeadStatus;
  priority: Priority;
  lead_score: number;
  sentiment: Sentiment;
  property_id: string;
  properties_interested: string[];
  assigned_to: string;
  rent_range: string;
  move_in: string;
  phone: string;
  email: string;
  notes: string;
  next_task_date: string | null;
  source: LeadSource;
  source_detail?: string;
}

interface Interaction {
  id: string;
  lead_id: string;
  type: string;
  direction: string;
  summary: string;
  date: string;
  attachments?: AudioAttachment[];
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
  'New': { label: 'New', color: 'bg-status-new', bgColor: 'bg-status-new/10' },
  'Contacted': { label: 'Contacted', color: 'bg-status-contacted', bgColor: 'bg-status-contacted/10' },
  'Tour Scheduled': { label: 'Tour Scheduled', color: 'bg-status-tour', bgColor: 'bg-status-tour/10' },
  'Application Pending': { label: 'Application Pending', color: 'bg-status-application', bgColor: 'bg-status-application/10' },
  'Leased': { label: 'Leased', color: 'bg-status-leased', bgColor: 'bg-status-leased/10' },
  'Lost': { label: 'Lost', color: 'bg-status-lost', bgColor: 'bg-status-lost/10' },
};

const statusOrder: LeadStatus[] = ['New', 'Contacted', 'Tour Scheduled', 'Application Pending', 'Leased', 'Lost'];

const priorityConfig: Record<Priority, { color: string; bgColor: string }> = {
  'High': { color: 'text-priority-high', bgColor: 'bg-priority-high/15 dark:bg-priority-high/25' },
  'Medium': { color: 'text-priority-medium', bgColor: 'bg-priority-medium/15 dark:bg-priority-medium/25' },
  'Low': { color: 'text-priority-low', bgColor: 'bg-priority-low/15 dark:bg-priority-low/25' },
};

const sentimentConfig: Record<Sentiment, { color: string; dotColor: string }> = {
  'Positive': { color: 'text-status-leased', dotColor: 'bg-status-leased' },
  'Neutral': { color: 'text-status-contacted', dotColor: 'bg-status-contacted' },
  'Negative': { color: 'text-priority-high', dotColor: 'bg-priority-high' },
  'High Intent': { color: 'text-status-leased', dotColor: 'bg-status-leased' },
};

const sourceConfig: Record<LeadSource, { icon: typeof Globe; color: string }> = {
  'ILS': { icon: MapPin, color: 'text-muted-foreground' },
  'Website': { icon: Globe, color: 'text-muted-foreground' },
  'Referral': { icon: UserPlus, color: 'text-status-leased' },
  'Call': { icon: Phone, color: 'text-primary' },
  'SMS': { icon: MessageSquare, color: 'text-secondary' },
  'Email': { icon: Mail, color: 'text-primary-light' },
  'Craigslist': { icon: Globe, color: 'text-status-contacted' },
  'Walk-In': { icon: User, color: 'text-secondary' },
  'Other': { icon: Globe, color: 'text-muted-foreground' },
};

// =============== HELPER FUNCTIONS ===============
const getUser = (userId: string) => users.find(u => u.id === userId);
const getProperty = (propertyId: string): PropertyProfileData | undefined => properties.find(p => p.id === propertyId);

// Get primary property (first in properties_interested or fallback to property_id)
const getPrimaryPropertyId = (lead: Lead): string => {
  return lead.properties_interested?.[0] || lead.property_id;
};

// Get all interested properties for a lead
const getInterestedProperties = (lead: Lead): PropertyProfileData[] => {
  const ids = lead.properties_interested?.length ? lead.properties_interested : [lead.property_id];
  return ids.map(id => getProperty(id)).filter(Boolean) as PropertyProfileData[];
};

const getScoreColor = (score: number) => {
  if (score > 80) return 'bg-status-leased text-white';
  if (score >= 50) return 'bg-status-contacted text-white';
  return 'bg-priority-high text-white';
};

// Audio Player Component
const AudioPlayer = ({ attachment }: { attachment: AudioAttachment }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // Handle autoplay restrictions
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => setIsPlaying(false);

  if (attachment.error) {
    return (
      <div className="flex items-center gap-2 mt-2 p-2 bg-destructive/10 rounded">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-xs text-destructive">Playback error</span>
        <a 
          href={attachment.url} 
          download={attachment.filename}
          className="text-xs text-primary hover:underline ml-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="h-3 w-3 inline mr-1" />
          Download
        </a>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 mt-2 p-2 bg-muted rounded"
      role="region"
      aria-label="Audio player"
    >
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0 text-primary hover:text-primary-hover" 
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <audio 
        ref={audioRef} 
        src={attachment.url} 
        onEnded={handleEnded}
        aria-hidden="true"
      />
      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-primary rounded-full" />
      </div>
      <span className="text-xs text-muted-foreground truncate max-w-[100px]">
        {attachment.filename}
      </span>
      {attachment.duration && (
        <span className="text-xs text-muted-foreground">{Math.round(attachment.duration)}s</span>
      )}
    </div>
  );
};

// Source Badge Component
const SourceBadge = ({ source, sourceDetail, compact = false }: { source: LeadSource; sourceDetail?: string; compact?: boolean }) => {
  const config = sourceConfig[source] || sourceConfig['Other'];
  const Icon = config.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs">
              <Icon className={`h-3 w-3 ${config.color}`} />
              <span className="text-muted-foreground">{source}</span>
            </div>
          </TooltipTrigger>
          {sourceDetail && (
            <TooltipContent>
              <p>{sourceDetail}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="text-xs bg-muted border border-border gap-1">
            <Icon className={`h-3 w-3 ${config.color}`} />
            {source}
          </Badge>
        </TooltipTrigger>
        {sourceDetail && (
          <TooltipContent>
            <p>{sourceDetail}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const CRM = () => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads as Lead[]);
  const [interactions, setInteractions] = useState<Interaction[]>(initialInteractions as Interaction[]);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [tourDate, setTourDate] = useState<Date | undefined>(undefined);
  const [tourTime, setTourTime] = useState('10:00');
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [selectedPropertyProfile, setSelectedPropertyProfile] = useState<PropertyProfileData | null>(null);
  const [isPropertyProfileOpen, setIsPropertyProfileOpen] = useState(false);
  const { toast } = useToast();

  const openPropertyProfile = (propertyId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const property = getProperty(propertyId);
    if (property) {
      setSelectedPropertyProfile(property);
      setIsPropertyProfileOpen(true);
    }
  };

  const handleCreateLeadFromProperty = (propertyId: string) => {
    setIsPropertyProfileOpen(false);
    setNewLead(prev => ({ ...prev, property_id: propertyId }));
    setIsAddLeadOpen(true);
  };

  // Add Lead form state
  const [newLead, setNewLead] = useState({
    full_name: '',
    phone: '',
    email: '',
    rent_range: '',
    property_id: '',
    priority: 'Medium' as Priority,
    source: 'Website' as LeadSource,
    source_detail: '',
    notes: '',
  });
  const [callRecording, setCallRecording] = useState<File | null>(null);
  const [callDirection, setCallDirection] = useState<'Inbound' | 'Missed'>('Inbound');
  
  // Log Call form state
  const [logCallSummary, setLogCallSummary] = useState('');
  const [logCallRecording, setLogCallRecording] = useState<File | null>(null);
  const [logCallDirection, setLogCallDirection] = useState<'Inbound' | 'Outbound'>('Outbound');

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
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesSource;
    });
  }, [leads, searchQuery, statusFilter, priorityFilter, sourceFilter]);

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
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      attachments: []
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

  // Add Lead handler
  const handleAddLead = () => {
    if (!newLead.full_name.trim()) {
      toast({ title: 'Error', description: 'Lead name is required', variant: 'destructive' });
      return;
    }

    const leadId = `LEA_${Date.now()}`;
    const propertyId = newLead.property_id || 'PROP_001';
    const newLeadData: Lead = {
      id: leadId,
      full_name: newLead.full_name,
      status: 'New',
      priority: newLead.priority,
      lead_score: 50,
      sentiment: 'Neutral',
      property_id: propertyId,
      properties_interested: [propertyId],
      assigned_to: 'USR_001',
      rent_range: newLead.rent_range || '—',
      move_in: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      phone: newLead.phone || '—',
      email: newLead.email || '—',
      notes: newLead.notes,
      next_task_date: null,
      source: newLead.source,
      source_detail: newLead.source_detail,
    };

    setLeads(prev => [newLeadData, ...prev]);

    // If source is Call and has recording, create interaction
    if (newLead.source === 'Call' && callRecording) {
      const audioUrl = URL.createObjectURL(callRecording);
      const newInteraction: Interaction = {
        id: `INT_${Date.now()}`,
        lead_id: leadId,
        type: 'Call',
        direction: callDirection,
        summary: callRecording ? 'Voice recording attached' : 'Initial call',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        attachments: [{
          type: 'audio',
          filename: callRecording.name,
          url: audioUrl,
        }]
      };
      setInteractions(prev => [...prev, newInteraction]);
    }

    // Reset form
    setNewLead({
      full_name: '',
      phone: '',
      email: '',
      rent_range: '',
      property_id: '',
      priority: 'Medium',
      source: 'Website',
      source_detail: '',
      notes: '',
    });
    setCallRecording(null);
    setIsAddLeadOpen(false);
    
    toast({
      title: 'Lead added',
      description: `${newLeadData.full_name} added to New leads`,
    });
  };

  // Log Call with recording handler
  const handleLogCallWithRecording = () => {
    if (!selectedLead) return;

    let attachments: AudioAttachment[] = [];
    if (logCallRecording) {
      const audioUrl = URL.createObjectURL(logCallRecording);
      attachments = [{
        type: 'audio',
        filename: logCallRecording.name,
        url: audioUrl,
      }];
    }

    const newInteraction: Interaction = {
      id: `INT_${Date.now()}`,
      lead_id: selectedLead.id,
      type: 'Call',
      direction: logCallDirection,
      summary: logCallSummary || (logCallRecording ? 'Voice recording attached' : 'Call logged'),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      attachments,
    };

    setInteractions(prev => [...prev, newInteraction]);
    setLogCallSummary('');
    setLogCallRecording(null);
    setIsLogCallOpen(false);

    toast({
      title: 'Call logged',
      description: logCallRecording ? 'Call recorded and saved' : 'Call interaction logged',
    });
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
            className={`cursor-pointer hover:shadow-md transition-all border-border bg-card ${
              snapshot.isDragging ? 'shadow-lg ring-2 ring-primary crm-shadow-glow' : ''
            }`}
            onClick={() => openLeadDetail(lead)}
            onKeyDown={(e) => e.key === 'Enter' && openLeadDetail(lead)}
          >
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{lead.full_name}</h4>
                  <p className="text-xs text-muted-foreground">{lead.rent_range}</p>
                </div>
                <Badge className={`text-xs ${priorityConfig[lead.priority].bgColor} ${priorityConfig[lead.priority].color} border-0`}>
                  {lead.priority}
                </Badge>
              </div>

              {/* Sentiment */}
              <div className="flex items-center gap-1.5">
                {lead.sentiment === 'High Intent' ? (
                  <Star className="h-3 w-3 text-status-leased fill-status-leased" />
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

              {/* Source */}
              <SourceBadge source={lead.source} sourceDetail={lead.source_detail} compact />

              {/* Interactions count */}
              {leadInteractions.length > 0 && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {inboundCount > 0 && <span>↓{inboundCount} in</span>}
                  {outboundCount > 0 && <span>↑{outboundCount} out</span>}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 ring-2 ring-secondary/30">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
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
    <div className="p-6 space-y-6 max-w-full mx-auto animate-fade-in bg-background min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">CRM & Leads</h1>
          <p className="text-muted-foreground">Omni-channel lead management and tracking</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={() => setIsAddLeadOpen(true)}>
          <User className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border shadow-sm border-b-2 border-b-primary/15">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Total Active Leads
            </CardDescription>
            <CardTitle className="text-3xl text-foreground">{stats.totalActive}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border shadow-sm border-b-2 border-b-primary/15">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4 text-priority-high" />
              High Priority
            </CardDescription>
            <CardTitle className="text-3xl text-foreground">{stats.highPriority}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border shadow-sm border-b-2 border-b-primary/15">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-status-tour" />
              Tours Scheduled
            </CardDescription>
            <CardTitle className="text-3xl text-foreground">{stats.toursScheduled}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border shadow-sm border-b-2 border-b-primary/15">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-status-leased" />
              Avg Lead Score
            </CardDescription>
            <CardTitle className="text-3xl text-foreground">{stats.avgScore}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters & View Toggle */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full md:w-auto flex-wrap">
              <div className="relative flex-1 max-w-md min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted border-border focus:ring-2 focus:ring-primary"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-muted border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOrder.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] bg-muted border-border">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[140px] bg-muted border-border">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Sources</SelectItem>
                  {sourceOptions.map(src => (
                    <SelectItem key={src} value={src}>{src}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className={viewMode === 'kanban' ? 'bg-primary hover:bg-primary-hover text-primary-foreground' : 'border-border text-foreground hover:bg-muted'}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-primary hover:bg-primary-hover text-primary-foreground' : 'border-border text-foreground hover:bg-muted'}
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
                  <Card className="h-full bg-kanban-column border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                          <div className={`w-3 h-3 rounded-full ${config.color}`} />
                          {config.label}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">
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
                            snapshot.isDraggingOver ? 'bg-primary/5' : ''
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
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/50">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Phone</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Property</TableHead>
                  <TableHead className="text-muted-foreground">Source</TableHead>
                  <TableHead className="text-muted-foreground">Next Task Date</TableHead>
                  <TableHead className="text-muted-foreground">Score</TableHead>
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
                      className="cursor-pointer hover:bg-primary/5 border-border"
                      onClick={() => openLeadDetail(lead)}
                    >
                      <TableCell className="font-medium text-foreground">{lead.full_name}</TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[lead.status].bgColor} ${statusConfig[lead.status].color.replace('bg-', 'text-').replace('-500', '-600')} border-0`}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{lead.phone || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.email || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{property?.name || '—'}</TableCell>
                      <TableCell>
                        <SourceBadge source={lead.source} sourceDetail={lead.source_detail} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{nextTask ? formatDateTime(nextTask) : '—'}</TableCell>
                      <TableCell>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getScoreColor(lead.lead_score)}`}>
                          {lead.lead_score}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Lead Dialog */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="sm:max-w-[500px] bg-popover border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Lead</DialogTitle>
            <DialogDescription className="text-muted-foreground">Enter lead information to create a new record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                value={newLead.full_name}
                onChange={(e) => setNewLead(prev => ({ ...prev, full_name: e.target.value }))}
                className="bg-muted border-border focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={newLead.phone}
                  onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-muted border-border focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-muted border-border focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Source</Label>
                <Select value={newLead.source} onValueChange={(val) => setNewLead(prev => ({ ...prev, source: val as LeadSource }))}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {sourceOptions.map(src => (
                      <SelectItem key={src} value={src}>{src}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source_detail">Source Detail</Label>
                <Input 
                  id="source_detail" 
                  placeholder="e.g., zillow, contact form"
                  value={newLead.source_detail}
                  onChange={(e) => setNewLead(prev => ({ ...prev, source_detail: e.target.value }))}
                  className="bg-muted border-border focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Property</Label>
                <Select value={newLead.property_id} onValueChange={(val) => setNewLead(prev => ({ ...prev, property_id: val }))}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {properties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={newLead.priority} onValueChange={(val) => setNewLead(prev => ({ ...prev, priority: val as Priority }))}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rent_range">Rent Range</Label>
              <Input 
                id="rent_range" 
                placeholder="e.g., $2k-$2.5k"
                value={newLead.rent_range}
                onChange={(e) => setNewLead(prev => ({ ...prev, rent_range: e.target.value }))}
                className="bg-muted border-border focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={newLead.notes}
                onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-muted border-border focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {/* Call Recording (only shown when source is Call) */}
            {newLead.source === 'Call' && (
              <div className="grid gap-2 p-3 bg-muted rounded-lg border border-border">
                <Label className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-primary" />
                  Attach call recording (optional)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Select value={callDirection} onValueChange={(val) => setCallDirection(val as 'Inbound' | 'Missed')}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Inbound">Inbound</SelectItem>
                      <SelectItem value="Missed">Missed</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setCallRecording(e.target.files?.[0] || null)}
                      className="bg-card border-border"
                      aria-label="Upload call recording"
                    />
                  </div>
                </div>
                {callRecording && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    {callRecording.name}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLeadOpen(false)} className="border-border text-foreground hover:bg-muted">
              Cancel
            </Button>
            <Button onClick={handleAddLead} className="bg-primary hover:bg-primary-hover text-primary-foreground">
              Add Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Call Dialog */}
      <Dialog open={isLogCallOpen} onOpenChange={setIsLogCallOpen}>
        <DialogContent className="sm:max-w-[400px] bg-popover border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Log Call</DialogTitle>
            <DialogDescription className="text-muted-foreground">Record a call interaction with optional voice recording.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Direction</Label>
              <Select value={logCallDirection} onValueChange={(val) => setLogCallDirection(val as 'Inbound' | 'Outbound')}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Inbound">Inbound</SelectItem>
                  <SelectItem value="Outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="call_summary">Summary</Label>
              <Textarea
                id="call_summary"
                placeholder="Brief description of the call..."
                value={logCallSummary}
                onChange={(e) => setLogCallSummary(e.target.value)}
                className="bg-muted border-border focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                Attach recording (optional)
              </Label>
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => setLogCallRecording(e.target.files?.[0] || null)}
                className="bg-muted border-border"
                aria-label="Upload call recording"
              />
              {logCallRecording && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  {logCallRecording.name}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogCallOpen(false)} className="border-border text-foreground hover:bg-muted">
              Cancel
            </Button>
            <Button onClick={handleLogCallWithRecording} className="bg-primary hover:bg-primary-hover text-primary-foreground">
              <PhoneCall className="h-4 w-4 mr-2" />
              Log Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-popover border-l border-border">
          {selectedLead && (() => {
            const user = getUser(selectedLead.assigned_to);
            const property = getProperty(selectedLead.property_id);
            const leadInteractions = getLeadInteractions(selectedLead.id);
            const leadTasks = getLeadTasks(selectedLead.id);

            return (
              <>
                <SheetHeader className="crm-gradient-header -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
                  <SheetTitle className="flex items-center gap-3 text-white">
                    <Avatar className="h-12 w-12 ring-2 ring-white/30">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedLead.id}`} />
                      <AvatarFallback className="bg-primary-light text-white">
                        {selectedLead.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{selectedLead.full_name}</div>
                      <div className="text-sm text-white/80 font-normal">
                        Lead Score: {selectedLead.lead_score}
                      </div>
                    </div>
                  </SheetTitle>
                  <SheetDescription className="text-white/70">
                    <div className="flex flex-col gap-1">
                      <span><Phone className="inline h-3 w-3 mr-1" />{selectedLead.phone || '—'}</span>
                      <span><Mail className="inline h-3 w-3 mr-1" />{selectedLead.email || '—'}</span>
                    </div>
                  </SheetDescription>
                  
                  {/* Contact Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" onClick={() => handleLogInteraction(selectedLead.id, 'Call')}>
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" onClick={() => handleLogInteraction(selectedLead.id, 'Email')}>
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" onClick={() => handleLogInteraction(selectedLead.id, 'SMS')}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      SMS
                    </Button>
                  </div>
                </SheetHeader>

                <Tabs defaultValue="timeline" className="mt-6">
                  <TabsList className="w-full bg-muted">
                    <TabsTrigger value="timeline" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">Timeline</TabsTrigger>
                    <TabsTrigger value="tasks" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">Tasks</TabsTrigger>
                    <TabsTrigger value="profile" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">Profile</TabsTrigger>
                    <TabsTrigger value="actions" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="timeline" className="space-y-4 mt-4">
                    {leadInteractions.length > 0 ? (
                      leadInteractions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((interaction) => (
                          <Card key={interaction.id} className="border-border">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 p-1.5 rounded ${interaction.direction === 'Inbound' ? 'bg-primary/10 text-primary' : 'bg-status-leased/10 text-status-leased'}`}>
                                  {interaction.type === 'Email' && <Mail className="h-3 w-3" />}
                                  {interaction.type === 'SMS' && <MessageSquare className="h-3 w-3" />}
                                  {interaction.type === 'Call' && <Phone className="h-3 w-3" />}
                                  {interaction.type === 'View' && <Eye className="h-3 w-3" />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs border-border">
                                        {interaction.type}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs bg-muted">
                                        {interaction.direction}
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDateTime(interaction.date)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground">{interaction.summary}</p>
                                  
                                  {/* Audio Player for attachments */}
                                  {interaction.attachments && interaction.attachments.length > 0 && interaction.attachments.map((att, idx) => (
                                    att.type === 'audio' && <AudioPlayer key={idx} attachment={att} />
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No interactions recorded
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tasks" className="space-y-4 mt-4">
                    {leadTasks.length > 0 ? (
                      leadTasks.map((task) => (
                        <Card key={task.id} className="border-border">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Checkbox 
                                checked={task.status === 'Completed'}
                                onCheckedChange={() => handleToggleTask(task.id)}
                                className="border-primary data-[state=checked]:bg-primary"
                              />
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                  {task.title}
                                </p>
                                <p className="text-xs text-muted-foreground">Due: {formatDateTime(task.due_at)}</p>
                              </div>
                              <Badge variant="secondary" className={`text-xs ${task.status === 'Completed' ? 'bg-status-leased/15 text-status-leased' : task.status === 'In Progress' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                {task.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No tasks
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="profile" className="space-y-4 mt-4">
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-base text-foreground">Lead Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={`${statusConfig[selectedLead.status].color} text-white`}>
                            {selectedLead.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Priority:</span>
                          <Badge className={`${priorityConfig[selectedLead.priority].bgColor} ${priorityConfig[selectedLead.priority].color} border-0`}>
                            {selectedLead.priority}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sentiment:</span>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${sentimentConfig[selectedLead.sentiment].dotColor}`} />
                            <span className={sentimentConfig[selectedLead.sentiment].color}>{selectedLead.sentiment}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Source:</span>
                          <div className="text-right">
                            <SourceBadge source={selectedLead.source} sourceDetail={selectedLead.source_detail} />
                            {selectedLead.source_detail && (
                              <p className="text-xs text-muted-foreground mt-1">({selectedLead.source_detail})</p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lead Score:</span>
                          <span className="font-semibold text-foreground">{selectedLead.lead_score}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rent Range:</span>
                          <span className="font-medium text-foreground">{selectedLead.rent_range}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Move-in Date:</span>
                          <span className="font-medium text-foreground">{formatDate(selectedLead.move_in)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Property:</span>
                          <span className="font-medium text-primary">{property?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Assigned To:</span>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 ring-2 ring-secondary/30">
                              <AvatarImage src={user?.avatar} />
                              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                {user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{user?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                        {selectedLead.notes && (
                          <div className="pt-2 border-t border-border">
                            <span className="text-muted-foreground">Notes:</span>
                            <p className="mt-1 text-sm text-foreground">{selectedLead.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4 mt-4">
                    {/* Change Status */}
                    <Card className="border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-foreground">Change Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Select value={selectedLead.status} onValueChange={(val) => handleStatusChange(selectedLead.id, val as LeadStatus)}>
                          <SelectTrigger className="w-full bg-muted border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {statusOptions.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>

                    {/* Schedule Tour */}
                    <Card className="border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-foreground">Schedule Tour</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal border-border hover:bg-muted",
                                !tourDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {tourDate ? format(tourDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
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
                          className="bg-muted border-border"
                        />
                        <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground" onClick={() => handleScheduleTour(selectedLead.id)}>
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Schedule Tour
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Log Interactions */}
                    <Card className="border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-foreground">Log Interaction</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 border-border hover:bg-muted" onClick={() => handleLogInteraction(selectedLead.id, 'Email')}>
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                          <Button variant="outline" className="flex-1 border-border hover:bg-muted" onClick={() => handleLogInteraction(selectedLead.id, 'SMS')}>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            SMS
                          </Button>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full border-border hover:bg-muted" 
                          onClick={() => setIsLogCallOpen(true)}
                        >
                          <Mic className="h-4 w-4 mr-1" />
                          Log Call with Recording
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
