// Comprehensive mock data for Accounting module

export interface Account {
  id: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  parent: string | null;
  normal_balance: 'Debit' | 'Credit';
  balance: number;
  status: 'active' | 'inactive';
  system: boolean;
  description?: string;
}

export interface Transaction {
  id: string;
  date: string;
  ref: string;
  account_id: string;
  type: 'Invoice' | 'Payment' | 'Bill' | 'Journal' | 'Deposit' | 'Payout';
  property: string;
  debit: number;
  credit: number;
  description: string;
  created_by: string;
}

export interface Invoice {
  id: string;
  tenant: string;
  tenant_id: string;
  property: string;
  property_id: string;
  due_date: string;
  total: number;
  balance: number;
  status: 'Open' | 'Partially Paid' | 'Overdue' | 'Paid';
  line_items: { description: string; amount: number }[];
  created_at: string;
}

export interface Bill {
  id: string;
  vendor: string;
  vendor_id: string;
  property: string;
  due_date: string;
  total: number;
  balance: number;
  status: 'Pending' | 'Approved' | 'Paid';
  is_1099: boolean;
  category: string;
  description: string;
  created_at: string;
}

export interface Payment {
  id: string;
  date: string;
  type: 'Tenant' | 'Vendor' | 'Owner Payout' | 'Deposit Movement';
  payer_payee: string;
  property: string;
  amount: number;
  method: 'ACH' | 'Card' | 'Check' | 'Wire' | 'Cash';
  status: 'Pending' | 'Cleared' | 'Failed';
  reference: string;
  linked_entries: string[];
}

export interface SecurityDeposit {
  id: string;
  tenant: string;
  tenant_id: string;
  property: string;
  unit: string;
  amount: number;
  held_account: string;
  status: 'Held' | 'Partial Release' | 'Released';
  move_in_date: string;
  notes?: string;
}

export interface OwnerStatement {
  id: string;
  owner: string;
  owner_id: string;
  property: string;
  property_id: string;
  period_start: string;
  period_end: string;
  gross_income: number;
  expenses: number;
  management_fee: number;
  net_to_owner: number;
  status: 'Draft' | 'Generated' | 'Sent';
  payout_date?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
}

export interface RecentActivity {
  id: string;
  message: string;
  user: string;
  timestamp: string;
  type: 'payment' | 'invoice' | 'sync' | 'report' | 'account' | 'statement';
}

