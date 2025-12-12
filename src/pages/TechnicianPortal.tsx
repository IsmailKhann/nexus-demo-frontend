import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Wrench,
  Clock,
  CheckCircle,
  User,
  Upload,
  X,
  Calendar,
  MapPin,
  Phone,
  FileText,
  Star,
  DollarSign,
  Camera,
  Play,
  Pause,
  Check,
  XCircle,
  AlertTriangle,
  Settings,
  Bell,
  TrendingUp,
  Award,
  MessageCircle,
} from 'lucide-react';

// Types for technician work orders
interface TechnicianJob {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'accepted' | 'on_the_way' | 'work_started' | 'work_completed' | 'rejected';
  propertyName: string;
  unitNumber: string;
  address: string;
  tenantName: string;
  tenantPhone: string;
  createdAt: string;
  scheduledDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  partsUsed: PartUsed[];
  serviceNotes: string;
  beforeImages: string[];
  afterImages: string[];
  rating?: number;
  feedback?: string;
}

interface PartUsed {
  id: string;
  name: string;
  quantity: number;
  cost: number;
}

interface TechnicianProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  services: string[];
  rateCard: RateCard[];
  documents: Document[];
  status: 'pending_approval' | 'approved' | 'suspended';
  isOnline: boolean;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  onTimeRate: number;
}

interface RateCard {
  service: string;
  rate: number;
  unit: 'hour' | 'job';
}

interface Document {
  id: string;
  name: string;
  type: 'gst' | 'pan' | 'certification' | 'bank' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
}

// Mock data
const mockJobs: TechnicianJob[] = [
  {
    id: 'job-1',
    title: 'Fix Leaking Kitchen Faucet',
    description: 'Kitchen faucet has been dripping constantly. Tenant reports it started 2 days ago.',
    category: 'Plumbing',
    priority: 'medium',
    status: 'accepted',
    propertyName: 'Sunset Apartments',
    unitNumber: '204',
    address: '123 Main St, Apt 204, San Francisco, CA 94102',
    tenantName: 'John Smith',
    tenantPhone: '(555) 123-4567',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    scheduledDate: new Date(Date.now() + 3600000 * 2).toISOString(),
    estimatedCost: 150,
    partsUsed: [],
    serviceNotes: '',
    beforeImages: [],
    afterImages: [],
  },
  {
    id: 'job-2',
    title: 'HVAC Not Cooling',
    description: 'AC unit running but not producing cold air. Might need refrigerant recharge.',
    category: 'HVAC',
    priority: 'high',
    status: 'pending',
    propertyName: 'Oak Tree Residences',
    unitNumber: '101',
    address: '456 Oak Ave, Unit 101, San Francisco, CA 94103',
    tenantName: 'Sarah Johnson',
    tenantPhone: '(555) 987-6543',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    estimatedCost: 300,
    partsUsed: [],
    serviceNotes: '',
    beforeImages: [],
    afterImages: [],
  },
  {
    id: 'job-3',
    title: 'Replace Light Fixture',
    description: 'Ceiling light in bedroom stopped working. Fixture needs replacement.',
    category: 'Electrical',
    priority: 'low',
    status: 'work_completed',
    propertyName: 'Sunset Apartments',
    unitNumber: '305',
    address: '123 Main St, Apt 305, San Francisco, CA 94102',
    tenantName: 'Mike Brown',
    tenantPhone: '(555) 456-7890',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    estimatedCost: 100,
    actualCost: 85,
    partsUsed: [{ id: 'p1', name: 'LED Light Fixture', quantity: 1, cost: 45 }],
    serviceNotes: 'Replaced old fixture with new LED. Tested and working properly.',
    beforeImages: [],
    afterImages: [],
    rating: 5,
    feedback: 'Great work, very professional!',
  },
];

const mockProfile: TechnicianProfile = {
  id: 'tech-1',
  name: 'Demo Technician',
  email: 'demo.technician@nexus.com',
  phone: '(555) 111-2222',
  services: ['Plumbing', 'HVAC', 'Electrical'],
  rateCard: [
    { service: 'Plumbing', rate: 75, unit: 'hour' },
    { service: 'HVAC', rate: 85, unit: 'hour' },
    { service: 'Electrical', rate: 80, unit: 'hour' },
  ],
  documents: [
    { id: 'd1', name: 'GST Registration', type: 'gst', status: 'approved', uploadedAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: 'd2', name: 'PAN Card', type: 'pan', status: 'approved', uploadedAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: 'd3', name: 'Plumbing Certification', type: 'certification', status: 'approved', uploadedAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  ],
  status: 'approved',
  isOnline: true,
  rating: 4.8,
  totalJobs: 156,
  completedJobs: 152,
  onTimeRate: 94,
};

const serviceCategories = ['Plumbing', 'Electrical', 'HVAC', 'Appliances', 'General Maintenance', 'Carpentry', 'Painting', 'Pest Control'];

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-500' },
  medium: { label: 'Medium', color: 'bg-yellow-500' },
  high: { label: 'High', color: 'bg-orange-500' },
  emergency: { label: 'Emergency', color: 'bg-red-500' },
};

