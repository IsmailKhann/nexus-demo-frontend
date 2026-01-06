// Extended maintenance types for manager features

export interface Vendor {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  rating: number;
  completedJobs: number;
  avgResponseTime: number; // in hours
  status: 'active' | 'inactive';
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  unitId: string;
  propertyId: string;
  propertyName: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'converted' | 'declined';
  category: string;
  createdAt: string;
  attachments?: Attachment[];
}

export interface ExtendedWorkOrder {
  id: string;
  tenantId: string;
  tenantName: string;
  unitId: string;
  propertyId: string;
  propertyName: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  category: string;
  assignedVendorId?: string;
  assignedVendorName?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  slaHours?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  estimatedCost?: number;
  actualCost?: number;
  attachments: Attachment[];
  notes: WorkOrderNote[];
  timeline: WorkOrderEvent[];
  comments?: WorkOrderComment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'other';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface WorkOrderNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  createdByRole: 'admin' | 'vendor' | 'tenant' | 'system';
  isInternal: boolean;
  isEdited?: boolean;
  editedAt?: string;
}

export interface WorkOrderComment {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  createdByRole: 'admin' | 'vendor' | 'tenant' | 'system';
  isTenantVisible: boolean;
  attachments?: CommentAttachment[];
}

export interface CommentAttachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  url: string;
}

export type ActivityEventType = 
  | 'created' 
  | 'assigned' 
  | 'reassigned'
  | 'status_changed' 
  | 'priority_changed'
  | 'sla_updated'
  | 'note_added' 
  | 'internal_note_added'
  | 'comment_added'
  | 'attachment_added' 
  | 'completed'
  | 'escalated'
  | 'reminder_sent';

export interface WorkOrderEvent {
  id: string;
  type: ActivityEventType;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'vendor' | 'tenant' | 'system';
  metadata?: {
    oldValue?: string;
    newValue?: string;
    attachmentName?: string;
    isTenantVisible?: boolean;
  };
}

export interface InternalTeam {
  id: string;
  name: string;
  category: string;
  members: string[];
  status: 'available' | 'busy';
}

export interface VendorPerformance {
  vendorId: string;
  vendorName: string;
  category: string;
  totalJobs: number;
  completedJobs: number;
  avgCompletionTime: number; // in hours
  rating: number;
  onTimeRate: number; // percentage
  costEfficiency: number; // percentage under budget
}

export interface CategoryStats {
  category: string;
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  avgResolutionTime: number;
}

export interface BuildingStats {
  propertyId: string;
  propertyName: string;
  totalRequests: number;
  openRequests: number;
  avgResponseTime: number;
}