// Mock Accounts (Chart of Accounts)
export const mockAccounts: Account[] = [
  { id: '1000', name: 'Operating Cash', type: 'Asset', parent: null, normal_balance: 'Debit', balance: 125000, status: 'active', system: true, description: 'Main operating account' },
  { id: '1010', name: 'Trust Account', type: 'Asset', parent: null, normal_balance: 'Debit', balance: 185000, status: 'active', system: true, description: 'Security deposits and trust funds' },
  { id: '1100', name: 'Accounts Receivable', type: 'Asset', parent: null, normal_balance: 'Debit', balance: 45000, status: 'active', system: true },
  { id: '1150', name: 'Prepaid Insurance', type: 'Asset', parent: null, normal_balance: 'Debit', balance: 12000, status: 'active', system: false },
  { id: '1500', name: 'Property - Greenway Apts', type: 'Asset', parent: null, normal_balance: 'Debit', balance: 2500000, status: 'active', system: false },
  { id: '1510', name: 'Property - Oak Manor', type: 'Asset', parent: null, normal_balance: 'Debit', balance: 1800000, status: 'active', system: false },
  { id: '1600', name: 'Accumulated Depreciation', type: 'Asset', parent: null, normal_balance: 'Credit', balance: -450000, status: 'active', system: true },
  { id: '2000', name: 'Accounts Payable', type: 'Liability', parent: null, normal_balance: 'Credit', balance: 32000, status: 'active', system: true },
  { id: '2100', name: 'Security Deposits Held', type: 'Liability', parent: null, normal_balance: 'Credit', balance: 85000, status: 'active', system: true, description: 'Tenant security deposits' },
  { id: '2200', name: 'Prepaid Rent', type: 'Liability', parent: null, normal_balance: 'Credit', balance: 8500, status: 'active', system: false },
  { id: '2300', name: 'Owner Distributions Payable', type: 'Liability', parent: null, normal_balance: 'Credit', balance: 45000, status: 'active', system: false },
  { id: '3000', name: 'Owner Equity', type: 'Equity', parent: null, normal_balance: 'Credit', balance: 3500000, status: 'active', system: true },
  { id: '3100', name: 'Retained Earnings', type: 'Equity', parent: null, normal_balance: 'Credit', balance: 680000, status: 'active', system: true },
  { id: '4000', name: 'Rental Income', type: 'Revenue', parent: null, normal_balance: 'Credit', balance: 250000, status: 'active', system: true },
  { id: '4100', name: 'Late Fees', type: 'Revenue', parent: '4000', normal_balance: 'Credit', balance: 4500, status: 'active', system: false },
  { id: '4200', name: 'Application Fees', type: 'Revenue', parent: '4000', normal_balance: 'Credit', balance: 2800, status: 'active', system: false },
  { id: '4300', name: 'Pet Fees', type: 'Revenue', parent: '4000', normal_balance: 'Credit', balance: 3200, status: 'active', system: false },
  { id: '5000', name: 'Property Maintenance', type: 'Expense', parent: null, normal_balance: 'Debit', balance: 35000, status: 'active', system: false },
  { id: '5010', name: 'Repairs & Maintenance', type: 'Expense', parent: '5000', normal_balance: 'Debit', balance: 18500, status: 'active', system: false },
  { id: '5020', name: 'Landscaping', type: 'Expense', parent: '5000', normal_balance: 'Debit', balance: 4200, status: 'active', system: false },
  { id: '5100', name: 'Utilities', type: 'Expense', parent: null, normal_balance: 'Debit', balance: 12000, status: 'active', system: false },
  { id: '5200', name: 'Insurance', type: 'Expense', parent: null, normal_balance: 'Debit', balance: 8500, status: 'active', system: false },
  { id: '5300', name: 'Property Taxes', type: 'Expense', parent: null, normal_balance: 'Debit', balance: 24000, status: 'active', system: false },
  { id: '5400', name: 'Management Fees', type: 'Expense', parent: null, normal_balance: 'Debit', balance: 25000, status: 'active', system: false },
  { id: '6000', name: 'Capital Improvements', type: 'Expense', parent: null, normal_balance: 'Debit', balance: 45000, status: 'active', system: false },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  { id: 'txn_001', date: '2025-12-01', ref: 'INV-1001', account_id: '1100', type: 'Invoice', property: 'Greenway Apts', debit: 2500, credit: 0, description: 'Rent - Unit 101 - December', created_by: 'System' },
  { id: 'txn_002', date: '2025-12-01', ref: 'INV-1001', account_id: '4000', type: 'Invoice', property: 'Greenway Apts', debit: 0, credit: 2500, description: 'Rent - Unit 101 - December', created_by: 'System' },
  { id: 'txn_003', date: '2025-12-05', ref: 'PAY-2001', account_id: '1000', type: 'Payment', property: 'Greenway Apts', debit: 2500, credit: 0, description: 'Rent payment - John Smith', created_by: 'System' },
  { id: 'txn_004', date: '2025-12-05', ref: 'PAY-2001', account_id: '1100', type: 'Payment', property: 'Greenway Apts', debit: 0, credit: 2500, description: 'Rent payment - John Smith', created_by: 'System' },
  { id: 'txn_005', date: '2025-12-08', ref: 'BILL-3001', account_id: '5000', type: 'Bill', property: 'Greenway Apts', debit: 1200, credit: 0, description: 'HVAC repair - Unit 205', created_by: 'Sarah Admin' },
  { id: 'txn_006', date: '2025-12-08', ref: 'BILL-3001', account_id: '2000', type: 'Bill', property: 'Greenway Apts', debit: 0, credit: 1200, description: 'HVAC repair - Unit 205', created_by: 'Sarah Admin' },
  { id: 'txn_007', date: '2025-12-10', ref: 'JE-4001', account_id: '5200', type: 'Journal', property: 'All Properties', debit: 2500, credit: 0, description: 'Monthly insurance allocation', created_by: 'CFO User' },
  { id: 'txn_008', date: '2025-12-10', ref: 'JE-4001', account_id: '1150', type: 'Journal', property: 'All Properties', debit: 0, credit: 2500, description: 'Monthly insurance allocation', created_by: 'CFO User' },
];

