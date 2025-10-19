// Core type definitions for Nexus

export type UserRole = 'admin' | 'property_manager' | 'leasing_agent' | 'maintenance_tech' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  units: number;
  occupancyRate: number;
  managerId: string;
  images: string[];
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  beds: number;
  baths: number;
  sqft: number;
  rent: number;
  status: 'vacant' | 'occupied' | 'maintenance' | 'pending';
  images: string[];
  features: string[];
}

export type LeadStatus = 'new' | 'contacted' | 'tour_scheduled' | 'applied' | 'leased' | 'lost';
export type LeadSource = 'website' | 'ils' | 'sms' | 'phone' | 'email' | 'referral' | 'walk_in';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  language: string;
  createdAt: string;
  propertyIds: string[];
  status: LeadStatus;
  assignedAgentId?: string;
  leadScore: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  type: 'call' | 'sms' | 'email' | 'note' | 'view' | 'tour' | 'application';
  timestamp: string;
  content: string;
  agentId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  leaseStart: string;
  leaseEnd: string;
  unitId: string;
  rent: number;
  renewalProbability?: number;
  paymentHistory: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'late';
  method: string;
}

export type WorkOrderStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'emergency';

export interface WorkOrder {
  id: string;
  tenantId: string;
  unitId: string;
  propertyId: string;
  title: string;
  description: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedVendorId?: string;
  createdAt: string;
  updatedAt: string;
  estimatedCost?: number;
  actualCost?: number;
  images: string[];
  category: string;
}

export interface Invoice {
  id: string;
  vendorId: string;
  amount: number;
  dueDate: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  items: InvoiceItem[];
  parsedFields?: {
    vendorName: string;
    invoiceNumber: string;
    confidence: number;
  };
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  rating: number;
  calendarSlots: CalendarSlot[];
}

export interface CalendarSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'drip';
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: string;
  audienceSize: number;
  sent: number;
  opened: number;
  clicked: number;
}

export interface AIAnalytics {
  leadScores: Record<string, number>;
  renewalProbabilities: Record<string, number>;
  callAnalytics: CallAnalytic[];
  predictedMaintenanceDates: PredictedMaintenance[];
}

export interface CallAnalytic {
  id: string;
  leadId: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  intent: string;
  highlights: string[];
  coachingPrompts: string[];
}

export interface PredictedMaintenance {
  unitId: string;
  assetType: string;
  predictedDate: string;
  confidence: number;
  rationale: string;
}

export interface KPIMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}
