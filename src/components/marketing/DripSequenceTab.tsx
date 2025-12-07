import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, MessageSquare, Zap, Plus, Edit, Play, Pause, 
  ChevronRight, Clock, GitBranch, User, Tag, CheckCircle,
  ArrowRight, Search, Filter, MoreVertical, Eye, Trash2, UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  automations, 
  automationSteps, 
  automationLogs,
  templates,
  users,
  marketingLeads,
  type Automation,
  type AutomationStep 
} from "@/data/marketing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getOwnerName = (userId: string) => {
  const user = users.find(u => u.id === userId);
  return user?.full_name || 'Unknown';
};

const getLeadName = (leadId: string) => {
  const lead = marketingLeads.find(l => l.id === leadId);
  return lead?.full_name || 'Unknown';
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

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    case 'paused': return 'bg-amber-500/10 text-amber-600 border-amber-200';
    case 'draft': return 'bg-slate-500/10 text-slate-600 border-slate-200';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getTemplateName = (templateId: string) => {
  const template = templates.find(t => t.id === templateId);
  return template?.name || templateId;
};

export function DripSequenceTab() {
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAutomations = automations.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStepsForAutomation = (automationId: string) => {
    return automationSteps
      .filter(s => s.automation_id === automationId)
      .sort((a, b) => a.step_order - b.step_order);
  };

  const getLogsForAutomation = (automationId: string) => {
    return automationLogs.filter(l => l.automation_id === automationId);
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-280px)]">
      {/* Left Panel - Automations List */}
      <div className="col-span-4 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-lg">Automations</CardTitle>
              <Button size="sm" className="gap-2 crm-gradient-primary">
                <Plus className="h-4 w-4" />
                New
              </Button>
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
                          automation.status === 'Active' ? "bg-emerald-100" : "bg-muted"
                        )}>
                          <Zap className={cn(
                            "h-4 w-4",
                            automation.status === 'Active' ? "text-emerald-600" : "text-muted-foreground"
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
                      <span>{automation.open_rate}% open rate</span>
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
                      <Button variant="outline" size="sm" className="gap-2">
                        <Pause className="h-4 w-4" />
                        Pause
                      </Button>
                    ) : (
                      <Button size="sm" className="gap-2 crm-gradient-primary">
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
                          "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                          step.type === 'Delay' ? "bg-slate-100" :
                          step.type === 'Condition' ? "bg-amber-100" :
                          "bg-blue-100"
                        )}>
                          {getStepIcon(step.type, step.action)}
                        </div>
                        <div className="flex-1 border rounded-lg p-3 hover:border-primary/50 transition-colors group">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{step.action}</p>
                              {step.type === 'Delay' && (
                                <p className="text-xs text-muted-foreground">Wait {step.delay_hours} hours</p>
                              )}
                              {step.content_template_id && (
                                <p className="text-xs text-muted-foreground">
                                  Template: {getTemplateName(step.content_template_id)}
                                </p>
                              )}
                              {step.condition_json && step.condition_json !== '{}' && (
                                <p className="text-xs text-amber-600">
                                  Condition: {step.condition_json}
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
                                <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Logs Panel */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Enroll Lead
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {getLogsForAutomation(selectedAutomation.id).slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            log.status === 'Completed' ? 'secondary' :
                            log.status === 'Active' ? 'default' :
                            'outline'
                          } className="text-xs">
                            {log.status}
                          </Badge>
                          <span>{getLeadName(log.lead_id)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Started: {new Date(log.started_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
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
    </div>
  );
}
