import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Image as ImageIcon,
  Send,
  Star,
  Bell,
  MessageCircle,
  Phone,
  Upload,
  X,
  Calendar,
  Wrench,
  Home,
  FileText,
} from 'lucide-react';

// Types for tenant maintenance requests
interface TenantRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'closed';
  createdAt: string;
  updatedAt: string;
  images: string[];
  assignedVendorName?: string;
  assignedVendorPhone?: string;
  expectedVisitTime?: string;
  completedAt?: string;
  rating?: number;
  feedback?: string;
  timeline: RequestTimelineEvent[];
}

interface RequestTimelineEvent {
  id: string;
  type: 'created' | 'assigned' | 'status_changed' | 'message' | 'visit_scheduled' | 'completed';
  description: string;
  timestamp: string;
  userName: string;
}

interface Notification {
  id: string;
  type: 'confirmation' | 'arrival' | 'delay' | 'completion';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Mock data
const mockRequests: TenantRequest[] = [
  {
    id: 'tr-1',
    title: 'Kitchen Faucet Leaking',
    description: 'The kitchen faucet has been dripping constantly for the past 2 days.',
    category: 'Plumbing',
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    images: [],
    assignedVendorName: 'Mike Johnson - ABC Plumbing',
    assignedVendorPhone: '(555) 123-4567',
    expectedVisitTime: new Date(Date.now() + 3600000 * 4).toISOString(),
    timeline: [
      { id: 'e1', type: 'created', description: 'Request submitted', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), userName: 'You' },
      { id: 'e2', type: 'assigned', description: 'Assigned to Mike Johnson - ABC Plumbing', timestamp: new Date(Date.now() - 86400000).toISOString(), userName: 'Building Manager' },
      { id: 'e3', type: 'visit_scheduled', description: 'Visit scheduled for today at 2:00 PM', timestamp: new Date(Date.now() - 3600000).toISOString(), userName: 'Mike Johnson' },
    ],
  },
  {
    id: 'tr-2',
    title: 'AC Not Cooling Properly',
    description: 'The air conditioning unit is running but not producing cold air.',
    category: 'HVAC',
    priority: 'high',
    status: 'assigned',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    images: [],
    assignedVendorName: 'Cool Air Services',
    assignedVendorPhone: '(555) 987-6543',
    timeline: [
      { id: 'e1', type: 'created', description: 'Request submitted', timestamp: new Date(Date.now() - 86400000).toISOString(), userName: 'You' },
      { id: 'e2', type: 'assigned', description: 'Assigned to Cool Air Services', timestamp: new Date(Date.now() - 7200000).toISOString(), userName: 'Building Manager' },
    ],
  },
  {
    id: 'tr-3',
    title: 'Bedroom Light Fixture Broken',
    description: 'The ceiling light in the master bedroom stopped working.',
    category: 'Electrical',
    priority: 'low',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    images: [],
    assignedVendorName: 'Electric Pro',
    rating: 5,
    feedback: 'Great service, very professional!',
    timeline: [
      { id: 'e1', type: 'created', description: 'Request submitted', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), userName: 'You' },
      { id: 'e2', type: 'assigned', description: 'Assigned to Electric Pro', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), userName: 'Building Manager' },
      { id: 'e3', type: 'completed', description: 'Work completed successfully', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), userName: 'Electric Pro' },
    ],
  },
];

const mockNotifications: Notification[] = [
  { id: 'n1', type: 'arrival', title: 'Technician En Route', message: 'Mike Johnson from ABC Plumbing is on the way. ETA: 30 minutes', timestamp: new Date(Date.now() - 1800000).toISOString(), read: false },
  { id: 'n2', type: 'confirmation', title: 'Request Received', message: 'Your maintenance request "AC Not Cooling" has been received and is being reviewed.', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true },
  { id: 'n3', type: 'completion', title: 'Work Completed', message: 'The work on "Bedroom Light Fixture" has been completed. Please provide your feedback.', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), read: true },
];

const categories = ['Plumbing', 'Electrical', 'HVAC', 'Appliances', 'Structural', 'Pest Control', 'General', 'Other'];

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-500', description: 'Non-urgent, can wait a few days' },
  medium: { label: 'Medium', color: 'bg-yellow-500', description: 'Should be addressed soon' },
  high: { label: 'High', color: 'bg-orange-500', description: 'Urgent, needs attention today' },
  emergency: { label: 'Emergency', color: 'bg-red-500', description: 'Health/safety risk, immediate action needed' },
};

const statusConfig = {
  submitted: { label: 'Submitted', icon: FileText, color: 'text-blue-500 bg-blue-500/10' },
  assigned: { label: 'Assigned', icon: User, color: 'text-purple-500 bg-purple-500/10' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-orange-500 bg-orange-500/10' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-500 bg-green-500/10' },
  closed: { label: 'Closed', icon: CheckCircle, color: 'text-gray-500 bg-gray-500/10' },
};

