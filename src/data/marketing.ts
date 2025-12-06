// Marketing & Automation Data Store
// Imported from nexus_marketing_automation_master.xlsx
// All data is in-memory only

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  languages: string;
  agent_type: string;
  max_active_leads: number;
  team_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  region: string;
  description: string;
  manager_user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  name: string;
  code: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  floor: number;
  beds: number;
  baths: number;
  rent_min: number;
  rent_max: number;
  status: string;
  sqft: number;
  created_at: string;
  updated_at: string;
}

export interface LeadSource {
  id: string;
  name: string;
  category: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketingLead {
  id: string;
  external_ref: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  country_code: string;
  preferred_contact_channel: string;
  preferred_language: string;
  preferred_contact_time: string;
  property_id: string;
  unit_id: string;
  beds: number;
  baths: number;
  min_rent: number;
  max_rent: number;
  desired_move_in_date: string;
  pets: boolean;
  notes: string;
  status: string;
  status_reason: string;
  lost_reason: string;
  lead_score: number;
  priority: string;
  lead_owner_id: string;
  team_id: string;
  source_id: string;
  campaign_id: string;
  original_channel: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  referrer_url: string;
  created_at: string;
  updated_at: string;
  first_contacted_at: string;
  last_contacted_at: string;
  last_inbound_at: string;
  last_outbound_at: string;
  converted_to_lease_at: string;
  deleted_at: string;
}

export interface LeadInteraction {
  id: string;
  lead_id: string;
  type: string;
  direction: string;
  channel: string;
  thread_id: string;
  subject: string;
  message_body: string;
  channel_message_id: string;
  attachments: string | { type: string; filename: string; url: string; mime_type?: string; duration?: number }[];
  created_by_user_id: string;
  created_by_source: string;
  timestamp: string;
  duration_seconds: number;
  is_visible_to_resident: boolean;
  is_unread: boolean;
  assigned_to_user_id: string;
}

export interface LeadStatusHistory {
  id: string;
  lead_id: string;
  old_status: string;
  new_status: string;
  reason: string;
  comment: string;
  changed_by_user_id: string;
  changed_by_source: string;
  created_at: string;
}

export interface Task {
  id: string;
  lead_id: string;
  property_id: string;
  title: string;
  description: string;
  assigned_to_user_id: string;
  due_at: string;
  priority: string;
  status: string;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string;
}

export interface LeadRoutingRule {
  id: string;
  name: string;
  is_active: boolean;
  priority: number;
  conditions_json: string;
  target_type: string;
  target_user_id: string;
  target_team_id: string;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface LeadAssignmentHistory {
  id: string;
  lead_id: string;
  assigned_to_user_id: string;
  previous_user_id: string;
  assigned_by_type: string;
  assigned_by_user_id: string;
  rule_id: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  spend_to_date: number;
  leads_generated: number;
  roi_percent: number;
  start_date: string;
  end_date: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  created_by_user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignEvent {
  id: string;
  campaign_id: string;
  lead_id: string;
  event_type: string;
  timestamp: string;
  metadata: string;
}

export interface Segment {
  id: string;
  name: string;
  type: string;
  filter_json: string;
  created_by: string;
  created_at: string;
}

export interface CampaignAudience {
  campaign_id: string;
  audience_id: string;
}

export interface Automation {
  id: string;
  name: string;
  trigger_type: string;
  trigger_event: string;
  status: string;
  enrolled_count: number;
  completed_count: number;
  open_rate: number;
  click_rate: number;
  created_by_user_id: string;
  created_at: string;
}

export interface AutomationStep {
  id: string;
  automation_id: string;
  step_order: number;
  type: string;
  action: string;
  delay_hours: number;
  content_template_id: string;
  condition_json: string;
  created_at: string;
}

export interface AutomationLog {
  id: string;
  automation_id: string;
  lead_id: string;
  current_step_id: string;
  status: string;
  started_at: string;
  last_step_completed_at: string;
  next_step_due_at: string;
}

export interface Template {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SyndicationStatus {
  id: string;
  property_id: string;
  channel_name: string;
  status: string;
  last_synced_at: string;
  error_log: string;
  listing_url: string;
  views_last_30d: number;
  leads_last_30d: number;
  is_featured: boolean;
}

export interface UnitSyndication {
  id: string;
  unit_id: string;
  channel: string;
  status: string;
  last_synced_at: string;
  listing_url: string;
  views_last_30d: number;
  leads_last_30d: number;
}

// Imported data from Excel workbook
export const users: User[] = [
  { id: "USR_001", full_name: "Sarah Jenkins", email: "sarah.j@nexus.com", phone: "555-0101", role: "Agent", languages: "English; Spanish", agent_type: "Leasing", max_active_leads: 50, team_id: "TM_001", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "USR_002", full_name: "Mike Ross", email: "mike.r@nexus.com", phone: "555-0102", role: "Agent", languages: "English", agent_type: "Leasing", max_active_leads: 50, team_id: "TM_002", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "USR_003", full_name: "Jessica Pearson", email: "jessica.p@nexus.com", phone: "555-0103", role: "Manager", languages: "English", agent_type: "Manager", max_active_leads: 100, team_id: "TM_001", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "USR_004", full_name: "AI Bot", email: "bot@nexus.com", phone: "", role: "System", languages: "All", agent_type: "Bot", max_active_leads: 9999, team_id: "TM_003", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "USR_005", full_name: "David Lee", email: "david.l@nexus.com", phone: "555-0105", role: "Agent", languages: "English; Mandarin", agent_type: "Leasing", max_active_leads: 40, team_id: "TM_002", is_active: true, created_at: "2024-02-01", updated_at: "2024-02-01" },
  { id: "USR_006", full_name: "Louis Litt", email: "louis.l@nexus.com", phone: "555-0106", role: "Agent", languages: "English", agent_type: "Leasing", max_active_leads: 45, team_id: "TM_001", is_active: true, created_at: "2024-02-01", updated_at: "2024-02-01" },
  { id: "USR_007", full_name: "Donna Paulsen", email: "donna.p@nexus.com", phone: "555-0107", role: "Admin", languages: "English", agent_type: "Admin", max_active_leads: 0, team_id: "TM_004", is_active: true, created_at: "2024-01-15", updated_at: "2024-01-15" },
  { id: "USR_008", full_name: "Rachel Zane", email: "rachel.z@nexus.com", phone: "555-0108", role: "Agent", languages: "English", agent_type: "Leasing", max_active_leads: 30, team_id: "TM_002", is_active: true, created_at: "2024-03-01", updated_at: "2024-03-01" },
  { id: "USR_009", full_name: "Harvey Specter", email: "harvey.s@nexus.com", phone: "555-0109", role: "Manager", languages: "English", agent_type: "Manager", max_active_leads: 100, team_id: "TM_002", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "USR_010", full_name: "Katrina Bennett", email: "katrina.b@nexus.com", phone: "555-0110", role: "Agent", languages: "English; French", agent_type: "Leasing", max_active_leads: 50, team_id: "TM_001", is_active: true, created_at: "2024-02-15", updated_at: "2024-02-15" },
];

export const teams: Team[] = [
  { id: "TM_001", name: "Alpha Leasing", region: "West Coast", description: "Luxury High-rise Team", manager_user_id: "USR_003", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "TM_002", name: "Beta Leasing", region: "East Coast", description: "Urban Loft Team", manager_user_id: "USR_009", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "TM_003", name: "Digital Response", region: "Global", description: "AI and Auto-response", manager_user_id: "USR_004", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "TM_004", name: "Admin Support", region: "Global", description: "Back office and processing", manager_user_id: "USR_007", is_active: true, created_at: "2024-01-15", updated_at: "2024-01-15" },
  { id: "TM_005", name: "Renewals", region: "National", description: "Resident retention", manager_user_id: "USR_009", is_active: true, created_at: "2024-02-01", updated_at: "2024-02-01" },
];

export const properties: Property[] = [
  { id: "PROP_001", name: "Sunset Towers", code: "SUNT", address_line1: "123 Sunset Blvd", address_line2: "", city: "Los Angeles", state: "CA", postal_code: "90028", country: "USA", timezone: "PST", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "PROP_002", name: "Downtown Lofts", code: "DTLF", address_line1: "450 Main St", address_line2: "", city: "Seattle", state: "WA", postal_code: "98104", country: "USA", timezone: "PST", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "PROP_003", name: "Riverside Garden", code: "RVSD", address_line1: "88 River Rd", address_line2: "", city: "Austin", state: "TX", postal_code: "78701", country: "USA", timezone: "CST", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "PROP_004", name: "The Highland", code: "HGHL", address_line1: "99 Summit Ave", address_line2: "", city: "Denver", state: "CO", postal_code: "80202", country: "USA", timezone: "MST", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "PROP_005", name: "Oceanview Estates", code: "OCNV", address_line1: "500 PCH", address_line2: "", city: "Malibu", state: "CA", postal_code: "90265", country: "USA", timezone: "PST", created_at: "2024-01-01", updated_at: "2024-01-01" },
];

export const units: Unit[] = [
  { id: "UNIT_101", property_id: "PROP_001", unit_number: "10A", floor: 10, beds: 1, baths: 1, rent_min: 3000, rent_max: 3200, status: "Vacant", sqft: 850, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "UNIT_102", property_id: "PROP_001", unit_number: "12B", floor: 12, beds: 2, baths: 2, rent_min: 4500, rent_max: 4800, status: "Occupied", sqft: 1200, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "UNIT_201", property_id: "PROP_002", unit_number: "204", floor: 2, beds: 0, baths: 1, rent_min: 1800, rent_max: 2100, status: "Vacant", sqft: 700, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "UNIT_202", property_id: "PROP_002", unit_number: "305", floor: 3, beds: 1, baths: 1, rent_min: 2400, rent_max: 2600, status: "Leased", sqft: 900, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "UNIT_301", property_id: "PROP_003", unit_number: "A1", floor: 1, beds: 1, baths: 1, rent_min: 1400, rent_max: 1500, status: "Occupied", sqft: 650, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "UNIT_302", property_id: "PROP_003", unit_number: "B2", floor: 2, beds: 2, baths: 1, rent_min: 1800, rent_max: 1950, status: "Notice Given", sqft: 950, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "UNIT_401", property_id: "PROP_004", unit_number: "500", floor: 5, beds: 3, baths: 3, rent_min: 5000, rent_max: 5500, status: "Vacant", sqft: 2500, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "UNIT_402", property_id: "PROP_004", unit_number: "210", floor: 2, beds: 1, baths: 1, rent_min: 2100, rent_max: 2300, status: "Occupied", sqft: 800, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "UNIT_501", property_id: "PROP_005", unit_number: "PH1", floor: 10, beds: 4, baths: 4, rent_min: 12000, rent_max: 15000, status: "Vacant", sqft: 4000, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "UNIT_502", property_id: "PROP_005", unit_number: "V01", floor: 1, beds: 3, baths: 3, rent_min: 8000, rent_max: 9000, status: "Occupied", sqft: 3000, created_at: "2024-01-01", updated_at: "2024-01-01" },
];

export const leadSources: LeadSource[] = [
  { id: "SRC_001", name: "Zillow", category: "ILS", description: "Zillow/Trulia Network", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "SRC_002", name: "Website Chat", category: "Direct", description: "Official Property Website", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "SRC_003", name: "Walk-In", category: "Organic", description: "Physical Visit", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "SRC_004", name: "Referral", category: "Referral", description: "Resident Referral", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "SRC_005", name: "Apartments.com", category: "ILS", description: "CoStar Network", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "SRC_006", name: "Facebook", category: "Social", description: "Meta Ads", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "SRC_007", name: "Google Ads", category: "PPC", description: "Search Network", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "SRC_008", name: "Craigslist", category: "Classifieds", description: "Manual Posting", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "SRC_009", name: "Signage", category: "Organic", description: "Building Banner", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "SRC_010", name: "Cold Call", category: "Outbound", description: "Agent Generated", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
];

export const marketingLeads: MarketingLead[] = [
  { id: "LEA_001", external_ref: "ZIL_998877", first_name: "John", last_name: "Smith", full_name: "John Smith", email: "john.smith@example.com", phone: "5550100", country_code: "+1", preferred_contact_channel: "Email", preferred_language: "English", preferred_contact_time: "Evening", property_id: "PROP_001", unit_id: "UNIT_101", beds: 1, baths: 1, min_rent: 3000, max_rent: 3500, desired_move_in_date: "2026-01-15", pets: true, notes: "Has a golden retriever", status: "Contacted", status_reason: "Awaiting Reply", lost_reason: "", lead_score: 85, priority: "High", lead_owner_id: "USR_001", team_id: "TM_001", source_id: "SRC_001", campaign_id: "", original_channel: "ILS", utm_source: "zillow", utm_medium: "cpc", utm_campaign: "", referrer_url: "", created_at: "2025-12-01T09:00:00Z", updated_at: "2025-12-01T10:00:00Z", first_contacted_at: "2025-12-01T09:05:00Z", last_contacted_at: "2025-12-01T10:00:00Z", last_inbound_at: "2025-12-01T09:00:00Z", last_outbound_at: "2025-12-01T10:00:00Z", converted_to_lease_at: "", deleted_at: "" },
  { id: "LEA_002", external_ref: "WEB_112233", first_name: "Emily", last_name: "Davis", full_name: "Emily Davis", email: "emily.d@example.com", phone: "5550101", country_code: "+1", preferred_contact_channel: "SMS", preferred_language: "English", preferred_contact_time: "Anytime", property_id: "PROP_002", unit_id: "UNIT_201", beds: 0, baths: 1, min_rent: 1800, max_rent: 2200, desired_move_in_date: "2026-02-01", pets: false, notes: "Looking for quiet unit", status: "Tour Scheduled", status_reason: "Confirmed", lost_reason: "", lead_score: 92, priority: "High", lead_owner_id: "USR_002", team_id: "TM_002", source_id: "SRC_002", campaign_id: "CMP_002", original_channel: "Web Chat", utm_source: "google", utm_medium: "cpc", utm_campaign: "tech_relo", referrer_url: "nexus.com/lofts", created_at: "2025-12-02T14:00:00Z", updated_at: "2025-12-02T14:30:00Z", first_contacted_at: "2025-12-02T14:05:00Z", last_contacted_at: "2025-12-02T14:30:00Z", last_inbound_at: "2025-12-02T14:00:00Z", last_outbound_at: "2025-12-02T14:30:00Z", converted_to_lease_at: "", deleted_at: "" },
  { id: "LEA_003", external_ref: "", first_name: "Robert", last_name: "Ford", full_name: "Robert Ford", email: "r.ford@example.com", phone: "5550102", country_code: "+1", preferred_contact_channel: "Phone", preferred_language: "English", preferred_contact_time: "Morning", property_id: "PROP_001", unit_id: "", beds: 2, baths: 2, min_rent: 4000, max_rent: 5000, desired_move_in_date: "2025-11-30", pets: false, notes: "", status: "Lost", status_reason: "Rented Elsewhere", lost_reason: "Price too high", lead_score: 20, priority: "Low", lead_owner_id: "USR_001", team_id: "TM_001", source_id: "SRC_003", campaign_id: "", original_channel: "Walk-In", utm_source: "", utm_medium: "", utm_campaign: "", referrer_url: "", created_at: "2025-11-20T10:00:00Z", updated_at: "2025-11-25T09:00:00Z", first_contacted_at: "2025-11-20T10:05:00Z", last_contacted_at: "2025-11-25T09:00:00Z", last_inbound_at: "", last_outbound_at: "2025-11-25T09:00:00Z", converted_to_lease_at: "", deleted_at: "" },
  { id: "LEA_004", external_ref: "APT_445566", first_name: "Michael", last_name: "Chen", full_name: "Michael Chen", email: "m.chen@example.com", phone: "5550103", country_code: "+1", preferred_contact_channel: "Email", preferred_language: "English", preferred_contact_time: "Afternoon", property_id: "PROP_003", unit_id: "UNIT_301", beds: 1, baths: 1, min_rent: 1400, max_rent: 1600, desired_move_in_date: "2025-12-20", pets: false, notes: "", status: "Application Pending", status_reason: "Docs Submitted", lost_reason: "", lead_score: 95, priority: "High", lead_owner_id: "USR_005", team_id: "TM_002", source_id: "SRC_005", campaign_id: "", original_channel: "ILS", utm_source: "apartments.com", utm_medium: "listing", utm_campaign: "", referrer_url: "", created_at: "2025-12-03T11:00:00Z", updated_at: "2025-12-04T15:00:00Z", first_contacted_at: "2025-12-03T11:05:00Z", last_contacted_at: "2025-12-04T15:00:00Z", last_inbound_at: "2025-12-04T14:00:00Z", last_outbound_at: "2025-12-04T15:00:00Z", converted_to_lease_at: "", deleted_at: "" },
  { id: "LEA_006", external_ref: "", first_name: "Bruce", last_name: "Wayne", full_name: "Bruce Wayne", email: "b.wayne@example.com", phone: "5550105", country_code: "+1", preferred_contact_channel: "Email", preferred_language: "English", preferred_contact_time: "Anytime", property_id: "PROP_005", unit_id: "UNIT_501", beds: 4, baths: 4, min_rent: 12000, max_rent: 15000, desired_move_in_date: "2025-12-15", pets: false, notes: "VIP client", status: "Leased", status_reason: "Lease Signed", lost_reason: "", lead_score: 99, priority: "High", lead_owner_id: "USR_003", team_id: "TM_001", source_id: "SRC_004", campaign_id: "", original_channel: "Referral", utm_source: "", utm_medium: "", utm_campaign: "", referrer_url: "", created_at: "2025-11-15T09:00:00Z", updated_at: "2025-12-01T10:00:00Z", first_contacted_at: "2025-11-15T09:30:00Z", last_contacted_at: "2025-12-01T10:00:00Z", last_inbound_at: "2025-11-30T16:00:00Z", last_outbound_at: "2025-12-01T10:00:00Z", converted_to_lease_at: "2025-12-01T10:00:00Z", deleted_at: "" },
  { id: "LEA_007", external_ref: "ZIL_223344", first_name: "Clark", last_name: "Kent", full_name: "Clark Kent", email: "c.kent@example.com", phone: "5550106", country_code: "+1", preferred_contact_channel: "Phone", preferred_language: "English", preferred_contact_time: "Morning", property_id: "PROP_002", unit_id: "UNIT_202", beds: 1, baths: 1, min_rent: 2000, max_rent: 2500, desired_move_in_date: "2026-03-01", pets: false, notes: "Reporter discount?", status: "Contacted", status_reason: "Left Voicemail", lost_reason: "", lead_score: 45, priority: "Medium", lead_owner_id: "USR_006", team_id: "TM_001", source_id: "SRC_001", campaign_id: "", original_channel: "ILS", utm_source: "zillow", utm_medium: "cpc", utm_campaign: "", referrer_url: "", created_at: "2025-12-04T09:00:00Z", updated_at: "2025-12-04T11:00:00Z", first_contacted_at: "2025-12-04T11:00:00Z", last_contacted_at: "2025-12-04T11:00:00Z", last_inbound_at: "", last_outbound_at: "2025-12-04T11:00:00Z", converted_to_lease_at: "", deleted_at: "" },
  { id: "LEA_008", external_ref: "", first_name: "Diana", last_name: "Prince", full_name: "Diana Prince", email: "d.prince@example.com", phone: "5550107", country_code: "+1", preferred_contact_channel: "Email", preferred_language: "English", preferred_contact_time: "Afternoon", property_id: "PROP_004", unit_id: "UNIT_401", beds: 3, baths: 3, min_rent: 5000, max_rent: 6000, desired_move_in_date: "2025-12-10", pets: true, notes: "Cat owner", status: "Tour Scheduled", status_reason: "Rescheduled", lost_reason: "", lead_score: 88, priority: "High", lead_owner_id: "USR_010", team_id: "TM_001", source_id: "SRC_002", campaign_id: "", original_channel: "Web Form", utm_source: "google", utm_medium: "organic", utm_campaign: "", referrer_url: "", created_at: "2025-12-02T10:00:00Z", updated_at: "2025-12-03T14:00:00Z", first_contacted_at: "2025-12-02T10:15:00Z", last_contacted_at: "2025-12-03T14:00:00Z", last_inbound_at: "2025-12-03T13:00:00Z", last_outbound_at: "2025-12-03T14:00:00Z", converted_to_lease_at: "", deleted_at: "" },
  { id: "LEA_009", external_ref: "CRAIG_111", first_name: "Barry", last_name: "Allen", full_name: "Barry Allen", email: "b.allen@example.com", phone: "5550108", country_code: "+1", preferred_contact_channel: "SMS", preferred_language: "English", preferred_contact_time: "Anytime", property_id: "PROP_002", unit_id: "UNIT_201", beds: 0, baths: 1, min_rent: 1500, max_rent: 1800, desired_move_in_date: "2026-01-01", pets: false, notes: "", status: "Lost", status_reason: "Ghosted", lost_reason: "No response", lead_score: 30, priority: "Low", lead_owner_id: "USR_002", team_id: "TM_002", source_id: "SRC_008", campaign_id: "", original_channel: "Craigslist", utm_source: "craigslist", utm_medium: "classifieds", utm_campaign: "", referrer_url: "", created_at: "2025-11-28T12:00:00Z", updated_at: "2025-12-02T09:00:00Z", first_contacted_at: "2025-11-28T12:05:00Z", last_contacted_at: "2025-12-02T09:00:00Z", last_inbound_at: "2025-11-28T12:00:00Z", last_outbound_at: "2025-12-02T09:00:00Z", converted_to_lease_at: "", deleted_at: "" },
];

export const leadInteractions: LeadInteraction[] = [
  { id: "INT_001", lead_id: "LEA_001", type: "Message", direction: "Inbound", channel: "Email", thread_id: "TH_001", subject: "Inquiry", message_body: "Is the 1 bedroom still available?", channel_message_id: "MSG_001", attachments: "", created_by_user_id: "USR_001", created_by_source: "Zillow", timestamp: "2025-12-01T09:00:00Z", duration_seconds: 0, is_visible_to_resident: true, is_unread: false, assigned_to_user_id: "USR_001" },
  { id: "INT_002", lead_id: "LEA_001", type: "Message", direction: "Outbound", channel: "Email", thread_id: "TH_001", subject: "Re: Inquiry", message_body: "Yes it is! Here are the details.", channel_message_id: "MSG_002", attachments: "brochure.pdf", created_by_user_id: "USR_001", created_by_source: "CRM", timestamp: "2025-12-01T09:15:00Z", duration_seconds: 0, is_visible_to_resident: true, is_unread: false, assigned_to_user_id: "USR_001" },
  { id: "INT_003", lead_id: "LEA_002", type: "Call", direction: "Inbound", channel: "Phone", thread_id: "", subject: "Call Log", message_body: "Asked about parking.", channel_message_id: "", attachments: "", created_by_user_id: "", created_by_source: "PhoneSystem", timestamp: "2025-12-02T14:00:00Z", duration_seconds: 120, is_visible_to_resident: false, is_unread: false, assigned_to_user_id: "USR_002" },
  { id: "INT_004", lead_id: "LEA_002", type: "Message", direction: "Outbound", channel: "SMS", thread_id: "TH_002", subject: "Tour Confirmation", message_body: "Confirmed for Friday at 2 PM.", channel_message_id: "MSG_004", attachments: "", created_by_user_id: "USR_002", created_by_source: "CRM", timestamp: "2025-12-02T14:30:00Z", duration_seconds: 0, is_visible_to_resident: true, is_unread: false, assigned_to_user_id: "USR_002" },
  { id: "INT_005", lead_id: "LEA_004", type: "Message", direction: "Inbound", channel: "Email", thread_id: "TH_003", subject: "Application", message_body: "Where do I upload paystubs?", channel_message_id: "MSG_005", attachments: "", created_by_user_id: "USR_005", created_by_source: "Apartments.com", timestamp: "2025-12-04T14:00:00Z", duration_seconds: 0, is_visible_to_resident: true, is_unread: true, assigned_to_user_id: "USR_005" },
  { id: "INT_006", lead_id: "LEA_004", type: "Message", direction: "Outbound", channel: "Email", thread_id: "TH_003", subject: "Re: Application", message_body: "You can upload them in the portal link below.", channel_message_id: "MSG_006", attachments: "portal_link", created_by_user_id: "USR_005", created_by_source: "CRM", timestamp: "2025-12-04T15:00:00Z", duration_seconds: 0, is_visible_to_resident: true, is_unread: false, assigned_to_user_id: "USR_005" },
  { id: "INT_007", lead_id: "LEA_006", type: "Meeting", direction: "Inbound", channel: "In Person", thread_id: "", subject: "Tour", message_body: "Client loved the penthouse.", channel_message_id: "", attachments: "", created_by_user_id: "USR_003", created_by_source: "Walk-In", timestamp: "2025-11-20T14:00:00Z", duration_seconds: 3600, is_visible_to_resident: false, is_unread: false, assigned_to_user_id: "USR_003" },
  { id: "INT_008", lead_id: "LEA_006", type: "Message", direction: "Outbound", channel: "Email", thread_id: "TH_004", subject: "Lease Sent", message_body: "Here is the docusign link.", channel_message_id: "MSG_008", attachments: "", created_by_user_id: "USR_003", created_by_source: "CRM", timestamp: "2025-11-25T10:00:00Z", duration_seconds: 0, is_visible_to_resident: true, is_unread: false, assigned_to_user_id: "USR_003" },
  { id: "INT_009", lead_id: "LEA_007", type: "Call", direction: "Outbound", channel: "Phone", thread_id: "", subject: "Voicemail", message_body: "Left VM about unit 202 availability.", channel_message_id: "", attachments: "", created_by_user_id: "", created_by_source: "PhoneSystem", timestamp: "2025-12-04T11:00:00Z", duration_seconds: 30, is_visible_to_resident: false, is_unread: false, assigned_to_user_id: "USR_006" },
  { id: "INT_010", lead_id: "LEA_008", type: "Message", direction: "Inbound", channel: "SMS", thread_id: "TH_005", subject: "Reschedule", message_body: "Can we move tour to next week?", channel_message_id: "MSG_010", attachments: "", created_by_user_id: "", created_by_source: "SMS_Gateway", timestamp: "2025-12-03T13:00:00Z", duration_seconds: 0, is_visible_to_resident: true, is_unread: false, assigned_to_user_id: "USR_010" },
  { id: "INT_011", lead_id: "LEA_008", type: "Message", direction: "Outbound", channel: "SMS", thread_id: "TH_005", subject: "Re: Reschedule", message_body: "No problem, moved to Tuesday.", channel_message_id: "MSG_011", attachments: "", created_by_user_id: "USR_010", created_by_source: "CRM", timestamp: "2025-12-03T14:00:00Z", duration_seconds: 0, is_visible_to_resident: true, is_unread: false, assigned_to_user_id: "USR_010" },
  { id: "INT_012", lead_id: "LEA_009", type: "Message", direction: "Outbound", channel: "SMS", thread_id: "TH_006", subject: "Checking in", message_body: "Are you still interested?", channel_message_id: "MSG_012", attachments: "", created_by_user_id: "USR_002", created_by_source: "CRM", timestamp: "2025-12-02T09:00:00Z", duration_seconds: 0, is_visible_to_resident: true, is_unread: false, assigned_to_user_id: "USR_002" },
];

export const campaigns: Campaign[] = [
  { id: "CMP_001", name: "Winter Special 1MO Free", channel: "Email", budget: 5000, spend_to_date: 4200, leads_generated: 150, roi_percent: 250, start_date: "2025-11-01", end_date: "2025-12-31", utm_source: "newsletter", utm_medium: "email", utm_campaign: "winter_special", created_by_user_id: "USR_003", status: "Active", created_at: "2025-10-01", updated_at: "2025-12-01" },
  { id: "CMP_002", name: "Google PPC Q1 Tech Relo", channel: "PPC", budget: 15000, spend_to_date: 3500, leads_generated: 45, roi_percent: 180, start_date: "2025-01-01", end_date: "2025-03-31", utm_source: "google", utm_medium: "cpc", utm_campaign: "tech_relo", created_by_user_id: "USR_003", status: "Scheduled", created_at: "2025-01-01", updated_at: "2025-01-01" },
  { id: "CMP_003", name: "Summer Lease-Up Social", channel: "Social", budget: 10000, spend_to_date: 9800, leads_generated: 320, roi_percent: 310, start_date: "2025-06-01", end_date: "2025-08-31", utm_source: "facebook", utm_medium: "cpm", utm_campaign: "summer_lease", created_by_user_id: "USR_009", status: "Completed", created_at: "2025-05-01", updated_at: "2025-09-01" },
  { id: "CMP_004", name: "Student Housing Rush", channel: "Display", budget: 8000, spend_to_date: 1200, leads_generated: 15, roi_percent: 90, start_date: "2025-07-01", end_date: "2025-09-01", utm_source: "univ_site", utm_medium: "banner", utm_campaign: "student_rush", created_by_user_id: "USR_009", status: "Draft", created_at: "2025-06-01", updated_at: "2025-06-01" },
  { id: "CMP_005", name: "Resident Referral Bonus", channel: "Referral", budget: 20000, spend_to_date: 15000, leads_generated: 55, roi_percent: 400, start_date: "2025-01-01", end_date: "2025-12-31", utm_source: "flyer", utm_medium: "print", utm_campaign: "ref_bonus", created_by_user_id: "USR_003", status: "Active", created_at: "2025-01-01", updated_at: "2025-12-01" },
  { id: "CMP_006", name: "Luxury Penthouse Launch", channel: "Event", budget: 12000, spend_to_date: 11500, leads_generated: 12, roi_percent: 150, start_date: "2025-10-01", end_date: "2025-10-30", utm_source: "invite", utm_medium: "event", utm_campaign: "ph_launch", created_by_user_id: "USR_006", status: "Completed", created_at: "2025-09-01", updated_at: "2025-11-01" },
  { id: "CMP_007", name: "Zillow Featured Listing", channel: "ILS", budget: 4500, spend_to_date: 4500, leads_generated: 90, roi_percent: 210, start_date: "2025-11-01", end_date: "2025-11-30", utm_source: "zillow", utm_medium: "listing", utm_campaign: "featured_nov", created_by_user_id: "USR_003", status: "Completed", created_at: "2025-10-15", updated_at: "2025-12-01" },
  { id: "CMP_008", name: "Local Business Partners", channel: "Referral", budget: 1000, spend_to_date: 200, leads_generated: 5, roi_percent: 500, start_date: "2025-01-01", end_date: "2025-12-31", utm_source: "partner", utm_medium: "direct", utm_campaign: "local_biz", created_by_user_id: "USR_003", status: "Active", created_at: "2025-01-01", updated_at: "2025-01-01" },
  { id: "CMP_009", name: "Retargeting - Tour Abandon", channel: "Social", budget: 3000, spend_to_date: 1500, leads_generated: 25, roi_percent: 120, start_date: "2025-12-01", end_date: "2026-02-28", utm_source: "instagram", utm_medium: "retarget", utm_campaign: "tour_abandon", created_by_user_id: "USR_003", status: "Active", created_at: "2025-11-20", updated_at: "2025-12-01" },
  { id: "CMP_010", name: "Downtown Open House", channel: "Event", budget: 500, spend_to_date: 450, leads_generated: 30, roi_percent: 800, start_date: "2025-12-05", end_date: "2025-12-05", utm_source: "signage", utm_medium: "walkin", utm_campaign: "open_house", created_by_user_id: "USR_002", status: "Completed", created_at: "2025-12-01", updated_at: "2025-12-06" },
];

export const automations: Automation[] = [
  { id: "AUTO_001", name: "New Lead Welcome", trigger_type: "Event", trigger_event: "Lead Created", status: "Active", enrolled_count: 124, completed_count: 1500, open_rate: 68.5, click_rate: 24.2, created_by_user_id: "USR_003", created_at: "2024-01-01" },
  { id: "AUTO_002", name: "Post-Tour Feedback", trigger_type: "Event", trigger_event: "Tour Completed", status: "Active", enrolled_count: 45, completed_count: 320, open_rate: 85.0, click_rate: 40.1, created_by_user_id: "USR_003", created_at: "2024-01-01" },
  { id: "AUTO_003", name: "Stale Lead Re-engagement", trigger_type: "Time", trigger_event: "No Activity 30 Days", status: "Paused", enrolled_count: 800, completed_count: 200, open_rate: 15.3, click_rate: 2.5, created_by_user_id: "USR_009", created_at: "2024-06-01" },
  { id: "AUTO_004", name: "Lease Renewal Reminder", trigger_type: "Time", trigger_event: "Lease Ends 90 Days", status: "Active", enrolled_count: 200, completed_count: 50, open_rate: 92.0, click_rate: 15.0, created_by_user_id: "USR_007", created_at: "2024-01-01" },
  { id: "AUTO_005", name: "Review Request", trigger_type: "Event", trigger_event: "Move-in Completed", status: "Active", enrolled_count: 15, completed_count: 120, open_rate: 60.0, click_rate: 35.0, created_by_user_id: "USR_003", created_at: "2024-03-15" },
  { id: "AUTO_006", name: "Birthday Greeting", trigger_type: "Time", trigger_event: "Birthday Matches", status: "Active", enrolled_count: 300, completed_count: 300, open_rate: 99.0, click_rate: 0.0, created_by_user_id: "USR_004", created_at: "2024-01-01" },
  { id: "AUTO_007", name: "Payment Late Warning", trigger_type: "Event", trigger_event: "Rent Overdue 1 Day", status: "Active", enrolled_count: 12, completed_count: 150, open_rate: 98.0, click_rate: 55.0, created_by_user_id: "USR_007", created_at: "2024-01-01" },
  { id: "AUTO_008", name: "Zillow Lead Fast-Response", trigger_type: "Event", trigger_event: "Lead Source = Zillow", status: "Active", enrolled_count: 50, completed_count: 450, open_rate: 75.0, click_rate: 12.0, created_by_user_id: "USR_003", created_at: "2024-05-01" },
  { id: "AUTO_009", name: "Vendor Invoice Approval", trigger_type: "Event", trigger_event: "Invoice Received", status: "Active", enrolled_count: 5, completed_count: 50, open_rate: 100.0, click_rate: 90.0, created_by_user_id: "USR_007", created_at: "2024-01-01" },
  { id: "AUTO_010", name: "Winter Special Drip", trigger_type: "Segment", trigger_event: "Tag = 'Interested in 1BHK'", status: "Draft", enrolled_count: 0, completed_count: 0, open_rate: 0.0, click_rate: 0.0, created_by_user_id: "USR_002", created_at: "2025-11-01" },
];

export const automationSteps: AutomationStep[] = [
  { id: "STEP_001", automation_id: "AUTO_001", step_order: 1, type: "Action", action: "Send Email", delay_hours: 0, content_template_id: "TMPL_WELCOME", condition_json: "{}", created_at: "2024-01-01" },
  { id: "STEP_002", automation_id: "AUTO_001", step_order: 2, type: "Delay", action: "Wait", delay_hours: 24, content_template_id: "", condition_json: "{}", created_at: "2024-01-01" },
  { id: "STEP_003", automation_id: "AUTO_001", step_order: 3, type: "Action", action: "Send SMS", delay_hours: 0, content_template_id: "TMPL_SMS_CHECKIN", condition_json: '{"has_replied": false}', created_at: "2024-01-01" },
  { id: "STEP_004", automation_id: "AUTO_001", step_order: 4, type: "Action", action: "Create Task", delay_hours: 0, content_template_id: "", condition_json: '{"task_title":"Manual Follow Up"}', created_at: "2024-01-01" },
  { id: "STEP_005", automation_id: "AUTO_002", step_order: 1, type: "Delay", action: "Wait", delay_hours: 2, content_template_id: "", condition_json: "{}", created_at: "2024-01-01" },
  { id: "STEP_006", automation_id: "AUTO_002", step_order: 2, type: "Action", action: "Send Email", delay_hours: 0, content_template_id: "TMPL_FEEDBACK", condition_json: "{}", created_at: "2024-01-01" },
  { id: "STEP_007", automation_id: "AUTO_002", step_order: 3, type: "Condition", action: "Check Score", delay_hours: 0, content_template_id: "", condition_json: '{"score":">8"}', created_at: "2024-01-01" },
  { id: "STEP_008", automation_id: "AUTO_002", step_order: 4, type: "Action", action: "Send Email", delay_hours: 0, content_template_id: "TMPL_REVIEW_LINK", condition_json: '{"path":"true"}', created_at: "2024-01-01" },
  { id: "STEP_009", automation_id: "AUTO_008", step_order: 1, type: "Action", action: "Send SMS", delay_hours: 0, content_template_id: "TMPL_ZILLOW_AUTO", condition_json: "{}", created_at: "2024-05-01" },
  { id: "STEP_010", automation_id: "AUTO_008", step_order: 2, type: "Action", action: "Assign Agent", delay_hours: 0, content_template_id: "", condition_json: '{"team":"TM_001"}', created_at: "2024-05-01" },
];

export const automationLogs: AutomationLog[] = [
  { id: "LOG_001", automation_id: "AUTO_001", lead_id: "LEA_001", current_step_id: "STEP_002", status: "Active", started_at: "2025-12-01T09:05:00Z", last_step_completed_at: "2025-12-01T09:05:00Z", next_step_due_at: "2025-12-02T09:05:00Z" },
  { id: "LOG_002", automation_id: "AUTO_001", lead_id: "LEA_006", current_step_id: "STEP_004", status: "Completed", started_at: "2025-11-15T09:30:00Z", last_step_completed_at: "2025-11-16T10:00:00Z", next_step_due_at: "" },
  { id: "LOG_003", automation_id: "AUTO_008", lead_id: "LEA_007", current_step_id: "STEP_010", status: "Completed", started_at: "2025-12-04T11:00:00Z", last_step_completed_at: "2025-12-04T11:01:00Z", next_step_due_at: "" },
  { id: "LOG_004", automation_id: "AUTO_002", lead_id: "LEA_002", current_step_id: "STEP_005", status: "Active", started_at: "2025-12-05T14:00:00Z", last_step_completed_at: "2025-12-05T14:00:00Z", next_step_due_at: "2025-12-05T16:00:00Z" },
  { id: "LOG_005", automation_id: "AUTO_001", lead_id: "LEA_010", current_step_id: "STEP_001", status: "Active", started_at: "2025-12-05T14:05:00Z", last_step_completed_at: "2025-12-05T14:05:00Z", next_step_due_at: "2025-12-06T14:05:00Z" },
  { id: "LOG_006", automation_id: "AUTO_003", lead_id: "LEA_009", current_step_id: "STEP_001", status: "Paused", started_at: "2025-11-30T00:00:00Z", last_step_completed_at: "", next_step_due_at: "" },
  { id: "LOG_007", automation_id: "AUTO_001", lead_id: "LEA_005", current_step_id: "STEP_003", status: "Active", started_at: "2025-12-05T08:00:00Z", last_step_completed_at: "2025-12-05T08:00:00Z", next_step_due_at: "" },
  { id: "LOG_008", automation_id: "AUTO_008", lead_id: "LEA_001", current_step_id: "STEP_010", status: "Completed", started_at: "2025-12-01T09:01:00Z", last_step_completed_at: "2025-12-01T09:02:00Z", next_step_due_at: "" },
  { id: "LOG_009", automation_id: "AUTO_004", lead_id: "LEA_003", current_step_id: "STEP_001", status: "Terminated", started_at: "2025-11-20T00:00:00Z", last_step_completed_at: "2025-11-20T00:00:00Z", next_step_due_at: "" },
  { id: "LOG_010", automation_id: "AUTO_001", lead_id: "LEA_004", current_step_id: "STEP_004", status: "Completed", started_at: "2025-12-03T11:05:00Z", last_step_completed_at: "2025-12-04T11:05:00Z", next_step_due_at: "" },
];

export const templates: Template[] = [
  { id: "TMPL_WELCOME", name: "Welcome Email", type: "email", subject: "Welcome to {{property_name}}", body: "Hi {{first_name}},<br/>Thanks for your interest in {{property_name}}. Our team will call you shortly.", created_by: "USR_003", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "TMPL_SMS_CHECKIN", name: "Check-in SMS", type: "sms", subject: "", body: "Hi {{first_name}} — quick check-in re: your tour at {{property_name}}. Reply YES to confirm.", created_by: "USR_003", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "TMPL_FEEDBACK", name: "Feedback Request", type: "email", subject: "How did the tour go?", body: "Hi {{first_name}},<br/>Thanks for touring. Tell us how we did: {{feedback_link}}", created_by: "USR_003", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "TMPL_REVIEW_LINK", name: "Review Link", type: "email", subject: "Share your review", body: "Hi {{first_name}}, please leave a review: {{review_link}}", created_by: "USR_003", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "TMPL_ZILLOW_AUTO", name: "Zillow Auto SMS", type: "sms", subject: "", body: "Thanks for your Zillow inquiry. An agent will call you shortly.", created_by: "USR_003", created_at: "2024-05-01", updated_at: "2024-05-01" },
];

export const segments: Segment[] = [
  { id: "SEG_001", name: "Interested 1BHK", type: "tag", filter_json: '{"tag":"Interested in 1BHK"}', created_by: "USR_003", created_at: "2025-10-01" },
  { id: "SEG_002", name: "Open House Attendees", type: "manual", filter_json: '{"source":"signage"}', created_by: "USR_002", created_at: "2025-12-01" },
];

export const campaignAudiences: CampaignAudience[] = [
  { campaign_id: "CMP_001", audience_id: "SEG_001" },
  { campaign_id: "CMP_002", audience_id: "SEG_002" },
];

export const syndicationStatuses: SyndicationStatus[] = [
  { id: "SYN_001", property_id: "PROP_001", channel_name: "Zillow", status: "Published", last_synced_at: "2025-12-06T08:00:00Z", error_log: "", listing_url: "zillow.com/b/sunset-towers", views_last_30d: 1250, leads_last_30d: 45, is_featured: true },
  { id: "SYN_002", property_id: "PROP_001", channel_name: "Apartments.com", status: "Published", last_synced_at: "2025-12-06T08:00:00Z", error_log: "", listing_url: "apartments.com/sunset-towers", views_last_30d: 980, leads_last_30d: 30, is_featured: false },
  { id: "SYN_003", property_id: "PROP_001", channel_name: "Realtor.com", status: "Published", last_synced_at: "2025-12-06T08:00:00Z", error_log: "", listing_url: "realtor.com/realestateandhomes-detail/sunset", views_last_30d: 450, leads_last_30d: 12, is_featured: false },
  { id: "SYN_004", property_id: "PROP_002", channel_name: "Zillow", status: "Published", last_synced_at: "2025-12-06T08:15:00Z", error_log: "", listing_url: "zillow.com/b/downtown-lofts", views_last_30d: 2100, leads_last_30d: 85, is_featured: true },
  { id: "SYN_005", property_id: "PROP_002", channel_name: "Craigslist", status: "Manual", last_synced_at: "2025-12-01T10:00:00Z", error_log: "", listing_url: "craigslist.org/sea/apa/d/downtown", views_last_30d: 300, leads_last_30d: 10, is_featured: false },
  { id: "SYN_006", property_id: "PROP_003", channel_name: "Zillow", status: "Sync Error", last_synced_at: "2025-12-05T14:00:00Z", error_log: "Image resolution too low (Unit 301)", listing_url: "", views_last_30d: 0, leads_last_30d: 0, is_featured: false },
  { id: "SYN_007", property_id: "PROP_003", channel_name: "Facebook Marketplace", status: "Published", last_synced_at: "2025-12-06T09:00:00Z", error_log: "", listing_url: "facebook.com/marketplace/item/123", views_last_30d: 500, leads_last_30d: 25, is_featured: false },
  { id: "SYN_008", property_id: "PROP_004", channel_name: "Zillow", status: "Published", last_synced_at: "2025-12-06T08:30:00Z", error_log: "", listing_url: "zillow.com/b/the-highland", views_last_30d: 800, leads_last_30d: 20, is_featured: true },
  { id: "SYN_009", property_id: "PROP_005", channel_name: "LuxuryEstates.com", status: "Published", last_synced_at: "2025-12-06T10:00:00Z", error_log: "", listing_url: "luxuryestates.com/oceanview", views_last_30d: 5000, leads_last_30d: 5, is_featured: true },
  { id: "SYN_010", property_id: "PROP_005", channel_name: "Zillow", status: "Unpublished", last_synced_at: "2025-11-01T00:00:00Z", error_log: "Owner request", listing_url: "", views_last_30d: 0, leads_last_30d: 0, is_featured: false },
];

// Helper functions
export function getSourceIcon(channel: string): string {
  const channelMap: Record<string, string> = {
    'ILS': 'building',
    'Web Chat': 'globe',
    'Web Form': 'globe',
    'Walk-In': 'user',
    'Referral': 'users',
    'Craigslist': 'list',
    'Phone': 'phone',
    'Call': 'phone',
    'SMS': 'message-square',
    'Email': 'mail',
  };
  return channelMap[channel] || 'circle';
}

export function getSourceLabel(sourceId: string, channel: string): string {
  const source = leadSources.find(s => s.id === sourceId);
  if (source) {
    return `${source.category} (${source.name})`;
  }
  return channel || 'Unknown';
}

export function getUserById(userId: string): User | undefined {
  return users.find(u => u.id === userId);
}

export function getPropertyById(propertyId: string): Property | undefined {
  return properties.find(p => p.id === propertyId);
}

export function getTeamById(teamId: string): Team | undefined {
  return teams.find(t => t.id === teamId);
}

// Computed metrics
export function getMarketingMetrics() {
  const totalLeads = marketingLeads.filter(l => !l.deleted_at).length;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newThisWeek = marketingLeads.filter(l => new Date(l.created_at) > oneWeekAgo && !l.deleted_at).length;
  const toursScheduled = marketingLeads.filter(l => l.status === 'Tour Scheduled' && !l.deleted_at).length;
  const avgLeadScore = marketingLeads.reduce((sum, l) => sum + l.lead_score, 0) / totalLeads || 0;
  
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend_to_date, 0);
  const totalLeadsFromCampaigns = campaigns.reduce((sum, c) => sum + c.leads_generated, 0);
  const avgROI = campaigns.reduce((sum, c) => sum + c.roi_percent, 0) / campaigns.length || 0;
  
  return {
    totalLeads,
    newThisWeek,
    toursScheduled,
    avgLeadScore: Math.round(avgLeadScore),
    activeCampaigns,
    totalSpend,
    totalLeadsFromCampaigns,
    avgROI: Math.round(avgROI),
  };
}
