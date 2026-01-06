import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  User,
  Building,
  DollarSign,
  Paperclip,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  Activity,
  MessageCircle,
  Lock,
  ListChecks,
} from 'lucide-react';
import { format } from 'date-fns';
import type { ExtendedWorkOrder, Vendor, WorkOrderNote, WorkOrderComment, CommentAttachment } from '@/types/maintenance';
import { ActivityLog } from './ActivityLog';
import { InternalNotes } from './InternalNotes';
import { CommentThread } from './CommentThread';

interface WorkOrderDetailPanelProps {
  workOrder: ExtendedWorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendors: Vendor[];
  onUpdateWorkOrder: (workOrder: ExtendedWorkOrder) => void;
  userRole?: 'admin' | 'vendor' | 'tenant';
}

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  emergency: 'bg-red-500',
};

const statusColors = {
  new: 'bg-blue-500',
  assigned: 'bg-purple-500',
  in_progress: 'bg-orange-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-500',
};

// Current user simulation
const CURRENT_USER = 'Sarah Jenkins';
const CURRENT_USER_ROLE = 'admin' as const;

export function WorkOrderDetailPanel({
  workOrder,
  open,
  onOpenChange,
  vendors,
  onUpdateWorkOrder,
  userRole = 'admin',
}: WorkOrderDetailPanelProps) {
  const { toast } = useToast();
  const [actualCost, setActualCost] = useState(workOrder?.actualCost?.toString() || '');
  const [activeTab, setActiveTab] = useState('overview');

  if (!workOrder) return null;

  // Initialize comments if not present
  const comments: WorkOrderComment[] = workOrder.comments || [];

  const handleStatusChange = (newStatus: ExtendedWorkOrder['status']) => {
    const oldStatus = workOrder.status;
    const updatedOrder: ExtendedWorkOrder = {
      ...workOrder,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...workOrder.timeline,
        {
          id: `evt-${Date.now()}`,
          type: 'status_changed',
          description: `Status changed from ${oldStatus.replace('_', ' ')} to ${newStatus.replace('_', ' ')}`,
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          userName: CURRENT_USER,
          userRole: CURRENT_USER_ROLE,
          metadata: {
            oldValue: oldStatus.replace('_', ' '),
            newValue: newStatus.replace('_', ' '),
          },
        },
      ],
    };
    onUpdateWorkOrder(updatedOrder);
    toast({
      title: 'Status Updated',
      description: `Work order status changed to ${newStatus.replace('_', ' ')}`,
    });
  };

  const handleAddInternalNote = (content: string) => {
    const note: WorkOrderNote = {
      id: `note-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      createdBy: CURRENT_USER,
      createdByRole: CURRENT_USER_ROLE,
      isInternal: true,
    };

    const updatedOrder: ExtendedWorkOrder = {
      ...workOrder,
      notes: [...workOrder.notes, note],
      timeline: [
        ...workOrder.timeline,
        {
          id: `evt-${Date.now()}`,
          type: 'internal_note_added',
          description: 'Internal note added',
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          userName: CURRENT_USER,
          userRole: CURRENT_USER_ROLE,
          metadata: { isTenantVisible: false },
        },
      ],
    };

    onUpdateWorkOrder(updatedOrder);
    toast({ title: 'Note Added', description: 'Internal note has been added' });
  };

  const handleEditNote = (noteId: string, content: string) => {
    const updatedNotes = workOrder.notes.map((n) =>
      n.id === noteId
        ? { ...n, content, isEdited: true, editedAt: new Date().toISOString() }
        : n
    );
    const updatedOrder: ExtendedWorkOrder = {
      ...workOrder,
      notes: updatedNotes,
    };
    onUpdateWorkOrder(updatedOrder);
    toast({ title: 'Note Updated', description: 'Note has been updated' });
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = workOrder.notes.filter((n) => n.id !== noteId);
    const updatedOrder: ExtendedWorkOrder = {
      ...workOrder,
      notes: updatedNotes,
    };
    onUpdateWorkOrder(updatedOrder);
    toast({ title: 'Note Deleted', description: 'Note has been deleted' });
  };

  const handleAddComment = (content: string, isTenantVisible: boolean, attachments?: CommentAttachment[]) => {
    const comment: WorkOrderComment = {
      id: `comment-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      createdBy: CURRENT_USER,
      createdByRole: CURRENT_USER_ROLE,
      isTenantVisible,
      attachments,
    };

    const updatedOrder = {
      ...workOrder,
      comments: [...comments, comment],
      timeline: [
        ...workOrder.timeline,
        {
          id: `evt-${Date.now()}`,
          type: 'comment_added' as const,
          description: `Comment added${isTenantVisible ? ' (visible to tenant)' : ''}`,
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          userName: CURRENT_USER,
          userRole: CURRENT_USER_ROLE,
          metadata: { isTenantVisible },
        },
      ],
    };

    onUpdateWorkOrder(updatedOrder as ExtendedWorkOrder);
    toast({ title: 'Comment Added', description: 'Your comment has been posted' });
  };

  const handleToggleCommentVisibility = (commentId: string, isTenantVisible: boolean) => {
    const updatedComments = comments.map((c) =>
      c.id === commentId ? { ...c, isTenantVisible } : c
    );
    const updatedOrder = {
      ...workOrder,
      comments: updatedComments,
    };
    onUpdateWorkOrder(updatedOrder as ExtendedWorkOrder);
    toast({
      title: 'Visibility Updated',
      description: isTenantVisible ? 'Comment is now visible to tenant' : 'Comment is now internal only',
    });
  };

  const handleUpdateCost = () => {
    const cost = parseFloat(actualCost);
    if (isNaN(cost)) return;

    const updatedOrder: ExtendedWorkOrder = {
      ...workOrder,
      actualCost: cost,
      updatedAt: new Date().toISOString(),
    };
    onUpdateWorkOrder(updatedOrder);
    toast({ title: 'Cost Updated', description: `Actual cost updated to $${cost}` });
  };

  const handleVendorChange = (vendorId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    const isReassign = !!workOrder.assignedVendorId;
    const updatedOrder: ExtendedWorkOrder = {
      ...workOrder,
      assignedVendorId: vendorId,
      assignedVendorName: vendor?.name,
      status: 'assigned',
      updatedAt: new Date().toISOString(),
      timeline: [
        ...workOrder.timeline,
        {
          id: `evt-${Date.now()}`,
          type: isReassign ? 'reassigned' : 'assigned',
          description: isReassign
            ? `Reassigned from ${workOrder.assignedVendorName} to ${vendor?.name}`
            : `Assigned to ${vendor?.name}`,
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          userName: CURRENT_USER,
          userRole: CURRENT_USER_ROLE,
          metadata: isReassign
            ? { oldValue: workOrder.assignedVendorName, newValue: vendor?.name }
            : undefined,
        },
      ],
    };
    onUpdateWorkOrder(updatedOrder);
    toast({ title: isReassign ? 'Vendor Reassigned' : 'Vendor Assigned', description: `Work order assigned to ${vendor?.name}` });
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
  };

  const getSlaStatus = () => {
    if (!workOrder.slaHours || !workOrder.createdAt) return null;
    const created = new Date(workOrder.createdAt);
    const deadline = new Date(created.getTime() + workOrder.slaHours * 60 * 60 * 1000);
    const now = new Date();
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      return { status: 'overdue', text: 'SLA Overdue', color: 'text-red-500' };
    } else if (hoursRemaining < 4) {
      return { status: 'warning', text: `${Math.ceil(hoursRemaining)}h remaining`, color: 'text-yellow-500' };
    }
    return { status: 'ok', text: `${Math.ceil(hoursRemaining)}h remaining`, color: 'text-green-500' };
  };

  const slaStatus = getSlaStatus();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{workOrder.title}</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Work Order #{workOrder.id}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={`${statusColors[workOrder.status]} text-white`}>
                {workOrder.status.replace('_', ' ')}
              </Badge>
              <Badge className={`${priorityColors[workOrder.priority]} text-white`}>
                {workOrder.priority}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <ListChecks className="h-4 w-4 mr-1 hidden sm:inline" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm">
              <FileText className="h-4 w-4 mr-1 hidden sm:inline" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="communication" className="text-xs sm:text-sm">
              <MessageCircle className="h-4 w-4 mr-1 hidden sm:inline" />
              Communication
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* SLA Alert */}
            {slaStatus && workOrder.status !== 'completed' && (
              <Card className={slaStatus.status === 'overdue' ? 'border-red-500' : ''}>
                <CardContent className="py-3 flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${slaStatus.color}`} />
                  <span className={`text-sm font-medium ${slaStatus.color}`}>
                    {slaStatus.text}
                  </span>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{workOrder.description}</p>
              </CardContent>
            </Card>

            {/* Location & Assignment */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building className="h-4 w-4" /> Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="font-medium">{workOrder.propertyName}</p>
                  <p className="text-muted-foreground">Unit {workOrder.unitId}</p>
                  <p className="text-muted-foreground">{workOrder.tenantName}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" /> Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userRole === 'admin' ? (
                    <Select
                      value={workOrder.assignedVendorId || ''}
                      onValueChange={handleVendorChange}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Assign vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium">
                      {workOrder.assignedVendorName || 'Unassigned'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Cost Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Cost Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Cost:</span>
                  <span className="font-medium">
                    ${workOrder.estimatedCost?.toFixed(2) || '0.00'}
                  </span>
                </div>
                {userRole === 'admin' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Actual Cost:</span>
                    <Input
                      type="number"
                      value={actualCost}
                      onChange={(e) => setActualCost(e.target.value)}
                      placeholder="0.00"
                      className="h-8 w-24"
                    />
                    <Button size="sm" variant="outline" onClick={handleUpdateCost}>
                      Update
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Actions */}
            {userRole === 'admin' && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {workOrder.status !== 'in_progress' && workOrder.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange('in_progress')}
                    >
                      <Clock className="h-4 w-4 mr-1" /> Start Work
                    </Button>
                  )}
                  {workOrder.status === 'in_progress' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange('completed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Complete
                    </Button>
                  )}
                  {workOrder.status !== 'cancelled' && workOrder.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusChange('cancelled')}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Dates */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(workOrder.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{formatDate(workOrder.updatedAt)}</span>
                </div>
                {workOrder.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{formatDate(workOrder.dueDate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TASKS TAB */}
          <TabsContent value="tasks" className="space-y-4 mt-4">
            {/* Attachments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload photos or documents
                    </p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*,.pdf,.doc,.docx" />
                </label>
              </CardContent>
            </Card>

            {workOrder.attachments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No attachments</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {workOrder.attachments.map((attachment) => (
                  <Card key={attachment.id} className="overflow-hidden">
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="h-32 flex items-center justify-center bg-muted">
                        <Paperclip className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <CardContent className="py-2">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(attachment.uploadedAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* COMMUNICATION & AUDIT TRAIL TAB */}
          <TabsContent value="communication" className="space-y-6 mt-4">
            {/* Sub-tabs for Activity Log, Internal Notes, Comments */}
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity" className="text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  Activity Log
                </TabsTrigger>
                <TabsTrigger value="internal" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Internal Notes
                </TabsTrigger>
                <TabsTrigger value="comments" className="text-xs">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Comments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-4">
                <ActivityLog events={workOrder.timeline} />
              </TabsContent>

              <TabsContent value="internal" className="mt-4">
                {userRole === 'admin' ? (
                  <InternalNotes
                    notes={workOrder.notes}
                    currentUser={CURRENT_USER}
                    currentUserRole={CURRENT_USER_ROLE}
                    onAddNote={handleAddInternalNote}
                    onEditNote={handleEditNote}
                    onDeleteNote={handleDeleteNote}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Internal notes are not visible to your role</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="mt-4">
                <CommentThread
                  comments={comments}
                  currentUser={CURRENT_USER}
                  currentUserRole={userRole === 'admin' ? CURRENT_USER_ROLE : userRole}
                  onAddComment={handleAddComment}
                  onToggleVisibility={userRole === 'admin' ? handleToggleCommentVisibility : undefined}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
