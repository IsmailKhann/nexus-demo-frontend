// Mock API service layer with simulated network delays and error rates

import type {
  Property,
  Lead,
  WorkOrder,
  User,
  KPIMetric,
} from '@/types';

import propertiesData from '@/data/properties.json';
import leadsData from '@/data/leads.json';
import workOrdersData from '@/data/workOrders.json';

// Simulate network delay
const delay = (ms: number = Math.random() * 300 + 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Simulate random errors (10% chance)
const shouldError = () => Math.random() < 0.1;

// Mock current user (stored in localStorage for demo)
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('nexus_current_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('nexus_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('nexus_current_user');
  }
};

// Mock login
export const mockLogin = async (
  email: string,
  password: string,
  role: string
): Promise<User> => {
  await delay();

  if (shouldError()) {
    throw new Error('Login failed. Please try again.');
  }

  const user: User = {
    id: `user-${Date.now()}`,
    name: email.split('@')[0].replace(/\./g, ' '),
    email,
    role: role as User['role'],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    // Add tenant-specific data for tenant role
    ...(role === 'tenant' ? {
      unitId: 'u101',
      propertyId: 'p1',
    } : {}),
  };

  setCurrentUser(user);
  return user;
};

// Mock logout
export const mockLogout = async (): Promise<void> => {
  await delay(100);
  setCurrentUser(null);
};

// Properties API
export const fetchProperties = async (): Promise<Property[]> => {
  await delay();
  return propertiesData as Property[];
};

export const fetchPropertyById = async (id: string): Promise<Property | null> => {
  await delay();
  const property = (propertiesData as Property[]).find((p) => p.id === id);
  return property || null;
};

// Leads API
export const fetchLeads = async (): Promise<Lead[]> => {
  await delay();
  return leadsData as Lead[];
};

export const fetchLeadById = async (id: string): Promise<Lead | null> => {
  await delay();
  const lead = (leadsData as Lead[]).find((l) => l.id === id);
  return lead || null;
};

export const updateLeadStatus = async (
  id: string,
  status: Lead['status']
): Promise<Lead> => {
  await delay();
  
  if (shouldError()) {
    throw new Error('Failed to update lead status');
  }

  const lead = (leadsData as Lead[]).find((l) => l.id === id);
  if (!lead) throw new Error('Lead not found');

  // In real app, this would persist. For demo, we just return updated lead
  return { ...lead, status };
};

// Work Orders API
export const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
  await delay();
  return workOrdersData as WorkOrder[];
};

export const fetchWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  await delay();
  const wo = (workOrdersData as WorkOrder[]).find((w) => w.id === id);
  return wo || null;
};

export const updateWorkOrderStatus = async (
  id: string,
  status: WorkOrder['status']
): Promise<WorkOrder> => {
  await delay();
  
  if (shouldError()) {
    throw new Error('Failed to update work order status');
  }

  const wo = (workOrdersData as WorkOrder[]).find((w) => w.id === id);
  if (!wo) throw new Error('Work order not found');

  return { ...wo, status, updatedAt: new Date().toISOString() };
};

// Dashboard KPIs API
export const fetchDashboardKPIs = async (): Promise<KPIMetric[]> => {
  await delay();

  const leads = leadsData as Lead[];
  const properties = propertiesData as Property[];
  const workOrders = workOrdersData as WorkOrder[];

  const totalLeads = leads.length;
  const toursScheduled = leads.filter((l) => l.status === 'tour_scheduled').length;
  const applications = leads.filter((l) => l.status === 'applied').length;
  const avgOccupancy =
    properties.reduce((sum, p) => sum + p.occupancyRate, 0) / properties.length;

  const completedWO = workOrders.filter((w) => w.status === 'completed').length;
  const totalWO = workOrders.length;
  const avgTurnaround = 2.3; // Mock value in days

  return [
    {
      label: 'Total Leads',
      value: totalLeads,
      change: 12,
      trend: 'up',
    },
    {
      label: 'Tours Scheduled',
      value: toursScheduled,
      change: 8,
      trend: 'up',
    },
    {
      label: 'Applications',
      value: applications,
      change: -3,
      trend: 'down',
    },
    {
      label: 'Avg Occupancy',
      value: `${avgOccupancy.toFixed(1)}%`,
      change: 2.5,
      trend: 'up',
    },
    {
      label: 'Work Orders',
      value: `${completedWO}/${totalWO}`,
      change: 15,
      trend: 'up',
    },
    {
      label: 'Avg Turnaround',
      value: `${avgTurnaround} days`,
      change: -10,
      trend: 'up',
    },
  ];
};

// Chart data API
export const fetchLeadsFunnel = async () => {
  await delay();
  return {
    labels: ['New', 'Contacted', 'Tour', 'Applied', 'Leased'],
    values: [45, 38, 28, 15, 12],
  };
};

export const fetchOccupancyData = async () => {
  await delay();
  const properties = propertiesData as Property[];
  return properties.map((p) => ({
    name: p.name,
    occupancy: p.occupancyRate,
  }));
};
