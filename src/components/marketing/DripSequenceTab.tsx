import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, MessageSquare, Zap, Plus, Edit, Play, Pause, 
  ChevronRight, Clock, GitBranch, User, Tag, CheckCircle,
  ArrowRight, Search, Filter, MoreVertical, Eye, Trash2, UserPlus,
  RefreshCw, XCircle, RotateCcw, Activity, Workflow, Route,
  Megaphone, Bell, Gift, Users, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutomationEngine } from "@/hooks/useAutomationEngine";
import { marketingLeads, type Automation, type AutomationStep } from "@/data/marketing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  BlockCard, 
  FlowEditorPanel, 
  useFlowEditor 
} from "./drip-sequence";

export function DripSequenceTab() {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'blocks' | 'automations'>('blocks');
  
  // Flow Editor State
  const flowEditor = useFlowEditor();
  const [flowPanelOpen, setFlowPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Automation Engine State
  const {
    automations,
    isEngineRunning,
    stats,
    getAutomation,
    getSteps,
    getLogs,
    getLeadName,
    getOwnerName,
    getTemplateName,
    enrollLead,
    unenrollLead,
    pause,
    resume,
    activate,
    retryStep,
    refresh,
  } = useAutomationEngine();

  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

  // Keep selected automation in sync with store
  useEffect(() => {
    if (selectedAutomation) {
      const updated = getAutomation(selectedAutomation.id);
      if (updated) {
        setSelectedAutomation(updated);
      }
    }
  }, [automations, selectedAutomation, getAutomation]);

  const filteredAutomations = automations.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStepsForAutomation = (automationId: string) => {
    return getSteps(automationId);
  };

  const getLogsForAutomation = (automationId: string) => {
    return getLogs(automationId);
  };

  // Handle block click with loading state
  const handleBlockClick = (blockId: string) => {
    setIsLoading(true);
    flowEditor.selectBlock(blockId);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
      setFlowPanelOpen(true);
    }, 300);
  };

  const handlePauseResume = (automation: Automation) => {
    if (automation.status === 'Active') {
      const result = pause(automation.id);
      if (result.success) {
        toast({ title: "Automation paused", description: `${automation.name} has been paused.` });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } else if (automation.status === 'Paused') {
      const result = resume(automation.id);
      if (result.success) {
        toast({ title: "Automation resumed", description: `${automation.name} is now active.` });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } else if (automation.status === 'Draft') {
      const result = activate(automation.id);
      if (result.success) {
        toast({ title: "Automation activated", description: `${automation.name} is now active.` });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    }
  };

  const handleEnrollLead = () => {
    if (!selectedAutomation || !selectedLeadId) return;
    
    const result = enrollLead(selectedAutomation.id, selectedLeadId);
    if (result.success) {
      toast({ title: "Lead enrolled", description: `Lead has been enrolled into ${selectedAutomation.name}` });
      setEnrollDialogOpen(false);
      setSelectedLeadId("");
    } else {
      toast({ title: "Enrollment failed", description: result.error, variant: "destructive" });
    }
  };

  const handleUnenroll = (logId: string) => {
    const result = unenrollLead(logId, "Manually unenrolled by user");
    if (result.success) {
      toast({ title: "Lead unenrolled", description: "Lead has been removed from the automation" });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleRetry = async (logId: string, stepId: string) => {
    const result = await retryStep(logId, stepId);
    if (result.success) {
      toast({ title: "Step retried", description: "The step has been re-executed" });
    } else {
      toast({ title: "Retry failed", description: result.error, variant: "destructive" });
    }
  };

  const getEligibleLeads = () => {
    if (!selectedAutomation) return [];
    const enrolledLeadIds = getLogsForAutomation(selectedAutomation.id)
      .filter(l => l.status === 'Active' || l.status === 'Paused')
      .map(l => l.lead_id);
    return marketingLeads.filter(l => !enrolledLeadIds.includes(l.id) && !l.deleted_at);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'paused': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'draft': return 'bg-slate-500/10 text-slate-600 border-slate-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStepIcon = (type: string, action: string) => {
    if (type === 'Delay') return <Clock className="h-4 w-4 text-muted-foreground" />;
    if (type === 'Condition') return <GitBranch className="h-4 w-4 text-amber-500" />;
    if (action === 'Send Email') return <Mail className="h-4 w-4 text-blue-500" />;
    if (action === 'Send SMS') return <MessageSquare className="h-4 w-4 text-emerald-500" />;
    if (action === 'Assign Agent') return <User className="h-4 w-4 text-purple-500" />;
    if (action === 'Create Task') return <CheckCircle className="h-4 w-4 text-primary" />;
    return <Zap className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="space-y-4">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'blocks' | 'automations')}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="blocks" className="gap-2">
                <Workflow className="h-4 w-4" />
                Journey Blocks
              </TabsTrigger>
              <TabsTrigger value="automations" className="gap-2">
                <Zap className="h-4 w-4" />
                Automations
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {activeView === 'automations' && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
              isEngineRunning ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            )}>
              <Activity className="h-3 w-3" />
              {isEngineRunning ? "Engine Running" : "Engine Stopped"}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeView === 'automations' && (
            <>
              <Button variant="ghost" size="icon" onClick={refresh} title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button size="sm" className="gap-2 crm-gradient-primary">
                <Plus className="h-4 w-4" />
                New Automation
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Blocks View */}
      {activeView === 'blocks' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Route className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">
                      {flowEditor.blocks.find(b => b.type === 'lead-journey')?.steps.length || 0}
                    </p>
                    <p className="text-xs text-blue-600">Lead Journey Steps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-700">
                      {flowEditor.blocks.reduce((acc, b) => 
                        acc + b.steps.reduce((a, s) => a + s.customers.filter(c => c.status === 'active').length, 0), 0
                      )}
                    </p>
                    <p className="text-xs text-purple-600">Active in Journeys</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-700">
                      {flowEditor.blocks.find(b => b.type === 'reminders')?.steps.length || 0}
                    </p>
                    <p className="text-xs text-amber-600">Active Reminders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-pink-50 to-pink-100/50 border-pink-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-pink-700">
                      {flowEditor.blocks.find(b => b.type === 'wishes')?.steps.length || 0}
                    </p>
                    <p className="text-xs text-pink-600">Wishes Configured</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blocks Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Journey Blocks</h3>
                <p className="text-sm text-muted-foreground">
                  Click a block to open the flowchart editor
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {flowEditor.blocks.length} blocks configured
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {flowEditor.blocks.map((block) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  isSelected={flowEditor.selectedBlockId === block.id}
                  onClick={() => handleBlockClick(block.id)}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex-col gap-2"
                  onClick={() => handleBlockClick('block_lead_journey')}
                >
                  <Route className="h-5 w-5 text-blue-500" />
                  <span className="text-xs">Edit Lead Journey</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex-col gap-2"
                  onClick={() => handleBlockClick('block_community_message')}
                >
                  <Megaphone className="h-5 w-5 text-purple-500" />
                  <span className="text-xs">Send Broadcast</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex-col gap-2"
                  onClick={() => handleBlockClick('block_reminders')}
                >
                  <Bell className="h-5 w-5 text-amber-500" />
                  <span className="text-xs">Manage Reminders</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex-col gap-2"
                  onClick={() => handleBlockClick('block_wishes')}
                >
                  <Gift className="h-5 w-5 text-pink-500" />
                  <span className="text-xs">Configure Wishes</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: 'Lead enrolled', target: 'John Smith', journey: 'Lead Journey', time: '2 min ago', icon: UserPlus },
                  { action: 'Step completed', target: 'Emily Davis', journey: 'Lead Journey', time: '15 min ago', icon: CheckCircle },
                  { action: 'Birthday wish sent', target: 'Robert Ford', journey: 'Wishes', time: '1 hour ago', icon: Gift },
                  { action: 'Reminder triggered', target: 'Sarah Chen', journey: 'Reminders', time: '2 hours ago', icon: Bell },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <activity.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{activity.action}</span>
                      <span className="text-muted-foreground"> — {activity.target}</span>
                      <span className="text-xs text-muted-foreground ml-2">({activity.journey})</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Automations View */}
      {activeView === 'automations' && (
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-320px)]">
          {/* Left Panel - Automations List */}
          <div className="col-span-4 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search automations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-muted/50 rounded p-1.5">
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="text-sm font-semibold">{stats.activeAutomations}</p>
                  </div>
                  <div className="bg-muted/50 rounded p-1.5">
                    <p className="text-xs text-muted-foreground">Running</p>
                    <p className="text-sm font-semibold">{stats.activeEnrollments}</p>
                  </div>
                  <div className="bg-muted/50 rounded p-1.5">
                    <p className="text-xs text-muted-foreground">Done</p>
                    <p className="text-sm font-semibold">{stats.completedEnrollments}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full px-4 pb-4">
                  <div className="space-y-2">
                    {filteredAutomations.map((automation) => (
                      <div
                        key={automation.id}
                        onClick={() => setSelectedAutomation(automation)}
                        className={cn(
                          "border rounded-lg p-3 cursor-pointer transition-all",
                          selectedAutomation?.id === automation.id 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center",
                              automation.status === 'Active' ? "bg-emerald-100" : 
                              automation.status === 'Paused' ? "bg-amber-100" : "bg-muted"
                            )}>
                              <Zap className={cn(
                                "h-4 w-4",
                                automation.status === 'Active' ? "text-emerald-600" : 
                                automation.status === 'Paused' ? "text-amber-600" : "text-muted-foreground"
                              )} />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{automation.name}</h4>
                              <p className="text-xs text-muted-foreground">{automation.trigger_event}</p>
                            </div>
                          </div>
                          <Badge className={cn("text-xs", getStatusBadge(automation.status))}>
                            {automation.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{automation.enrolled_count} enrolled</span>
                          <span>{automation.completed_count} completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Automation Details */}
          <div className="col-span-8 flex flex-col gap-4">
            {selectedAutomation ? (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{selectedAutomation.name}</CardTitle>
                          <Badge className={cn("text-xs", getStatusBadge(selectedAutomation.status))}>
                            {selectedAutomation.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          Trigger: {selectedAutomation.trigger_type} — {selectedAutomation.trigger_event}
                          <span className="ml-2 text-xs">• Created by {getOwnerName(selectedAutomation.created_by_user_id)}</span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        {selectedAutomation.status === 'Active' ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handlePauseResume(selectedAutomation)}
                          >
                            <Pause className="h-4 w-4" />
                            Pause
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="gap-2 crm-gradient-primary"
                            onClick={() => handlePauseResume(selectedAutomation)}
                          >
                            <Play className="h-4 w-4" />
                            {selectedAutomation.status === 'Draft' ? 'Activate' : 'Resume'}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="text-xs text-muted-foreground">Enrolled</p>
                        <p className="text-lg font-semibold">{selectedAutomation.enrolled_count}</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="text-xs text-muted-foreground">Completed</p>
                        <p className="text-lg font-semibold">{selectedAutomation.completed_count}</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="text-xs text-muted-foreground">Open Rate</p>
                        <p className="text-lg font-semibold text-primary">{selectedAutomation.open_rate}%</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="text-xs text-muted-foreground">Click Rate</p>
                        <p className="text-lg font-semibold text-primary">{selectedAutomation.click_rate}%</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Workflow Steps */}
                <Card className="flex-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Workflow Steps</CardTitle>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Step
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Zap className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 border-2 border-primary rounded-lg p-3 bg-primary/5">
                          <p className="font-medium text-sm">Trigger: {selectedAutomation.trigger_event}</p>
                          <p className="text-xs text-muted-foreground">Type: {selectedAutomation.trigger_type}</p>
                        </div>
                      </div>

                      {getStepsForAutomation(selectedAutomation.id).map((step, index) => (
                        <div key={step.id} className="relative">
                          <div className="absolute left-5 -top-3 w-0.5 h-3 bg-border" />
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 relative",
                              step.type === 'Delay' ? "bg-slate-100" :
                              step.type === 'Condition' ? "bg-amber-100" : "bg-blue-100"
                            )}>
                              {getStepIcon(step.type, step.action)}
                              <span className="absolute -bottom-1 -right-1 bg-muted text-[10px] font-medium px-1 rounded">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1 border rounded-lg p-3 hover:border-primary/50 transition-colors">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{step.action}</p>
                                <Badge variant="outline" className="text-[10px] px-1 py-0">
                                  {step.type}
                                </Badge>
                              </div>
                              {step.type === 'Delay' && (
                                <p className="text-xs text-muted-foreground">
                                  Wait {step.delay_hours} {step.delay_hours === 1 ? 'hour' : 'hours'}
                                </p>
                              )}
                              {step.content_template_id && (
                                <p className="text-xs text-muted-foreground">
                                  Template: {getTemplateName(step.content_template_id)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center gap-3">
                        <div className="absolute left-5 -top-3 w-0.5 h-3 bg-border" />
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 border border-dashed rounded-lg p-3 bg-muted/30">
                          <p className="text-sm text-muted-foreground">End of workflow</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enrollments */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Enrollments ({getLogsForAutomation(selectedAutomation.id).length})
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => setEnrollDialogOpen(true)}
                        disabled={selectedAutomation.status !== 'Active'}
                      >
                        <UserPlus className="h-4 w-4" />
                        Enroll Lead
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {getLogsForAutomation(selectedAutomation.id).length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No leads enrolled yet
                          </p>
                        ) : (
                          getLogsForAutomation(selectedAutomation.id).map((log) => {
                            const currentStep = getSteps(selectedAutomation.id).find(s => s.id === log.current_step_id);
                            return (
                              <div key={log.id} className="flex items-center justify-between text-sm border rounded-lg p-2 group">
                                <div className="flex items-center gap-2 flex-1">
                                  <Badge variant="outline" className="text-xs">
                                    {log.status}
                                  </Badge>
                                  <div className="flex-1">
                                    <p className="font-medium">{getLeadName(log.lead_id)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Step: {currentStep?.action || 'Unknown'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {log.status === 'Active' && (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7"
                                        onClick={() => handleRetry(log.id, log.current_step_id)}
                                      >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 text-destructive"
                                        onClick={() => handleUnenroll(log.id)}
                                      >
                                        <XCircle className="h-3.5 w-3.5" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Select an Automation</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose an automation from the list to view details
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Flow Editor Side Panel */}
      <FlowEditorPanel
        open={flowPanelOpen}
        onOpenChange={setFlowPanelOpen}
        block={flowEditor.selectedBlock}
        selectedStep={flowEditor.selectedStep}
        onSelectStep={flowEditor.selectStep}
        onAddStep={(afterStepId) => {
          if (flowEditor.selectedBlockId) {
            flowEditor.addStep(flowEditor.selectedBlockId, afterStepId);
            toast({ title: "Step added", description: "New step has been added to the flow." });
          }
        }}
        onUpdateStep={(stepId, updates) => {
          if (flowEditor.selectedBlockId) {
            flowEditor.updateStep(flowEditor.selectedBlockId, stepId, updates);
          }
        }}
        onDeleteStep={(stepId) => {
          if (flowEditor.selectedBlockId) {
            flowEditor.deleteStep(flowEditor.selectedBlockId, stepId);
            toast({ title: "Step deleted", description: "Step has been removed from the flow." });
          }
        }}
        onDuplicateStep={(stepId) => {
          if (flowEditor.selectedBlockId) {
            flowEditor.duplicateStep(flowEditor.selectedBlockId, stepId);
            toast({ title: "Step duplicated", description: "Step has been duplicated." });
          }
        }}
        onToggleStepEnabled={(stepId) => {
          if (flowEditor.selectedBlockId) {
            flowEditor.toggleStepEnabled(flowEditor.selectedBlockId, stepId);
          }
        }}
        onReorderSteps={(fromIndex, toIndex) => {
          if (flowEditor.selectedBlockId) {
            flowEditor.reorderSteps(flowEditor.selectedBlockId, fromIndex, toIndex);
          }
        }}
        onAddCustomer={(stepId, customer) => {
          if (flowEditor.selectedBlockId) {
            flowEditor.addCustomerToStep(flowEditor.selectedBlockId, stepId, customer);
          }
        }}
        onRemoveCustomer={(stepId, customerId) => {
          if (flowEditor.selectedBlockId) {
            flowEditor.removeCustomerFromStep(flowEditor.selectedBlockId, stepId, customerId);
          }
        }}
        onMoveCustomer={(fromStepId, toStepId, customerId) => {
          if (flowEditor.selectedBlockId) {
            flowEditor.moveCustomerToStep(flowEditor.selectedBlockId, fromStepId, toStepId, customerId);
          }
        }}
      />

      {/* Enroll Lead Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Lead</DialogTitle>
            <DialogDescription>
              Select a lead to manually enroll into "{selectedAutomation?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lead..." />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {getEligibleLeads().map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    <div className="flex items-center gap-2">
                      <span>{lead.full_name}</span>
                      <span className="text-muted-foreground text-xs">({lead.email})</span>
                    </div>
                  </SelectItem>
                ))}
                {getEligibleLeads().length === 0 && (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No eligible leads available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEnrollLead} 
              disabled={!selectedLeadId}
              className="crm-gradient-primary"
            >
              Enroll Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
