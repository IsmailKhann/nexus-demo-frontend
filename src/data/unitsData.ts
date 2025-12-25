// Units Mock Data for Property Management

export type UnitStatus = 'occupied' | 'vacant' | 'notice' | 'maintenance' | 'reserved';
export type UnitType = 'studio' | '1br' | '2br' | '3br' | 'penthouse' | 'townhouse' | 'loft';

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  unit_type: UnitType;
  status: UnitStatus;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  market_rent: number;
  current_rent: number | null;
  deposit: number;
  available_date: string | null;
  current_tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    lease_start: string;
    lease_end: string;
  } | null;
  features: string[];
  floor: number;
  notes: string;
}

export interface PropertyNote {
  id: string;
  property_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  unit_id: string | null;
  title: string;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
}

export interface OwnershipEntity {
  id: string;
  name: string;
  type: 'LLC' | 'Individual' | 'Corporation' | 'Partnership' | 'Trust';
  contact_name: string;
  contact_email: string;
  contact_phone: string;
}

// Mock Units Data
export const mockUnits: Unit[] = [
  // Sunset Towers (PROP_001)
  {
    id: "UNIT_001",
    property_id: "PROP_001",
    unit_number: "101",
    unit_type: "1br",
    status: "occupied",
    bedrooms: 1,
    bathrooms: 1,
    size_sqft: 750,
    market_rent: 2800,
    current_rent: 2650,
    deposit: 2800,
    available_date: null,
    current_tenant: {
      id: "TEN_001",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "(555) 123-4567",
      lease_start: "2024-01-15",
      lease_end: "2025-01-14"
    },
    features: ["Balcony", "City View", "Updated Kitchen"],
    floor: 1,
    notes: ""
  },
  {
    id: "UNIT_002",
    property_id: "PROP_001",
    unit_number: "102",
    unit_type: "2br",
    status: "occupied",
    bedrooms: 2,
    bathrooms: 2,
    size_sqft: 1100,
    market_rent: 3500,
    current_rent: 3400,
    deposit: 3500,
    available_date: null,
    current_tenant: {
      id: "TEN_002",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "(555) 234-5678",
      lease_start: "2023-06-01",
      lease_end: "2025-05-31"
    },
    features: ["Corner Unit", "Ocean View", "Walk-in Closet"],
    floor: 1,
    notes: ""
  },
  {
    id: "UNIT_003",
    property_id: "PROP_001",
    unit_number: "201",
    unit_type: "studio",
    status: "vacant",
    bedrooms: 0,
    bathrooms: 1,
    size_sqft: 550,
    market_rent: 2200,
    current_rent: null,
    deposit: 2200,
    available_date: "2024-12-01",
    current_tenant: null,
    features: ["Murphy Bed", "Modern Finishes"],
    floor: 2,
    notes: "Recently renovated"
  },
  {
    id: "UNIT_004",
    property_id: "PROP_001",
    unit_number: "202",
    unit_type: "1br",
    status: "notice",
    bedrooms: 1,
    bathrooms: 1,
    size_sqft: 800,
    market_rent: 2900,
    current_rent: 2750,
    deposit: 2900,
    available_date: "2025-02-01",
    current_tenant: {
      id: "TEN_003",
      name: "Mike Chen",
      email: "mike.chen@email.com",
      phone: "(555) 345-6789",
      lease_start: "2024-02-01",
      lease_end: "2025-01-31"
    },
    features: ["Hardwood Floors", "In-unit Laundry"],
    floor: 2,
    notes: "Tenant gave 30-day notice"
  },
  {
    id: "UNIT_005",
    property_id: "PROP_001",
    unit_number: "301",
    unit_type: "penthouse",
    status: "occupied",
    bedrooms: 3,
    bathrooms: 2.5,
    size_sqft: 2200,
    market_rent: 6500,
    current_rent: 6000,
    deposit: 12000,
    available_date: null,
    current_tenant: {
      id: "TEN_004",
      name: "Emily Davis",
      email: "emily.d@email.com",
      phone: "(555) 456-7890",
      lease_start: "2023-01-01",
      lease_end: "2025-12-31"
    },
    features: ["Private Terrace", "360° Views", "Smart Home"],
    floor: 30,
    notes: "VIP tenant - priority service"
  },
  {
    id: "UNIT_006",
    property_id: "PROP_001",
    unit_number: "203",
    unit_type: "2br",
    status: "maintenance",
    bedrooms: 2,
    bathrooms: 2,
    size_sqft: 1050,
    market_rent: 3400,
    current_rent: null,
    deposit: 3400,
    available_date: "2025-01-15",
    current_tenant: null,
    features: ["Updated Appliances", "Pool View"],
    floor: 2,
    notes: "Undergoing full renovation"
  },
  // Downtown Lofts (PROP_002)
  {
    id: "UNIT_007",
    property_id: "PROP_002",
    unit_number: "A1",
    unit_type: "loft",
    status: "occupied",
    bedrooms: 1,
    bathrooms: 1,
    size_sqft: 900,
    market_rent: 2300,
    current_rent: 2200,
    deposit: 2300,
    available_date: null,
    current_tenant: {
      id: "TEN_005",
      name: "Alex Rivera",
      email: "alex.r@email.com",
      phone: "(555) 567-8901",
      lease_start: "2024-03-01",
      lease_end: "2025-02-28"
    },
    features: ["Exposed Brick", "High Ceilings", "Industrial Design"],
    floor: 1,
    notes: ""
  },
  {
    id: "UNIT_008",
    property_id: "PROP_002",
    unit_number: "A2",
    unit_type: "loft",
    status: "vacant",
    bedrooms: 2,
    bathrooms: 1,
    size_sqft: 1200,
    market_rent: 2800,
    current_rent: null,
    deposit: 2800,
    available_date: "2024-11-15",
    current_tenant: null,
    features: ["Original Hardwood", "Large Windows", "Open Floor Plan"],
    floor: 1,
    notes: "Premium corner unit"
  },
  {
    id: "UNIT_009",
    property_id: "PROP_002",
    unit_number: "B1",
    unit_type: "loft",
    status: "reserved",
    bedrooms: 1,
    bathrooms: 1,
    size_sqft: 850,
    market_rent: 2100,
    current_rent: null,
    deposit: 2100,
    available_date: "2025-01-01",
    current_tenant: null,
    features: ["Skylight", "Built-in Storage"],
    floor: 2,
    notes: "Reserved by applicant - pending approval"
  },
  // Riverside Garden (PROP_003)
  {
    id: "UNIT_010",
    property_id: "PROP_003",
    unit_number: "1A",
    unit_type: "2br",
    status: "occupied",
    bedrooms: 2,
    bathrooms: 1,
    size_sqft: 950,
    market_rent: 1600,
    current_rent: 1550,
    deposit: 1600,
    available_date: null,
    current_tenant: {
      id: "TEN_006",
      name: "Lisa Park",
      email: "lisa.p@email.com",
      phone: "(555) 678-9012",
      lease_start: "2024-05-01",
      lease_end: "2025-04-30"
    },
    features: ["Garden View", "Patio", "Pet Friendly"],
    floor: 1,
    notes: ""
  },
  {
    id: "UNIT_011",
    property_id: "PROP_003",
    unit_number: "1B",
    unit_type: "1br",
    status: "vacant",
    bedrooms: 1,
    bathrooms: 1,
    size_sqft: 700,
    market_rent: 1400,
    current_rent: null,
    deposit: 1400,
    available_date: "2024-12-15",
    current_tenant: null,
    features: ["River View", "Updated Bathroom"],
    floor: 1,
    notes: ""
  },
  // Oceanview Estates (PROP_005)
  {
    id: "UNIT_012",
    property_id: "PROP_005",
    unit_number: "PH1",
    unit_type: "penthouse",
    status: "occupied",
    bedrooms: 4,
    bathrooms: 4,
    size_sqft: 4500,
    market_rent: 25000,
    current_rent: 22000,
    deposit: 50000,
    available_date: null,
    current_tenant: {
      id: "TEN_007",
      name: "Robert Williams",
      email: "r.williams@email.com",
      phone: "(555) 789-0123",
      lease_start: "2023-01-01",
      lease_end: "2026-12-31"
    },
    features: ["Private Pool", "Wine Cellar", "Butler Service", "Ocean View"],
    floor: 45,
    notes: "Ultra luxury - white glove service required"
  },
  {
    id: "UNIT_013",
    property_id: "PROP_005",
    unit_number: "501",
    unit_type: "3br",
    status: "occupied",
    bedrooms: 3,
    bathrooms: 3,
    size_sqft: 2800,
    market_rent: 15000,
    current_rent: 14500,
    deposit: 30000,
    available_date: null,
    current_tenant: {
      id: "TEN_008",
      name: "Jennifer Lee",
      email: "j.lee@email.com",
      phone: "(555) 890-1234",
      lease_start: "2024-06-01",
      lease_end: "2025-05-31"
    },
    features: ["Beach Access", "Concierge", "Valet"],
    floor: 5,
    notes: ""
  }
];