// Mock Invoices with aging
export const mockInvoices: Invoice[] = [
  { id: 'INV-1001', tenant: 'John Smith', tenant_id: 't_001', property: 'Greenway Apts - Unit 101', property_id: 'prop_001', due_date: '2025-12-05', total: 2500, balance: 0, status: 'Paid', line_items: [{ description: 'Monthly Rent', amount: 2400 }, { description: 'Pet Fee', amount: 100 }], created_at: '2025-12-01' },
  { id: 'INV-1002', tenant: 'Jane Doe', tenant_id: 't_002', property: 'Greenway Apts - Unit 205', property_id: 'prop_001', due_date: '2025-12-05', total: 2800, balance: 2800, status: 'Overdue', line_items: [{ description: 'Monthly Rent', amount: 2800 }], created_at: '2025-12-01' },
  { id: 'INV-1003', tenant: 'Bob Johnson', tenant_id: 't_003', property: 'Oak Manor - Unit 301', property_id: 'prop_002', due_date: '2025-11-01', total: 3200, balance: 3200, status: 'Overdue', line_items: [{ description: 'Monthly Rent', amount: 3200 }], created_at: '2025-10-25' },
  { id: 'INV-1004', tenant: 'Sarah Williams', tenant_id: 't_004', property: 'Oak Manor - Unit 405', property_id: 'prop_002', due_date: '2025-10-01', total: 2600, balance: 1300, status: 'Partially Paid', line_items: [{ description: 'Monthly Rent', amount: 2600 }], created_at: '2025-09-25' },
  { id: 'INV-1005', tenant: 'Mike Davis', tenant_id: 't_005', property: 'Greenway Apts - Unit 110', property_id: 'prop_001', due_date: '2025-12-15', total: 2400, balance: 2400, status: 'Open', line_items: [{ description: 'Monthly Rent', amount: 2400 }], created_at: '2025-12-01' },
  { id: 'INV-1006', tenant: 'Lisa Chen', tenant_id: 't_006', property: 'Greenway Apts - Unit 115', property_id: 'prop_001', due_date: '2025-12-15', total: 2500, balance: 2500, status: 'Open', line_items: [{ description: 'Monthly Rent', amount: 2500 }], created_at: '2025-12-01' },
  { id: 'INV-1007', tenant: 'Tom Brown', tenant_id: 't_007', property: 'Oak Manor - Unit 210', property_id: 'prop_002', due_date: '2025-09-01', total: 2900, balance: 2900, status: 'Overdue', line_items: [{ description: 'Monthly Rent', amount: 2900 }], created_at: '2025-08-25' },
];

