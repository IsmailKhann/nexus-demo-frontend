import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  MessageSquare,
  Paperclip,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';
import type { ExtendedWorkOrder, Vendor, WorkOrderNote } from '@/types/maintenance';

interface WorkOrderDetailPanelProps {
  workOrder: ExtendedWorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendors: Vendor[];
  onUpdateWorkOrder: (workOrder: ExtendedWorkOrder) => void;
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

export function WorkOrderDetailPanel({
  workOrder,
  open,
  onOpenChange,
  vendors,
  onUpdateWorkOrder,
}: WorkOrderDetailPanelProps) {
  const { toast } = useToast();
  const [newNote, setNewNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(true);
  const [actualCost, setActualCost] = useState(workOrder?.actualCost?.toString() || '');

  if (!workOrder) return null;

  const handleStatusChange = (newStatus: ExtendedWorkOrder['status']) => {
    const updatedOrder: ExtendedWorkOrder = {
      ...workOrder,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...workOrder.timeline,
        {
          id: `evt-${Date.now()}`,
          type: 'status_changed',
          description: `Status changed to ${newStatus.replace('_', ' ')}`,
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          userName: 'Sarah Jenkins',
        },
      ],
    };
    onUpdateWorkOrder(updatedOrder);
    toast({
      title: 'Status Updated',
      description: `Work order status changed to ${newStatus.replace('_', ' ')}`,
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: WorkOrderNote = {
      id: `note-${Date.now()}`,
      content: newNote,
      createdAt: new Date().toISOString(),
      createdBy: 'Sarah Jenkins',
      isInternal: isInternalNote,
    };

    const updatedOrder: ExtendedWorkOrder = {
      ...workOrder,
      notes: [...workOrder.notes, note],
      timeline: [
        ...workOrder.timeline,
        {
          id: `evt-${Date.now()}`,
          type: 'note_added',
          description: `${isInternalNote ? 'Internal' : 'External'} note added`,
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          userName: 'Sarah Jenkins',
        },
      ],
    };

    onUpdateWorkOrder(updatedOrder);
    setNewNote('');
    toast({ title: 'Note Added', description: 'Your note has been added to the work order' });
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
          type: 'assigned',
          description: `Assigned to ${vendor?.name}`,
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          userName: 'Sarah Jenkins',
        },
      ],
    };
    onUpdateWorkOrder(updatedOrder);
    toast({ title: 'Vendor Assigned', description: `Work order assigned to ${vendor?.name}` });
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

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
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

            {/* Location & Assignment Info */}
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
                  {workOrder.assignedVendorName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Currently: {workOrder.assignedVendorName}
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
              </CardContent>
            </Card>

            {/* Status Actions */}
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

          <TabsContent value="notes" className="space-y-4 mt-4">
            {/* Add Note */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Add Note
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={isInternalNote ? 'default' : 'outline'}
                      onClick={() => setIsInternalNote(true)}
                    >
                      Internal
                    </Button>
                    <Button
                      size="sm"
                      variant={!isInternalNote ? 'default' : 'outline'}
                      onClick={() => setIsInternalNote(false)}
                    >
                      External
                    </Button>
                  </div>
                  <Button size="sm" onClick={handleAddNote}>
                    <Send className="h-4 w-4 mr-1" /> Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes List */}
            <div className="space-y-3">
              {workOrder.notes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No notes yet</p>
              ) : (
                workOrder.notes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium">{note.createdBy}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={note.isInternal ? 'secondary' : 'outline'} className="text-xs">
                            {note.isInternal ? 'Internal' : 'External'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Upload Attachments
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

          <TabsContent value="timeline" className="mt-4">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {workOrder.timeline.map((event, index) => (
                  <div key={event.id} className="relative pl-10">
                    <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <Card>
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{event.description}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">by {event.userName}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