// Mock Property Notes
export const mockPropertyNotes: PropertyNote[] = [
  {
    id: "NOTE_001",
    property_id: "PROP_001",
    note: "Annual fire inspection scheduled for January 2025. Ensure all units have updated smoke detectors.",
    created_by: "Admin User",
    created_at: "2024-11-15T10:30:00Z"
  },
  {
    id: "NOTE_002",
    property_id: "PROP_001",
    note: "Pool maintenance contract renewed through 2025. New vendor: AquaCare Services.",
    created_by: "Property Manager",
    created_at: "2024-10-20T14:15:00Z"
  },
  {
    id: "NOTE_003",
    property_id: "PROP_002",
    note: "Historic building designation requires approval for any exterior modifications.",
    created_by: "Admin User",
    created_at: "2024-09-01T09:00:00Z"
  },
  {
    id: "NOTE_004",
    property_id: "PROP_003",
    note: "River flooding risk during spring. Ensure flood insurance is current.",
    created_by: "Property Manager",
    created_at: "2024-08-15T11:45:00Z"
  },
  {
    id: "NOTE_005",
    property_id: "PROP_005",
    note: "VIP tenants - all maintenance requests require manager approval before dispatch.",
    created_by: "Admin User",
    created_at: "2024-07-01T08:00:00Z"
  }
];

