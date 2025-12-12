import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Vendor, ExtendedWorkOrder, InternalTeam } from '@/types/maintenance';

interface CreateWorkOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendors: Vendor[];
  teams: InternalTeam[];
  onCreateWorkOrder: (workOrder: Partial<ExtendedWorkOrder>) => void;
  requestToConvert?: {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    tenantId: string;
    tenantName: string;
    unitId: string;
    propertyId: string;
    propertyName: string;
  };
}

const categories = [
  'Plumbing',
  'HVAC',
  'Electrical',
  'Appliance',
  'General Maintenance',
  'Flooring',
  'Roofing',
  'Landscaping',
  'Pest Control',
  'Other',
];

const slaOptions = [
  { value: '4', label: '4 hours (Emergency)' },
  { value: '24', label: '24 hours (High Priority)' },
  { value: '48', label: '48 hours (Medium Priority)' },
  { value: '72', label: '72 hours (Low Priority)' },
  { value: '168', label: '1 week' },
];

export function CreateWorkOrderModal({
  open,
  onOpenChange,
  vendors,
  teams,
  onCreateWorkOrder,
  requestToConvert,
}: CreateWorkOrderModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(requestToConvert?.title || '');
  const [description, setDescription] = useState(requestToConvert?.description || '');
  const [category, setCategory] = useState(requestToConvert?.category || '');
  const [priority, setPriority] = useState<string>(requestToConvert?.priority || 'medium');
  const [assignmentType, setAssignmentType] = useState<'vendor' | 'team'>('vendor');
  const [assignedVendorId, setAssignedVendorId] = useState('');
  const [assignedTeamId, setAssignedTeamId] = useState('');
  const [slaHours, setSlaHours] = useState('48');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const filteredVendors = category
    ? vendors.filter((v) => v.category === category || category === 'Other')
    : vendors;

  const filteredTeams = category
    ? teams.filter((t) => t.category === category || category === 'Other')
    : teams;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title || !description || !category || !priority) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const selectedVendor = vendors.find((v) => v.id === assignedVendorId);
    const selectedTeam = teams.find((t) => t.id === assignedTeamId);

    const workOrder: Partial<ExtendedWorkOrder> = {
      id: `wo-${Date.now()}`,
      title,
      description,
      category,
      priority: priority as ExtendedWorkOrder['priority'],
      status: assignedVendorId || assignedTeamId ? 'assigned' : 'new',
      tenantId: requestToConvert?.tenantId || '',
      tenantName: requestToConvert?.tenantName || 'N/A',
      unitId: requestToConvert?.unitId || '',
      propertyId: requestToConvert?.propertyId || '',
      propertyName: requestToConvert?.propertyName || '',
      assignedVendorId: assignmentType === 'vendor' ? assignedVendorId : undefined,
      assignedVendorName: assignmentType === 'vendor' ? selectedVendor?.name : undefined,
      assignedTeamId: assignmentType === 'team' ? assignedTeamId : undefined,
      assignedTeamName: assignmentType === 'team' ? selectedTeam?.name : undefined,
      slaHours: parseInt(slaHours),
      dueDate: dueDate?.toISOString(),
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      notes: [],
      timeline: [
        {
          id: `evt-${Date.now()}`,
          type: 'created',
          description: 'Work order created',
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          userName: 'Sarah Jenkins',
        },
      ],
    };

    onCreateWorkOrder(workOrder);
    toast({
      title: 'Work Order Created',
      description: `Work order "${title}" has been created successfully`,
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setPriority('medium');
    setAssignedVendorId('');
    setAssignedTeamId('');
    setSlaHours('48');
    setDueDate(undefined);
    setEstimatedCost('');
    setAttachments([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {requestToConvert ? 'Convert Request to Work Order' : 'Create New Work Order'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new work order
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the work required"
              rows={3}
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Priority *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment Type */}
          <div className="grid gap-2">
            <Label>Assign To</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={assignmentType === 'vendor' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAssignmentType('vendor')}
                className={assignmentType === 'vendor' ? 'bg-primary' : ''}
              >
                External Vendor
              </Button>
              <Button
                type="button"
                variant={assignmentType === 'team' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAssignmentType('team')}
                className={assignmentType === 'team' ? 'bg-primary' : ''}
              >
                Internal Team
              </Button>
            </div>
          </div>

          {/* Vendor/Team Selection */}
          <div className="grid gap-2">
            <Label>
              {assignmentType === 'vendor' ? 'Select Vendor' : 'Select Team'}
            </Label>
            {assignmentType === 'vendor' ? (
              <Select value={assignedVendorId} onValueChange={setAssignedVendorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {filteredVendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{vendor.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ★ {vendor.rating}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={assignedTeamId} onValueChange={setAssignedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* SLA and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>SLA</Label>
              <Select value={slaHours} onValueChange={setSlaHours}>
                <SelectTrigger>
                  <SelectValue placeholder="Select SLA" />
                </SelectTrigger>
                <SelectContent>
                  {slaOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Estimated Cost */}
          <div className="grid gap-2">
            <Label htmlFor="cost">Estimated Cost ($)</Label>
            <Input
              id="cost"
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Attachments */}
          <div className="grid gap-2">
            <Label>Attachments</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm"
                >
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload photos or documents
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary">
            Create Work Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