// Mock Bills (Accounts Payable)
export const mockBills: Bill[] = [
  { id: 'BILL-3001', vendor: 'ABC HVAC Services', vendor_id: 'v_001', property: 'Greenway Apts', due_date: '2025-12-20', total: 1200, balance: 1200, status: 'Pending', is_1099: true, category: 'Repairs', description: 'HVAC repair - Unit 205', created_at: '2025-12-08' },
  { id: 'BILL-3002', vendor: 'Green Thumb Landscaping', vendor_id: 'v_002', property: 'All Properties', due_date: '2025-12-15', total: 850, balance: 850, status: 'Approved', is_1099: true, category: 'Landscaping', description: 'Monthly grounds maintenance', created_at: '2025-12-01' },
  { id: 'BILL-3003', vendor: 'City Water Dept', vendor_id: 'v_003', property: 'Greenway Apts', due_date: '2025-12-18', total: 2400, balance: 2400, status: 'Pending', is_1099: false, category: 'Utilities', description: 'Water/Sewer - November', created_at: '2025-12-02' },
  { id: 'BILL-3004', vendor: 'SecurePro Locks', vendor_id: 'v_004', property: 'Oak Manor', due_date: '2025-12-10', total: 450, balance: 0, status: 'Paid', is_1099: true, category: 'Repairs', description: 'Lock replacement - Unit 301', created_at: '2025-12-05' },
  { id: 'BILL-3005', vendor: 'Premier Plumbing', vendor_id: 'v_005', property: 'Greenway Apts', due_date: '2025-11-25', total: 1800, balance: 1800, status: 'Pending', is_1099: true, category: 'Repairs', description: 'Emergency pipe repair', created_at: '2025-11-20' },
];

// Mock Payments
export const mockPayments: Payment[] = [
  { id: 'PAY-2001', date: '2025-12-05', type: 'Tenant', payer_payee: 'John Smith', property: 'Greenway Apts', amount: 2500, method: 'ACH', status: 'Cleared', reference: 'INV-1001', linked_entries: ['txn_003', 'txn_004'] },
  { id: 'PAY-2002', date: '2025-12-08', type: 'Vendor', payer_payee: 'SecurePro Locks', property: 'Oak Manor', amount: 450, method: 'Check', status: 'Cleared', reference: 'BILL-3004', linked_entries: [] },
  { id: 'PAY-2003', date: '2025-12-10', type: 'Owner Payout', payer_payee: 'James Owner (Greenway)', property: 'Greenway Apts', amount: 15000, method: 'ACH', status: 'Pending', reference: 'STMT-001', linked_entries: [] },
  { id: 'PAY-2004', date: '2025-12-12', type: 'Tenant', payer_payee: 'Sarah Williams', property: 'Oak Manor', amount: 1300, method: 'Card', status: 'Cleared', reference: 'INV-1004', linked_entries: [] },
  { id: 'PAY-2005', date: '2025-12-01', type: 'Deposit Movement', payer_payee: 'Mike Davis (Move-in)', property: 'Greenway Apts', amount: 2400, method: 'ACH', status: 'Cleared', reference: 'DEP-001', linked_entries: [] },
];

// Mock Security Deposits
export const mockSecurityDeposits: SecurityDeposit[] = [
  { id: 'DEP-001', tenant: 'John Smith', tenant_id: 't_001', property: 'Greenway Apts', unit: 'Unit 101', amount: 2500, held_account: 'Trust Account', status: 'Held', move_in_date: '2024-06-01', notes: 'Standard deposit' },
  { id: 'DEP-002', tenant: 'Jane Doe', tenant_id: 't_002', property: 'Greenway Apts', unit: 'Unit 205', amount: 2800, held_account: 'Trust Account', status: 'Held', move_in_date: '2024-08-15' },
  { id: 'DEP-003', tenant: 'Bob Johnson', tenant_id: 't_003', property: 'Oak Manor', unit: 'Unit 301', amount: 3200, held_account: 'Trust Account', status: 'Held', move_in_date: '2023-03-01' },
  { id: 'DEP-004', tenant: 'Lisa Chen', tenant_id: 't_006', property: 'Greenway Apts', unit: 'Unit 115', amount: 2500, held_account: 'Trust Account', status: 'Held', move_in_date: '2024-11-01' },
  { id: 'DEP-005', tenant: 'Former Tenant A', tenant_id: 't_010', property: 'Oak Manor', unit: 'Unit 102', amount: 2200, held_account: 'Trust Account', status: 'Released', move_in_date: '2022-01-01', notes: 'Full refund - moved out 2024-12-01' },
];