const statusConfig = {
  pending: { label: 'Pending', color: 'text-blue-500 bg-blue-500/10' },
  accepted: { label: 'Accepted', color: 'text-purple-500 bg-purple-500/10' },
  on_the_way: { label: 'On The Way', color: 'text-cyan-500 bg-cyan-500/10' },
  work_started: { label: 'Work Started', color: 'text-orange-500 bg-orange-500/10' },
  work_completed: { label: 'Completed', color: 'text-green-500 bg-green-500/10' },
  rejected: { label: 'Rejected', color: 'text-red-500 bg-red-500/10' },
};

const TechnicianPortal = () => {
  const [jobs, setJobs] = useState<TechnicianJob[]>(mockJobs);
  const [profile, setProfile] = useState<TechnicianProfile>(mockProfile);
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState<TechnicianJob | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const { toast } = useToast();

  // Job update form state
  const [serviceNotes, setServiceNotes] = useState('');
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>([]);
  const [newPart, setNewPart] = useState({ name: '', quantity: 1, cost: 0 });
  const [actualCost, setActualCost] = useState(0);
  const beforeImageRef = useRef<HTMLInputElement>(null);
  const afterImageRef = useRef<HTMLInputElement>(null);
  const [beforeImages, setBeforeImages] = useState<File[]>([]);
  const [afterImages, setAfterImages] = useState<File[]>([]);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const documentRef = useRef<HTMLInputElement>(null);

  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const activeJobs = jobs.filter(j => ['accepted', 'on_the_way', 'work_started'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'work_completed');

  const handleAcceptJob = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'accepted' as const } : j));
    toast({ title: 'Job Accepted', description: 'You have accepted this work order.' });
  };

  const handleRejectJob = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'rejected' as const } : j));
    toast({ title: 'Job Rejected', description: 'You have declined this work order.' });
  };

  const handleUpdateStatus = (jobId: string, newStatus: TechnicianJob['status']) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: newStatus,
          serviceNotes: serviceNotes || j.serviceNotes,
          partsUsed: partsUsed.length > 0 ? partsUsed : j.partsUsed,
          actualCost: actualCost > 0 ? actualCost : j.actualCost,
        };
      }
      return j;
    }));
    
    setIsUpdateStatusOpen(false);
    setServiceNotes('');
    setPartsUsed([]);
    setActualCost(0);
    setBeforeImages([]);
    setAfterImages([]);
    
    const statusLabels = {
      on_the_way: 'On The Way',
      work_started: 'Work Started',
      work_completed: 'Work Completed',
    };
    
    toast({ 
      title: 'Status Updated', 
      description: `Job status changed to "${statusLabels[newStatus as keyof typeof statusLabels] || newStatus}"` 
    });
  };

  const handleAddPart = () => {
    if (!newPart.name) return;
    setPartsUsed(prev => [...prev, { ...newPart, id: `p-${Date.now()}` }]);
    setNewPart({ name: '', quantity: 1, cost: 0 });
  };

  const handleRemovePart = (partId: string) => {
    setPartsUsed(prev => prev.filter(p => p.id !== partId));
  };

  const handleToggleAvailability = () => {
    setProfile(prev => ({ ...prev, isOnline: !prev.isOnline }));
    toast({ 
      title: profile.isOnline ? 'Now Offline' : 'Now Online',
      description: profile.isOnline ? 'You will not receive new job assignments' : 'You are now available for new jobs'
    });
  };

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setIsEditingProfile(false);
    toast({ title: 'Profile Updated', description: 'Your profile has been saved successfully.' });
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const openJobDetail = (job: TechnicianJob) => {
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  };

  const openStatusUpdate = (job: TechnicianJob) => {
    setSelectedJob(job);
    setServiceNotes(job.serviceNotes);
    setPartsUsed(job.partsUsed);
    setActualCost(job.actualCost || job.estimatedCost || 0);
    setIsUpdateStatusOpen(true);
  };

  const stats = {
    pending: pendingJobs.length,
    active: activeJobs.length,
    completed: completedJobs.length,
    earnings: completedJobs.reduce((sum, j) => sum + (j.actualCost || 0), 0),
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Technician Portal</h1>
          <p className="text-muted-foreground">Manage your work orders and profile</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Availability</span>
            <Switch checked={profile.isOnline} onCheckedChange={handleToggleAvailability} />
            <Badge variant={profile.isOnline ? 'default' : 'secondary'} className={profile.isOnline ? 'bg-green-500' : ''}>
              {profile.isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Bell className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Wrench className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Earnings</p>
                <p className="text-2xl font-bold">${stats.earnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="jobs">Work Orders</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Work Orders Tab */}
        <TabsContent value="jobs" className="space-y-6">
          {/* Pending Jobs */}
          {pendingJobs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                  New Job Requests ({pendingJobs.length})
                </CardTitle>
                <CardDescription>Accept or decline incoming work orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingJobs.map(job => (
                  <div key={job.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{job.title}</h4>
                          <Badge className={priorityConfig[job.priority].color}>
                            {priorityConfig[job.priority].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.propertyName} - Unit {job.unitNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(job.createdAt)}
                      </span>
                      {job.estimatedCost && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Est. ${job.estimatedCost}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleAcceptJob(job.id)} className="nexus-gradient-primary text-white">
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button variant="outline" onClick={() => handleRejectJob(job.id)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                      <Button variant="ghost" onClick={() => openJobDetail(job)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Active Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-500" />
                Active Jobs ({activeJobs.length})
              </CardTitle>
              <CardDescription>Jobs you're currently working on</CardDescription>
            </CardHeader>
            <CardContent>
              {activeJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active jobs</p>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map(job => (
                    <div key={job.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{job.title}</h4>
                            <Badge className={statusConfig[job.status].color}>
                              {statusConfig[job.status].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{job.address}</p>
                        </div>
                        <Badge className={priorityConfig[job.priority].color}>
                          {priorityConfig[job.priority].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {job.tenantName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {job.tenantPhone}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {job.status === 'accepted' && (
                          <Button onClick={() => handleUpdateStatus(job.id, 'on_the_way')} size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            On The Way
                          </Button>
                        )}
                        {job.status === 'on_the_way' && (
                          <Button onClick={() => handleUpdateStatus(job.id, 'work_started')} size="sm">
                            <Wrench className="h-4 w-4 mr-1" />
                            Start Work
                          </Button>
                        )}
                        {job.status === 'work_started' && (
                          <Button onClick={() => openStatusUpdate(job)} size="sm" className="nexus-gradient-primary text-white">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete Job
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openJobDetail(job)}>
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Completed Jobs ({completedJobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No completed jobs yet</p>
              ) : (
                <div className="space-y-4">
                  {completedJobs.map(job => (
                    <div key={job.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.propertyName} - Unit {job.unitNumber}</p>
                        </div>
                        <div className="text-right">
                          {job.actualCost && <p className="font-semibold">${job.actualCost}</p>}
                          {job.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < job.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {job.feedback && (
                        <p className="text-sm text-muted-foreground italic">"{job.feedback}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10">
                    <Star className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="text-2xl font-bold">{profile.rating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Jobs</p>
                    <p className="text-2xl font-bold">{profile.completedJobs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">On-Time Rate</p>
                    <p className="text-2xl font-bold">{profile.onTimeRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <Award className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Jobs</p>
                    <p className="text-2xl font-bold">{profile.totalJobs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>What customers are saying about your work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedJobs.filter(j => j.feedback).map(job => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.propertyName}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < (job.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm mt-2 italic">"{job.feedback}"</p>
                  </div>
                ))}
                {!completedJobs.some(j => j.feedback) && (
                  <p className="text-center text-muted-foreground py-8">No feedback yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>Manage your account and service information</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={profile.status === 'approved' ? 'bg-green-500' : profile.status === 'pending_approval' ? 'bg-yellow-500' : 'bg-red-500'}>
                    {profile.status === 'approved' ? 'Approved' : profile.status === 'pending_approval' ? 'Pending Approval' : 'Suspended'}
                  </Badge>
                  {!isEditingProfile && (
                    <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                      <Settings className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingProfile ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input 
                        value={editedProfile.name} 
                        onChange={e => setEditedProfile(prev => ({ ...prev, name: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email" 
                        value={editedProfile.email} 
                        onChange={e => setEditedProfile(prev => ({ ...prev, email: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input 
                        value={editedProfile.phone} 
                        onChange={e => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Services Offered</Label>
                    <div className="flex flex-wrap gap-2">
                      {serviceCategories.map(service => (
                        <Button
                          key={service}
                          type="button"
                          variant={editedProfile.services.includes(service) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setEditedProfile(prev => ({
                              ...prev,
                              services: prev.services.includes(service)
                                ? prev.services.filter(s => s !== service)
                                : [...prev.services, service]
                            }));
                          }}
                        >
                          {service}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="nexus-gradient-primary text-white">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => { setIsEditingProfile(false); setEditedProfile(profile); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback className="text-2xl">{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{profile.name}</h3>
                      <p className="text-muted-foreground">{profile.email}</p>
                      <p className="text-muted-foreground">{profile.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Services Offered</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.services.map(service => (
                        <Badge key={service} variant="secondary">{service}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Rate Card</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {profile.rateCard.map(rate => (
                        <div key={rate.service} className="p-3 border rounded-lg">
                          <p className="font-medium">{rate.service}</p>
                          <p className="text-lg text-primary">${rate.rate}/{rate.unit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Your uploaded certifications and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">Uploaded {formatDate(doc.uploadedAt)}</p>
                      </div>
                    </div>
                    <Badge className={
                      doc.status === 'approved' ? 'bg-green-500' : 
                      doc.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => documentRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Document
                </Button>
                <input ref={documentRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Detail Sheet */}
      <Sheet open={isJobDetailOpen} onOpenChange={setIsJobDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedJob?.title}</SheetTitle>
            <SheetDescription>Work order details</SheetDescription>
          </SheetHeader>
          {selectedJob && (
            <ScrollArea className="h-[calc(100vh-120px)] pr-4">
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-2">
                  <Badge className={statusConfig[selectedJob.status].color}>
                    {statusConfig[selectedJob.status].label}
                  </Badge>
                  <Badge className={priorityConfig[selectedJob.priority].color}>
                    {priorityConfig[selectedJob.priority].label}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedJob.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <p className="text-sm">{selectedJob.address}</p>
                  <p className="text-sm text-muted-foreground">{selectedJob.propertyName} - Unit {selectedJob.unitNumber}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tenant Contact</h4>
                  <p className="text-sm">{selectedJob.tenantName}</p>
                  <a href={`tel:${selectedJob.tenantPhone}`} className="text-sm text-primary flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {selectedJob.tenantPhone}
                  </a>
                </div>

                {selectedJob.estimatedCost && (
                  <div>
                    <h4 className="font-medium mb-2">Estimated Cost</h4>
                    <p className="text-lg font-semibold">${selectedJob.estimatedCost}</p>
                  </div>
                )}

                {selectedJob.serviceNotes && (
                  <div>
                    <h4 className="font-medium mb-2">Service Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedJob.serviceNotes}</p>
                  </div>
                )}

                {selectedJob.partsUsed.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Parts Used</h4>
                    <div className="space-y-2">
                      {selectedJob.partsUsed.map(part => (
                        <div key={part.id} className="flex justify-between text-sm">
                          <span>{part.name} x{part.quantity}</span>
                          <span>${part.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Work Order</DialogTitle>
            <DialogDescription>Add service details and complete the job</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Service Notes</Label>
              <Textarea
                placeholder="Describe the work performed..."
                value={serviceNotes}
                onChange={e => setServiceNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Parts Used</Label>
              <div className="space-y-2">
                {partsUsed.map(part => (
                  <div key={part.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{part.name} x{part.quantity}</span>
                    <div className="flex items-center gap-2">
                      <span>${part.cost}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemovePart(part.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Part name"
                    value={newPart.name}
                    onChange={e => setNewPart(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={newPart.quantity}
                    onChange={e => setNewPart(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-16"
                  />
                  <Input
                    type="number"
                    placeholder="Cost"
                    value={newPart.cost}
                    onChange={e => setNewPart(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                    className="w-20"
                  />
                  <Button variant="outline" onClick={handleAddPart}>Add</Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Total Cost</Label>
              <Input
                type="number"
                value={actualCost}
                onChange={e => setActualCost(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Before Photos</Label>
                <Button variant="outline" className="w-full" onClick={() => beforeImageRef.current?.click()}>
                  <Camera className="h-4 w-4 mr-2" />
                  Upload ({beforeImages.length})
                </Button>
                <input ref={beforeImageRef} type="file" accept="image/*" multiple className="hidden" 
                  onChange={e => setBeforeImages(Array.from(e.target.files || []))} />
              </div>
              <div className="space-y-2">
                <Label>After Photos</Label>
                <Button variant="outline" className="w-full" onClick={() => afterImageRef.current?.click()}>
                  <Camera className="h-4 w-4 mr-2" />
                  Upload ({afterImages.length})
                </Button>
                <input ref={afterImageRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => setAfterImages(Array.from(e.target.files || []))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedJob && handleUpdateStatus(selectedJob.id, 'work_completed')} className="nexus-gradient-primary text-white">
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechnicianPortal;
