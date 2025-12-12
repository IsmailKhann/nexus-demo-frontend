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
  isInternal: boolean;
}

export interface WorkOrderEvent {
  id: string;
  type: 'created' | 'assigned' | 'status_changed' | 'note_added' | 'attachment_added' | 'completed';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
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