// Mock Owner Statements
export const mockOwnerStatements: OwnerStatement[] = [
  { id: 'STMT-001', owner: 'James Owner', owner_id: 'o_001', property: 'Greenway Apts', property_id: 'prop_001', period_start: '2025-11-01', period_end: '2025-11-30', gross_income: 48000, expenses: 12500, management_fee: 4800, net_to_owner: 30700, status: 'Generated', payout_date: '2025-12-10' },
  { id: 'STMT-002', owner: 'Patricia Holdings LLC', owner_id: 'o_002', property: 'Oak Manor', property_id: 'prop_002', period_start: '2025-11-01', period_end: '2025-11-30', gross_income: 35000, expenses: 8200, management_fee: 3500, net_to_owner: 23300, status: 'Draft' },
  { id: 'STMT-003', owner: 'James Owner', owner_id: 'o_001', property: 'Greenway Apts', property_id: 'prop_001', period_start: '2025-10-01', period_end: '2025-10-31', gross_income: 47500, expenses: 9800, management_fee: 4750, net_to_owner: 32950, status: 'Sent', payout_date: '2025-11-10' },
];

// Mock Audit Logs
export const mockAuditLogs: AuditLog[] = [
  { id: 'audit_001', timestamp: '2025-12-15T10:30:00Z', user: 'Sarah Admin', user_role: 'Admin', action: 'Payment Posted', entity_type: 'Payment', entity_id: 'PAY-2001', new_value: '$2,500 - John Smith', ip_address: '192.168.1.100' },
  { id: 'audit_002', timestamp: '2025-12-15T09:15:00Z', user: 'CFO User', user_role: 'Accountant', action: 'Journal Entry Created', entity_type: 'Transaction', entity_id: 'JE-4001', new_value: 'Insurance allocation $2,500', ip_address: '192.168.1.101' },
  { id: 'audit_003', timestamp: '2025-12-14T16:45:00Z', user: 'Sarah Admin', user_role: 'Admin', action: 'Bill Approved', entity_type: 'Bill', entity_id: 'BILL-3002', old_value: 'Pending', new_value: 'Approved', ip_address: '192.168.1.100' },
  { id: 'audit_004', timestamp: '2025-12-14T14:20:00Z', user: 'System', user_role: 'System', action: 'QuickBooks Sync', entity_type: 'Sync', entity_id: 'sync_1215', new_value: '47 records synced', ip_address: 'N/A' },
  { id: 'audit_005', timestamp: '2025-12-13T11:00:00Z', user: 'CFO User', user_role: 'Accountant', action: 'Report Generated', entity_type: 'Report', entity_id: 'rpt_001', new_value: 'P&L Report - November 2025', ip_address: '192.168.1.101' },
];

// Initial Recent Activity
export const mockRecentActivity: RecentActivity[] = [
  { id: 'act_001', message: 'Payment $2,500 posted to INV-1001', user: 'Sarah Admin', timestamp: '2 min ago', type: 'payment' },
  { id: 'act_002', message: 'Invoice INV-1006 created for Lisa Chen', user: 'System', timestamp: '1 hour ago', type: 'invoice' },
  { id: 'act_003', message: 'QuickBooks sync completed - 47 records', user: 'System', timestamp: '2 hours ago', type: 'sync' },
  { id: 'act_004', message: 'Owner Statement STMT-001 generated', user: 'CFO User', timestamp: '3 hours ago', type: 'statement' },
  { id: 'act_005', message: 'Bill BILL-3002 approved for payment', user: 'Sarah Admin', timestamp: '5 hours ago', type: 'account' },
];

// QuickBooks Integration State
export interface QuickBooksState {
  isConnected: boolean;
  companyName: string;
  lastSyncTime: string;
  recordsSynced: number;
  syncDirection: 'one-way' | 'two-way';
  autoSync: boolean;
  syncInvoices: boolean;
  syncPayments: boolean;
  syncExpenses: boolean;
  accountMappings: { nexusId: string; nexusName: string; qbId: string; qbName: string }[];
  syncLogs: { timestamp: string; status: 'success' | 'error' | 'warning'; message: string; records: number }[];
}