// Mock Maintenance Requests
export const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: "MR_001",
    property_id: "PROP_001",
    unit_id: "UNIT_001",
    title: "Leaking faucet in bathroom",
    status: "open",
    priority: "medium",
    created_at: "2024-12-20T09:00:00Z"
  },
  {
    id: "MR_002",
    property_id: "PROP_001",
    unit_id: "UNIT_002",
    title: "HVAC not cooling properly",
    status: "in_progress",
    priority: "high",
    created_at: "2024-12-18T14:30:00Z"
  },
  {
    id: "MR_003",
    property_id: "PROP_001",
    unit_id: null,
    title: "Parking garage lighting replacement",
    status: "completed",
    priority: "low",
    created_at: "2024-12-10T11:00:00Z"
  },
  {
    id: "MR_004",
    property_id: "PROP_002",
    unit_id: "UNIT_007",
    title: "Window seal broken",
    status: "open",
    priority: "medium",
    created_at: "2024-12-19T16:00:00Z"
  },
  {
    id: "MR_005",
    property_id: "PROP_003",
    unit_id: "UNIT_010",
    title: "Dishwasher not draining",
    status: "in_progress",
    priority: "medium",
    created_at: "2024-12-15T10:00:00Z"
  },
  {
    id: "MR_006",
    property_id: "PROP_005",
    unit_id: "UNIT_012",
    title: "Pool heater maintenance",
    status: "open",
    priority: "high",
    created_at: "2024-12-21T08:00:00Z"
  }
];

