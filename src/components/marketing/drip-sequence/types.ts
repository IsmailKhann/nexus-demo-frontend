// Drip Sequence Flow Editor Types

export type BlockType = 'lead-journey' | 'community-message' | 'reminders' | 'wishes';

export type DripTriggerType = 
  | 'on_entry' 
  | 'after_delay' 
  | 'at_datetime' 
  | 'on_condition' 
  | 'manual_only';

export type DelayUnit = 'minutes' | 'hours' | 'days';

export interface DripTrigger {
  type: DripTriggerType;
  delayValue?: number;
  delayUnit?: DelayUnit;
  datetime?: string;
  condition?: {
    field: string;
    operator: string;
    value: string;
  };
}

export interface FlowStep {
  id: string;
  title: string;
  subject?: string;
  body: string;
  trigger: DripTrigger;
  isEnabled: boolean;
  order: number;
  customers: StepCustomer[];
}

export interface StepCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  enteredAt: string;
  status: 'active' | 'completed' | 'removed';
}

export interface DripBlock {
  id: string;
  type: BlockType;
  name: string;
  description: string;
  icon: string;
  steps: FlowStep[];
  allowedTriggers: DripTriggerType[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Default blocks configuration
export const defaultBlocks: Omit<DripBlock, 'steps'>[] = [
  {
    id: 'block_lead_journey',
    type: 'lead-journey',
    name: 'Lead Journey',
    description: 'Automated lead nurturing sequence from first contact to lease',
    icon: 'route',
    allowedTriggers: ['on_entry', 'after_delay', 'at_datetime', 'on_condition', 'manual_only'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'block_community_message',
    type: 'community-message',
    name: 'Community Message',
    description: 'Manual broadcast messages to selected residents',
    icon: 'megaphone',
    allowedTriggers: ['manual_only'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'block_reminders',
    type: 'reminders',
    name: 'Reminders',
    description: 'Date and event-based reminder sequences',
    icon: 'bell',
    allowedTriggers: ['on_entry', 'after_delay', 'at_datetime', 'manual_only'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'block_wishes',
    type: 'wishes',
    name: 'Wishes',
    description: 'Birthday, anniversary, and festival greetings',
    icon: 'gift',
    allowedTriggers: ['at_datetime', 'manual_only'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Sample steps for each block type
export const sampleSteps: Record<BlockType, FlowStep[]> = {
  'lead-journey': [
    {
      id: 'step_lj_1',
      title: 'Welcome Message',
      subject: 'Welcome to {{property_name}}!',
      body: 'Hi {{first_name}},\n\nThank you for your interest in {{property_name}}. We are excited to help you find your new home.\n\nBest regards,\nThe Leasing Team',
      trigger: { type: 'on_entry' },
      isEnabled: true,
      order: 1,
      customers: [
        { id: 'LEA_001', name: 'John Smith', email: 'john.smith@example.com', phone: '555-0100', enteredAt: '2025-12-01T09:00:00Z', status: 'completed' },
        { id: 'LEA_002', name: 'Emily Davis', email: 'emily.d@example.com', phone: '555-0101', enteredAt: '2025-12-02T14:00:00Z', status: 'active' },
      ],
    },
    {
      id: 'step_lj_2',
      title: 'Tour Invitation',
      subject: 'Schedule Your Tour at {{property_name}}',
      body: 'Hi {{first_name}},\n\nWe would love to show you around! Schedule a tour at your convenience.\n\nClick here to book: {{tour_link}}\n\nBest,\nThe Leasing Team',
      trigger: { type: 'after_delay', delayValue: 24, delayUnit: 'hours' },
      isEnabled: true,
      order: 2,
      customers: [
        { id: 'LEA_001', name: 'John Smith', email: 'john.smith@example.com', phone: '555-0100', enteredAt: '2025-12-02T09:00:00Z', status: 'completed' },
      ],
    },
    {
      id: 'step_lj_3',
      title: 'Follow-up After Tour',
      subject: 'How was your tour?',
      body: 'Hi {{first_name}},\n\nWe hope you enjoyed your tour! Do you have any questions about the property?\n\nWe are here to help.\n\nBest,\nThe Leasing Team',
      trigger: { type: 'on_condition', condition: { field: 'tour_completed', operator: '=', value: 'true' } },
      isEnabled: true,
      order: 3,
      customers: [],
    },
    {
      id: 'step_lj_4',
      title: 'Application Reminder',
      subject: 'Complete Your Application',
      body: 'Hi {{first_name}},\n\nDon\'t forget to complete your application. We\'d love to have you as a resident!\n\nApply here: {{application_link}}\n\nBest,\nThe Leasing Team',
      trigger: { type: 'after_delay', delayValue: 3, delayUnit: 'days' },
      isEnabled: true,
      order: 4,
      customers: [],
    },
  ],
  'community-message': [
    {
      id: 'step_cm_1',
      title: 'Community Announcement',
      subject: 'Important Update for Residents',
      body: 'Dear Residents,\n\nWe have an important update to share with you.\n\n{{message_content}}\n\nThank you,\nManagement',
      trigger: { type: 'manual_only' },
      isEnabled: true,
      order: 1,
      customers: [],
    },
    {
      id: 'step_cm_2',
      title: 'Maintenance Notice',
      subject: 'Scheduled Maintenance Notice',
      body: 'Dear Residents,\n\nPlease be advised of upcoming maintenance:\n\n{{maintenance_details}}\n\nWe apologize for any inconvenience.\n\nManagement',
      trigger: { type: 'manual_only' },
      isEnabled: true,
      order: 2,
      customers: [],
    },
  ],
  'reminders': [
    {
      id: 'step_rm_1',
      title: 'Rent Due Reminder',
      subject: 'Rent Payment Reminder',
      body: 'Hi {{first_name}},\n\nThis is a friendly reminder that your rent is due on {{due_date}}.\n\nPay online: {{payment_link}}\n\nThank you,\nManagement',
      trigger: { type: 'at_datetime' },
      isEnabled: true,
      order: 1,
      customers: [],
    },
    {
      id: 'step_rm_2',
      title: 'Lease Renewal Notice',
      subject: 'Your Lease is Expiring Soon',
      body: 'Hi {{first_name}},\n\nYour lease will expire on {{lease_end_date}}. We would love to have you stay!\n\nContact us to discuss renewal options.\n\nBest,\nManagement',
      trigger: { type: 'after_delay', delayValue: 90, delayUnit: 'days' },
      isEnabled: true,
      order: 2,
      customers: [],
    },
  ],
  'wishes': [
    {
      id: 'step_ws_1',
      title: 'Birthday Wishes',
      subject: 'Happy Birthday, {{first_name}}! 🎂',
      body: 'Dear {{first_name}},\n\nWishing you a wonderful birthday filled with joy and happiness!\n\nFrom all of us at {{property_name}}',
      trigger: { type: 'at_datetime' },
      isEnabled: true,
      order: 1,
      customers: [],
    },
    {
      id: 'step_ws_2',
      title: 'Move-in Anniversary',
      subject: 'Happy Anniversary! 🏠',
      body: 'Dear {{first_name}},\n\nIt\'s been {{years}} year(s) since you moved in! Thank you for being a valued member of our community.\n\nCheers,\n{{property_name}} Team',
      trigger: { type: 'at_datetime' },
      isEnabled: true,
      order: 2,
      customers: [],
    },
    {
      id: 'step_ws_3',
      title: 'Festival Greetings',
      subject: 'Season\'s Greetings from {{property_name}}!',
      body: 'Dear {{first_name}},\n\nWishing you and your loved ones a joyous holiday season!\n\nWarm regards,\n{{property_name}} Team',
      trigger: { type: 'at_datetime' },
      isEnabled: true,
      order: 3,
      customers: [],
    },
  ],
};
