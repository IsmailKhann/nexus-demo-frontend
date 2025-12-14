import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, MessageSquare, Zap, Plus, Edit, Play, Pause, 
  ChevronRight, Clock, GitBranch, User, Tag, CheckCircle,
  ArrowRight, Search, Filter, MoreVertical, Eye, Trash2, UserPlus,
  RefreshCw, XCircle, RotateCcw, Activity, Workflow
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

const getStepIcon = (type: string, action: string) => {
  if (type === 'Delay') return <Clock className="h-4 w-4 text-muted-foreground" />;
  if (type === 'Condition') return <GitBranch className="h-4 w-4 text-amber-500" />;
  if (action === 'Send Email') return <Mail className="h-4 w-4 text-blue-500" />;
  if (action === 'Send SMS') return <MessageSquare className="h-4 w-4 text-emerald-500" />;
  if (action === 'Assign Agent') return <User className="h-4 w-4 text-purple-500" />;
  if (action === 'Create Task') return <CheckCircle className="h-4 w-4 text-primary" />;
  return <Zap className="h-4 w-4 text-primary" />;
};

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    case 'paused': return 'bg-amber-500/10 text-amber-600 border-amber-200';
    case 'draft': return 'bg-slate-500/10 text-slate-600 border-slate-200';
    case 'completed': return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'terminated': return 'bg-red-500/10 text-red-600 border-red-200';
    case 'failed': return 'bg-red-500/10 text-red-600 border-red-200';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getLogStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'default';
    case 'completed': return 'secondary';
    case 'paused': return 'outline';
    case 'terminated': return 'destructive';
    default: return 'outline';
  }
};

export function DripSequenceTab() {
  // Flow Editor State
  const flowEditor = useFlowEditor();
  const [flowPanelOpen, setFlowPanelOpen] = useState(false);
  const { toast } = useToast();
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

  const handlePauseResume = (automation: Automation) => {
    if (automation.status === 'Active') {
      const result = pause(automation.id);
      if (result.success) {
        toast({ title: "Automation paused", description: `${automation.name} has been paused. No new enrollments will occur.` });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } else if (automation.status === 'Paused') {
      const result = resume(automation.id);
      if (result.success) {
        toast({ title: "Automation resumed", description: `${automation.name} is now active and processing enrollments.` });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } else if (automation.status === 'Draft') {
      const result = activate(automation.id);
      if (result.success) {
        toast({ title: "Automation activated", description: `${automation.name} is now active and will process matching triggers.` });
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

  // Get eligible leads (not already enrolled in selected automation)
  const getEligibleLeads = () => {
    if (!selectedAutomation) return [];
    const enrolledLeadIds = getLogsForAutomation(selectedAutomation.id)
      .filter(l => l.status === 'Active' || l.status === 'Paused')
      .map(l => l.lead_id);
    return marketingLeads.filter(l => !enrolledLeadIds.includes(l.id) && !l.deleted_at);
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-280px)]">
      {/* Left Panel - Automations List */}
      <div className="col-span-4 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Automations</CardTitle>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                  isEngineRunning ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                )}>
                  <Activity className="h-3 w-3" />
                  {isEngineRunning ? "Running" : "Stopped"}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={refresh} title="Refresh">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button size="sm" className="gap-2 crm-gradient-primary">
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search automations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {/* Engine Stats */}
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
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>Open: {automation.open_rate}%</span>
                      <span>Click: {automation.click_rate}%</span>
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
            {/* Automation Header */}
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
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
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
                    ) : selectedAutomation.status === 'Paused' ? (
                      <Button 
                        size="sm" 
                        className="gap-2 crm-gradient-primary"
                        onClick={() => handlePauseResume(selectedAutomation)}
                      >
                        <Play className="h-4 w-4" />
                        Resume
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="gap-2 crm-gradient-primary"
                        onClick={() => handlePauseResume(selectedAutomation)}
                      >
                        <Play className="h-4 w-4" />
                        Activate
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

            {/* Workflow Builder */}
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
                  {/* Trigger */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 border-2 border-primary rounded-lg p-3 bg-primary/5">
                      <p className="font-medium text-sm">Trigger: {selectedAutomation.trigger_event}</p>
                      <p className="text-xs text-muted-foreground">Type: {selectedAutomation.trigger_type}</p>
                    </div>
                  </div>

                  {/* Steps */}
                  {getStepsForAutomation(selectedAutomation.id).map((step, index) => (
                    <div key={step.id} className="relative">
                      {/* Connector line */}
                      <div className="absolute left-5 -top-3 w-0.5 h-3 bg-border" />
                      
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 relative",
                          step.type === 'Delay' ? "bg-slate-100" :
                          step.type === 'Condition' ? "bg-amber-100" :
                          "bg-blue-100"
                        )}>
                          {getStepIcon(step.type, step.action)}
                          <span className="absolute -bottom-1 -right-1 bg-muted text-[10px] font-medium px-1 rounded">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 border rounded-lg p-3 hover:border-primary/50 transition-colors group">
                          <div className="flex items-center justify-between">
                            <div>
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
                              {step.condition_json && step.condition_json !== '{}' && (
                                <p className="text-xs text-amber-600 font-mono">
                                  {step.condition_json}
                                </p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit Step</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete Step
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* End marker */}
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

            {/* Logs Panel */}
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
                <ScrollArea className="h-40">
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
                              <Badge 
                                variant={getLogStatusBadge(log.status) as "default" | "secondary" | "outline" | "destructive"}
                                className="text-xs"
                              >
                                {log.status}
                              </Badge>
                              <div className="flex-1">
                                <p className="font-medium">{getLeadName(log.lead_id)}</p>
                                <p className="text-xs text-muted-foreground">
                                  Step: {currentStep?.action || 'Unknown'}
                                  {log.next_step_due_at && (
                                    <span className="ml-2">
                                      • Due: {new Date(log.next_step_due_at).toLocaleString()}
                                    </span>
                                  )}
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
                                    title="Retry current step"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => handleUnenroll(log.id)}
                                    title="Unenroll lead"
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
                Choose an automation from the list to view and edit its workflow
              </p>
              <Button className="gap-2 crm-gradient-primary">
                <Plus className="h-4 w-4" />
                Create New Automation
              </Button>
            </div>
          </Card>
        )}
      </div>

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
              <SelectContent>
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