export const mockQuickBooksState: QuickBooksState = {
  isConnected: true,
  companyName: 'Nexus Property Management',
  lastSyncTime: '2025-12-15T08:30:00Z',
  recordsSynced: 1247,
  syncDirection: 'two-way',
  autoSync: true,
  syncInvoices: true,
  syncPayments: true,
  syncExpenses: true,
  accountMappings: [
    { nexusId: '1000', nexusName: 'Operating Cash', qbId: 'qb_1000', qbName: 'Checking Account' },
    { nexusId: '1100', nexusName: 'Accounts Receivable', qbId: 'qb_1100', qbName: 'Accounts Receivable' },
    { nexusId: '2000', nexusName: 'Accounts Payable', qbId: 'qb_2000', qbName: 'Accounts Payable' },
    { nexusId: '4000', nexusName: 'Rental Income', qbId: 'qb_4000', qbName: 'Rental Income' },
  ],
  syncLogs: [
    { timestamp: '2025-12-15T08:30:00Z', status: 'success', message: 'Full sync completed', records: 47 },
    { timestamp: '2025-12-14T08:30:00Z', status: 'success', message: 'Full sync completed', records: 52 },
    { timestamp: '2025-12-13T08:30:00Z', status: 'warning', message: '3 invoices skipped - missing mapping', records: 41 },
    { timestamp: '2025-12-12T08:30:00Z', status: 'success', message: 'Full sync completed', records: 38 },
  ],
};

// Report Templates
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Financial' | 'Operational' | 'Tax';
  icon: string;
}

export const reportTemplates: ReportTemplate[] = [
  { id: 'rpt_pnl', name: 'Profit & Loss', description: 'Income and expenses by property', category: 'Financial', icon: 'TrendingUp' },
  { id: 'rpt_balance', name: 'Balance Sheet', description: 'Assets, liabilities, and equity', category: 'Financial', icon: 'Scale' },
  { id: 'rpt_cashflow', name: 'Cash Flow', description: 'Cash movement analysis', category: 'Financial', icon: 'ArrowRightLeft' },
  { id: 'rpt_rentroll', name: 'Rent Roll', description: 'Current lease and rent summary', category: 'Operational', icon: 'FileText' },
  { id: 'rpt_delinquency', name: 'Delinquency Report', description: 'Overdue balances by tenant', category: 'Operational', icon: 'AlertTriangle' },
  { id: 'rpt_trial', name: 'Trial Balance', description: 'Account balances for period', category: 'Financial', icon: 'ClipboardList' },
  { id: 'rpt_1099', name: '1099 Summary', description: 'Vendor payments for tax reporting', category: 'Tax', icon: 'FileSpreadsheet' },
];

// User Roles for Permissions
export type UserRole = 'Admin' | 'Accountant' | 'Property Manager' | 'Viewer';

export const currentUserRole: UserRole = 'Admin';

// Helper function to calculate aging
export function getAgingBucket(dueDate: string): '0-30' | '31-60' | '61-90' | '90+' {
  const today = new Date('2025-12-15');
  const due = new Date(dueDate);
  const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysOverdue <= 30) return '0-30';
  if (daysOverdue <= 60) return '31-60';
  if (daysOverdue <= 90) return '61-90';
  return '90+';
}

// Helper to calculate AR aging totals
export function calculateARAgingSummary(invoices: Invoice[]) {
  const openInvoices = invoices.filter(i => i.balance > 0);
  const buckets = {
    current: 0,
    '1-30': 0,
    '31-60': 0,
    '61+': 0,
    overdueCount: 0,
  };

  const today = new Date('2025-12-15');
  openInvoices.forEach(inv => {
    const due = new Date(inv.due_date);
    const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysOverdue <= 0) {
      buckets.current += inv.balance;
    } else if (daysOverdue <= 30) {
      buckets['1-30'] += inv.balance;
      buckets.overdueCount++;
    } else if (daysOverdue <= 60) {
      buckets['31-60'] += inv.balance;
      buckets.overdueCount++;
    } else {
      buckets['61+'] += inv.balance;
      buckets.overdueCount++;
    }
  });

  return buckets;
}