const TenantPortal = () => {
  const [requests, setRequests] = useState<TenantRequest[]>(mockRequests);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState('requests');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TenantRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackRequest, setFeedbackRequest] = useState<TenantRequest | null>(null);
  const { toast } = useToast();

  // Create request form state
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'emergency',
    images: [] as File[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Chat message state
  const [chatMessage, setChatMessage] = useState('');

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleCreateRequest = () => {
    if (!newRequest.title || !newRequest.category) {
      toast({ title: 'Missing Information', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const request: TenantRequest = {
      id: `tr-${Date.now()}`,
      title: newRequest.title,
      description: newRequest.description,
      category: newRequest.category,
      priority: newRequest.priority,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [],
      timeline: [
        { id: `e-${Date.now()}`, type: 'created', description: 'Request submitted', timestamp: new Date().toISOString(), userName: 'You' },
      ],
    };

    setRequests(prev => [request, ...prev]);
    setNewRequest({ title: '', description: '', category: '', priority: 'medium', images: [] });
    setIsCreateOpen(false);

    // Add notification
    const notification: Notification = {
      id: `n-${Date.now()}`,
      type: 'confirmation',
      title: 'Request Submitted',
      message: `Your maintenance request "${request.title}" has been submitted successfully.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notification, ...prev]);

    toast({ title: 'Request Submitted', description: 'Your maintenance request has been submitted successfully.' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewRequest(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setNewRequest(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleApproveClose = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'closed' as const } : r));
    setIsDetailOpen(false);
    toast({ title: 'Work Order Closed', description: 'Thank you for confirming the work was completed.' });
  };

  const handleSubmitFeedback = () => {
    if (!feedbackRequest) return;

    setRequests(prev => prev.map(r => 
      r.id === feedbackRequest.id ? { ...r, rating: feedbackRating, feedback: feedbackComment } : r
    ));
    setFeedbackRating(0);
    setFeedbackComment('');
    setFeedbackRequest(null);
    setIsFeedbackOpen(false);
    toast({ title: 'Feedback Submitted', description: 'Thank you for your feedback!' });
  };

  const handleSendMessage = (requestId: string) => {
    if (!chatMessage.trim()) return;

    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          timeline: [...r.timeline, {
            id: `msg-${Date.now()}`,
            type: 'message' as const,
            description: chatMessage,
            timestamp: new Date().toISOString(),
            userName: 'You',
          }],
        };
      }
      return r;
    }));

    if (selectedRequest) {
      setSelectedRequest(prev => prev ? {
        ...prev,
        timeline: [...prev.timeline, {
          id: `msg-${Date.now()}`,
          type: 'message' as const,
          description: chatMessage,
          timestamp: new Date().toISOString(),
          userName: 'You',
        }],
      } : null);
    }

    setChatMessage('');
    toast({ title: 'Message Sent', description: 'Your message has been sent to the assigned vendor.' });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const stats = {
    total: requests.length,
    active: requests.filter(r => ['submitted', 'assigned', 'in_progress'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'completed' || r.status === 'closed').length,
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Portal</h1>
          <p className="text-muted-foreground">Manage your maintenance requests and communications</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="relative" onClick={() => setActiveTab('notifications')}>
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="nexus-gradient-primary text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Submit Maintenance Request</DialogTitle>
                <DialogDescription>Describe your issue and we'll get it fixed as soon as possible.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Kitchen faucet leaking"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newRequest.category} onValueChange={(v) => setNewRequest(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    rows={4}
                    value={newRequest.description}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Tip: Be specific about location, symptoms, and when the issue started.</p>
                </div>
                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(priorityConfig) as [keyof typeof priorityConfig, typeof priorityConfig.low][]).map(([key, config]) => (
                      <Button
                        key={key}
                        type="button"
                        variant={newRequest.priority === key ? 'default' : 'outline'}
                        className={`justify-start h-auto py-2 ${newRequest.priority === key ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setNewRequest(prev => ({ ...prev, priority: key }))}
                      >
                        <div className="flex items-center gap-2">
                          {key === 'emergency' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          <div className="text-left">
                            <div className="font-medium text-sm">{config.label}</div>
                            <div className="text-xs text-muted-foreground">{config.description}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Photos/Videos (Optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {newRequest.images.map((file, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg border bg-muted overflow-hidden">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleImageUpload} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button className="nexus-gradient-primary text-white" onClick={handleCreateRequest}>Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardDescription>Total Requests</CardDescription><CardTitle className="text-3xl">{stats.total}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Active</CardDescription><CardTitle className="text-3xl text-orange-500">{stats.active}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Completed</CardDescription><CardTitle className="text-3xl text-green-500">{stats.completed}</CardTitle></CardHeader></Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests"><Wrench className="h-4 w-4 mr-2" />My Requests</TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {unreadNotifications > 0 && (
              <span className="ml-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4 space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Maintenance Requests</h3>
                <p className="text-muted-foreground mt-1">Submit a request when you need something fixed.</p>
                <Button className="mt-4 nexus-gradient-primary text-white" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />Submit Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => {
              const StatusIcon = statusConfig[request.status].icon;
              return (
                <Card
                  key={request.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => { setSelectedRequest(request); setIsDetailOpen(true); }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{request.title}</CardTitle>
                          <Badge className={`${priorityConfig[request.priority].color} text-white`}>{priorityConfig[request.priority].label}</Badge>
                        </div>
                        <CardDescription className="mt-1">{request.category} • Submitted {formatDate(request.createdAt)}</CardDescription>
                      </div>
                      <Badge variant="secondary" className={statusConfig[request.status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[request.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
                    {request.assignedVendorName && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{request.assignedVendorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{request.assignedVendorName}</span>
                        {request.expectedVisitTime && (
                          <Badge variant="outline" className="ml-auto">
                            <Calendar className="h-3 w-3 mr-1" />
                            Expected: {formatDate(request.expectedVisitTime)}
                          </Badge>
                        )}
                      </div>
                    )}
                    {request.status === 'completed' && !request.rating && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={(e) => { e.stopPropagation(); setFeedbackRequest(request); setIsFeedbackOpen(true); }}
                      >
                        <Star className="h-4 w-4 mr-1" />Rate Service
                      </Button>
                    )}
                    {request.rating && (
                      <div className="flex items-center gap-1 mt-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-4 w-4 ${star <= request.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">{request.feedback}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Notifications</h3>
                <p className="text-muted-foreground mt-1">You'll be notified about updates to your requests.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
                onClick={() => markNotificationRead(notification.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {notification.type === 'arrival' && <User className="h-4 w-4 text-blue-500" />}
                      {notification.type === 'confirmation' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {notification.type === 'delay' && <Clock className="h-4 w-4 text-orange-500" />}
                      {notification.type === 'completion' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                    </div>
                    {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(notification.timestamp)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Request Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-hidden flex flex-col">
          {selectedRequest && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge className={`${priorityConfig[selectedRequest.priority].color} text-white`}>{priorityConfig[selectedRequest.priority].label}</Badge>
                  <Badge variant="secondary" className={statusConfig[selectedRequest.status].color}>
                    {statusConfig[selectedRequest.status].label}
                  </Badge>
                </div>
                <SheetTitle>{selectedRequest.title}</SheetTitle>
                <SheetDescription>{selectedRequest.category} • {formatDate(selectedRequest.createdAt)}</SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-6 py-4">
                  {/* Description */}
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                  </div>

                  {/* Assigned Vendor */}
                  {selectedRequest.assignedVendorName && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-3">Assigned Technician</h4>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{selectedRequest.assignedVendorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{selectedRequest.assignedVendorName}</p>
                          {selectedRequest.assignedVendorPhone && (
                            <p className="text-sm text-muted-foreground">{selectedRequest.assignedVendorPhone}</p>
                          )}
                        </div>
                        {selectedRequest.assignedVendorPhone && (
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {selectedRequest.expectedVisitTime && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Expected visit: {formatDate(selectedRequest.expectedVisitTime)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <h4 className="font-medium mb-3">Activity Timeline</h4>
                    <div className="space-y-4">
                      {selectedRequest.timeline.map((event, idx) => (
                        <div key={event.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            {idx < selectedRequest.timeline.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-medium">{event.description}</p>
                            <p className="text-xs text-muted-foreground">{event.userName} • {formatDate(event.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat */}
                  {selectedRequest.assignedVendorName && selectedRequest.status !== 'completed' && selectedRequest.status !== 'closed' && (
                    <div>
                      <h4 className="font-medium mb-3">Send Message</h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(selectedRequest.id)}
                        />
                        <Button size="icon" onClick={() => handleSendMessage(selectedRequest.id)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Actions */}
              <div className="pt-4 border-t flex gap-2">
                {selectedRequest.status === 'completed' && (
                  <>
                    <Button className="flex-1" variant="outline" onClick={() => { setFeedbackRequest(selectedRequest); setIsFeedbackOpen(true); }}>
                      <Star className="h-4 w-4 mr-2" />Rate Service
                    </Button>
                    <Button className="flex-1 nexus-gradient-primary text-white" onClick={() => handleApproveClose(selectedRequest.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />Approve & Close
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>How was the service for "{feedbackRequest?.title}"?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className="p-1"
                >
                  <Star className={`h-8 w-8 transition-colors ${star <= feedbackRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground hover:text-yellow-400'}`} />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Comments (Optional)</Label>
              <Textarea
                placeholder="Share your experience..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeedbackOpen(false)}>Skip</Button>
            <Button className="nexus-gradient-primary text-white" onClick={handleSubmitFeedback} disabled={feedbackRating === 0}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantPortal;
