import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import {
  Activity,
  UserCheck,
  ArrowRightLeft,
  Clock,
  AlertTriangle,
  Timer,
  MessageSquare,
  FileText,
  Paperclip,
  CheckCircle,
  Bell,
  TrendingUp,
  Lock,
} from 'lucide-react';
import type { WorkOrderEvent, ActivityEventType } from '@/types/maintenance';

interface ActivityLogProps {
  events: WorkOrderEvent[];
}

const eventConfig: Record<ActivityEventType, { icon: React.ElementType; color: string; label: string }> = {
  created: { icon: Activity, color: 'text-blue-500', label: 'Created' },
  assigned: { icon: UserCheck, color: 'text-purple-500', label: 'Assigned' },
  reassigned: { icon: ArrowRightLeft, color: 'text-indigo-500', label: 'Reassigned' },
  status_changed: { icon: Clock, color: 'text-orange-500', label: 'Status Changed' },
  priority_changed: { icon: AlertTriangle, color: 'text-yellow-500', label: 'Priority Changed' },
  sla_updated: { icon: Timer, color: 'text-cyan-500', label: 'SLA Updated' },
  note_added: { icon: MessageSquare, color: 'text-green-500', label: 'Note Added' },
  internal_note_added: { icon: Lock, color: 'text-gray-500', label: 'Internal Note' },
  comment_added: { icon: FileText, color: 'text-teal-500', label: 'Comment Added' },
  attachment_added: { icon: Paperclip, color: 'text-pink-500', label: 'Attachment Added' },
  completed: { icon: CheckCircle, color: 'text-green-600', label: 'Completed' },
  escalated: { icon: TrendingUp, color: 'text-red-500', label: 'Escalated' },
  reminder_sent: { icon: Bell, color: 'text-amber-500', label: 'Reminder Sent' },
};

const roleColors: Record<string, string> = {
  admin: 'bg-primary text-primary-foreground',
  vendor: 'bg-orange-500 text-white',
  tenant: 'bg-blue-500 text-white',
  system: 'bg-gray-500 text-white',
};

export function ActivityLog({ events }: ActivityLogProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Activity Log
        </h3>
        <Badge variant="secondary" className="text-xs">
          {events.length} events
        </Badge>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-3">
            {sortedEvents.map((event) => {
              const config = eventConfig[event.type];
              const Icon = config.icon;

              return (
                <div key={event.id} className="relative pl-10">
                  <div
                    className={`absolute left-2 w-5 h-5 rounded-full bg-background border-2 flex items-center justify-center ${config.color}`}
                    style={{ borderColor: 'currentColor' }}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                  <Card className="bg-muted/30">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{event.description}</p>
                          {event.metadata?.oldValue && event.metadata?.newValue && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="line-through">{event.metadata.oldValue}</span>
                              <span className="mx-2">→</span>
                              <span className="font-medium">{event.metadata.newValue}</span>
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs flex-shrink-0 ${roleColors[event.userRole]}`}
                        >
                          {event.userRole}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>by {event.userName}</span>
                        <span>{formatTimestamp(event.timestamp)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
