import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, Phone, MessageSquare, Mail, User, Calendar, MapPin, 
  Clock, Play, Pause, FileText, CheckCircle, Zap, Building
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceBadge } from "./SourceBadge";
import { 
  type MarketingLead, 
  type LeadInteraction,
  leadInteractions,
  users,
  properties,
  tasks as tasksList
} from "@/data/marketing";

interface LeadDetailSlideOverProps {
  lead: MarketingLead;
  onClose: () => void;
}

const getOwnerName = (userId: string) => {
  const user = users.find(u => u.id === userId);
  return user?.full_name || 'Unknown';
};

const getPropertyName = (propertyId: string) => {
  const prop = properties.find(p => p.id === propertyId);
  return prop?.name || 'Unknown';
};

const getChannelIcon = (channel: string) => {
  switch (channel.toLowerCase()) {
    case 'phone': return <Phone className="h-4 w-4" />;
    case 'sms': return <MessageSquare className="h-4 w-4" />;
    case 'email': return <Mail className="h-4 w-4" />;
    case 'in person': return <User className="h-4 w-4" />;
    default: return <MessageSquare className="h-4 w-4" />;
  }
};

const getDirectionColor = (direction: string) => {
  return direction === 'Inbound' ? 'border-l-emerald-500' : 'border-l-blue-500';
};

export function LeadDetailSlideOver({ lead, onClose }: LeadDetailSlideOverProps) {
  const [activeTab, setActiveTab] = useState("timeline");
  
  const leadInteractionsList = leadInteractions.filter(i => i.lead_id === lead.id);
  const leadTasks = tasks.filter(t => t.lead_id === lead.id);

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-background border-l shadow-xl z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold">{lead.full_name}</h2>
            <p className="text-sm text-muted-foreground">{lead.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge sourceId={lead.source_id} channel={lead.original_channel} />
          <Badge variant={
            lead.status === 'Leased' ? 'default' :
            lead.status === 'Lost' ? 'destructive' :
            'secondary'
          }>
            {lead.status}
          </Badge>
          <Badge variant="outline">Score: {lead.lead_score}</Badge>
          <Badge variant="outline" className={cn(
            lead.priority === 'High' ? 'border-red-200 bg-red-50 text-red-700' :
            lead.priority === 'Medium' ? 'border-amber-200 bg-amber-50 text-amber-700' :
            'border-slate-200'
          )}>
            {lead.priority} Priority
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b flex gap-2">
        <Button size="sm" className="flex-1 gap-2">
          <Phone className="h-4 w-4" />
          Call
        </Button>
        <Button size="sm" variant="outline" className="flex-1 gap-2">
          <MessageSquare className="h-4 w-4" />
          SMS
        </Button>
        <Button size="sm" variant="outline" className="flex-1 gap-2">
          <Mail className="h-4 w-4" />
          Email
        </Button>
        <Button size="sm" variant="outline" className="gap-2">
          <Zap className="h-4 w-4" />
          Enroll
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1">Tasks ({leadTasks.length})</TabsTrigger>
          <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="flex-1 m-0 p-0">
          <ScrollArea className="h-[calc(100vh-300px)] p-4">
            <div className="space-y-3">
              {leadInteractionsList.length > 0 ? (
                leadInteractionsList.map((interaction) => (
                  <div 
                    key={interaction.id}
                    className={cn(
                      "border rounded-lg p-3 border-l-4",
                      getDirectionColor(interaction.direction)
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(interaction.channel)}
                        <span className="font-medium text-sm">{interaction.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {interaction.direction}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(interaction.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    {interaction.subject && (
                      <p className="text-sm font-medium mb-1">{interaction.subject}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{interaction.message_body}</p>
                    
                    {interaction.duration_seconds > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Duration: {Math.floor(interaction.duration_seconds / 60)}m {interaction.duration_seconds % 60}s
                      </p>
                    )}

                    {/* Audio Player for Call recordings */}
                    {interaction.channel === 'Phone' && typeof interaction.attachments === 'object' && 
                      Array.isArray(interaction.attachments) && 
                      interaction.attachments.some(a => a.type === 'audio') && (
                      <div className="mt-3 p-2 bg-muted/50 rounded flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Play className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 h-1 bg-muted rounded">
                          <div className="h-1 w-1/3 bg-primary rounded" />
                        </div>
                        <span className="text-xs text-muted-foreground">0:00 / 2:00</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      By: {getOwnerName(interaction.created_by_user_id)} • {interaction.created_by_source}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No interactions yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tasks" className="flex-1 m-0 p-0">
          <ScrollArea className="h-[calc(100vh-300px)] p-4">
            <div className="space-y-3">
              {leadTasks.length > 0 ? (
                leadTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <CheckCircle className={cn(
                          "h-5 w-5 mt-0.5",
                          task.status === 'Completed' ? "text-emerald-500" : "text-muted-foreground"
                        )} />
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                      <Badge variant={
                        task.priority === 'High' ? 'destructive' :
                        task.priority === 'Medium' ? 'secondary' :
                        'outline'
                      }>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(task.due_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {getOwnerName(task.assigned_to_user_id)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No tasks yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="profile" className="flex-1 m-0 p-0">
          <ScrollArea className="h-[calc(100vh-300px)] p-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.country_code}{lead.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Preferred: {lead.preferred_contact_time} • {lead.preferred_contact_channel}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Property Interest</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{getPropertyName(lead.property_id)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.beds} bed, {lead.baths} bath • ${lead.min_rent}-${lead.max_rent}/mo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Move-in: {lead.desired_move_in_date}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Assignment</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Owner:</span> {getOwnerName(lead.lead_owner_id)}</p>
                  <p><span className="text-muted-foreground">Created:</span> {new Date(lead.created_at).toLocaleDateString()}</p>
                  <p><span className="text-muted-foreground">Last Contact:</span> {new Date(lead.last_contacted_at).toLocaleDateString()}</p>
                </div>
              </div>

              {lead.notes && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{lead.notes}</p>
                </div>
              )}

              {lead.utm_source && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Attribution</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Source:</span> {lead.utm_source}</p>
                    <p><span className="text-muted-foreground">Medium:</span> {lead.utm_medium}</p>
                    {lead.utm_campaign && <p><span className="text-muted-foreground">Campaign:</span> {lead.utm_campaign}</p>}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