// Mock Ownership Entities
export const mockOwnershipEntities: OwnershipEntity[] = [
  {
    id: "OWNER_001",
    name: "Sunset Properties LLC",
    type: "LLC",
    contact_name: "James Morrison",
    contact_email: "james@sunsetproperties.com",
    contact_phone: "(555) 111-2222"
  },
  {
    id: "OWNER_002",
    name: "Urban Living Partners",
    type: "Partnership",
    contact_name: "Amanda Clarke",
    contact_email: "amanda@urbanliving.com",
    contact_phone: "(555) 222-3333"
  },
  {
    id: "OWNER_003",
    name: "Green Investments Trust",
    type: "Trust",
    contact_name: "Michael Green",
    contact_email: "m.green@greentrust.com",
    contact_phone: "(555) 333-4444"
  },
  {
    id: "OWNER_004",
    name: "Oceanside Development Corp",
    type: "Corporation",
    contact_name: "Victoria Sterling",
    contact_email: "v.sterling@oceanside.com",
    contact_phone: "(555) 444-5555"
  }
];

// Property to Owner mapping
export const propertyOwnerMap: Record<string, string> = {
  "PROP_001": "OWNER_001",
  "PROP_002": "OWNER_002",
  "PROP_003": "OWNER_003",
  "PROP_005": "OWNER_004"
};

// Helper functions
export const getUnitsForProperty = (propertyId: string): Unit[] => {
  return mockUnits.filter(u => u.property_id === propertyId);
};

export const getNotesForProperty = (propertyId: string): PropertyNote[] => {
  return mockPropertyNotes.filter(n => n.property_id === propertyId);
};

export const getMaintenanceForProperty = (propertyId: string): MaintenanceRequest[] => {
  return mockMaintenanceRequests.filter(m => m.property_id === propertyId);
};

export const getOwnerForProperty = (propertyId: string): OwnershipEntity | undefined => {
  const ownerId = propertyOwnerMap[propertyId];
  return mockOwnershipEntities.find(o => o.id === ownerId);
};

export const getUnitStatusColor = (status: UnitStatus): string => {
  const colors: Record<UnitStatus, string> = {
    occupied: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    vacant: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    notice: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    maintenance: 'bg-red-500/20 text-red-400 border-red-500/30',
    reserved: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };
  return colors[status];
};

export const getUnitTypeLabel = (type: UnitType): string => {
  const labels: Record<UnitType, string> = {
    studio: 'Studio',
    '1br': '1 Bedroom',
    '2br': '2 Bedroom',
    '3br': '3 Bedroom',
    penthouse: 'Penthouse',
    townhouse: 'Townhouse',
    loft: 'Loft'
  };
  return labels[type];
};

// Financial snapshot data
export interface PropertyFinancials {
  property_id: string;
  accounts_receivable: number;
  deposits_held: number;
  outstanding_dues: number;
  monthly_rent_collected: number;
  monthly_rent_expected: number;
}

export const mockPropertyFinancials: PropertyFinancials[] = [
  {
    property_id: "PROP_001",
    accounts_receivable: 15200,
    deposits_held: 98500,
    outstanding_dues: 4800,
    monthly_rent_collected: 352000,
    monthly_rent_expected: 384000
  },
  {
    property_id: "PROP_002",
    accounts_receivable: 8400,
    deposits_held: 42000,
    outstanding_dues: 2100,
    monthly_rent_collected: 147000,
    monthly_rent_expected: 168000
  },
  {
    property_id: "PROP_003",
    accounts_receivable: 3200,
    deposits_held: 28000,
    outstanding_dues: 800,
    monthly_rent_collected: 84000,
    monthly_rent_expected: 90000
  },
  {
    property_id: "PROP_005",
    accounts_receivable: 22000,
    deposits_held: 250000,
    outstanding_dues: 0,
    monthly_rent_collected: 520000,
    monthly_rent_expected: 540000
  }
];

export const getFinancialsForProperty = (propertyId: string): PropertyFinancials | undefined => {
  return mockPropertyFinancials.find(f => f.property_id === propertyId);
};
