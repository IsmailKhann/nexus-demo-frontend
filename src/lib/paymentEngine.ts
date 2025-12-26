// Simulated Payment Engine for Demo
// Supports card, ACH, recurring execution, refunds, and payout simulation

export interface PaymentMethod {
  id: string;
  type: 'card' | 'ach';
  last4: string;
  brand?: string; // For cards: Visa, Mastercard, etc.
  bankName?: string; // For ACH
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
  nickname?: string;
}

export interface RecurringPlan {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  property: string;
  unit: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  nextRunDate: string;
  paymentMethodId: string;
  status: 'active' | 'paused' | 'cancelled';
  createdAt: string;
  lastRunDate?: string;
  lastRunStatus?: 'success' | 'failed';
}

export interface TenantInvoice {
  id: string;
  tenantId: string;
  property: string;
  unit: string;
  description: string;
  billingPeriod?: string;
  chargeType: 'rent' | 'utility' | 'fee' | 'other';
  amount: number;
  balance: number;
  dueDate: string;
  status: 'open' | 'overdue' | 'paid' | 'partial';
  createdAt: string;
  paidAt?: string;
  lineItems: { description: string; amount: number }[];
}

export interface TenantPayment {
  id: string;
  tenantId: string;
  invoiceId?: string;
  amount: number;
  method: 'card' | 'ach';
  methodLast4: string;
  status: 'pending' | 'processing' | 'cleared' | 'failed' | 'refunded' | 'partial_refund';
  date: string;
  reference: string;
  description: string;
  receiptUrl?: string;
  refundAmount?: number;
  refundDate?: string;
  refundReason?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  status: 'cleared' | 'pending' | 'failed';
}

// Simulate processing delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Demo toggle for simulating failures
let simulateFailure = false;

export const setSimulateFailure = (fail: boolean) => {
  simulateFailure = fail;
};

// Process a card payment (instant)
export const processCardPayment = async (
  amount: number,
  paymentMethodId: string
): Promise<PaymentResult> => {
  await delay(1500); // Simulate processing

  if (simulateFailure || Math.random() < 0.05) {
    return {
      success: false,
      message: 'Card declined. Please try a different payment method.',
      status: 'failed',
    };
  }

  return {
    success: true,
    transactionId: `txn_${Date.now()}`,
    message: 'Payment successful',
    status: 'cleared',
  };
};

// Process an ACH payment (pending -> cleared)
export const processACHPayment = async (
  amount: number,
  paymentMethodId: string
): Promise<PaymentResult> => {
  await delay(1000);

  if (simulateFailure) {
    return {
      success: false,
      message: 'ACH transfer failed. Insufficient funds.',
      status: 'failed',
    };
  }

  return {
    success: true,
    transactionId: `ach_${Date.now()}`,
    message: 'ACH initiated. Funds will clear in 2-3 business days.',
    status: 'pending',
  };
};

// Process a refund
export const processRefund = async (
  paymentId: string,
  amount: number
): Promise<PaymentResult> => {
  await delay(1200);

  return {
    success: true,
    transactionId: `ref_${Date.now()}`,
    message: 'Refund processed successfully',
    status: 'pending',
  };
};

// Simulate clearing pending ACH payments
export const clearPendingACH = async (
  payments: TenantPayment[]
): Promise<string[]> => {
  await delay(500);
  
  const pendingACH = payments.filter(
    p => p.method === 'ach' && p.status === 'pending'
  );
  
  return pendingACH.map(p => p.id);
};

// Run recurring payment
export const runRecurringPayment = async (
  plan: RecurringPlan,
  paymentMethod: PaymentMethod
): Promise<PaymentResult> => {
  if (paymentMethod.type === 'card') {
    return processCardPayment(plan.amount, paymentMethod.id);
  } else {
    return processACHPayment(plan.amount, paymentMethod.id);
  }
};

// Calculate next run date based on frequency
export const calculateNextRunDate = (
  currentDate: string,
  frequency: RecurringPlan['frequency']
): string => {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }
  
  return date.toISOString().split('T')[0];
};

// Mock payment methods for demo tenant
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_001',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    isDefault: true,
    expiryMonth: 12,
    expiryYear: 2027,
    nickname: 'Personal Visa',
  },
  {
    id: 'pm_002',
    type: 'card',
    last4: '1234',
    brand: 'Mastercard',
    isDefault: false,
    expiryMonth: 6,
    expiryYear: 2026,
    nickname: 'Work Card',
  },
  {
    id: 'pm_003',
    type: 'ach',
    last4: '6789',
    bankName: 'Chase Bank',
    isDefault: false,
    nickname: 'Checking Account',
  },
];

// Mock recurring plans
export const mockRecurringPlans: RecurringPlan[] = [
  {
    id: 'rp_001',
    tenantId: 't_001',
    tenantName: 'John Smith',
    propertyId: 'prop_001',
    property: 'Greenway Apts',
    unit: 'Unit 101',
    amount: 2500,
    frequency: 'monthly',
    nextRunDate: '2026-01-01',
    paymentMethodId: 'pm_001',
    status: 'active',
    createdAt: '2024-06-01',
    lastRunDate: '2025-12-01',
    lastRunStatus: 'success',
  },
  {
    id: 'rp_002',
    tenantId: 't_002',
    tenantName: 'Jane Doe',
    propertyId: 'prop_001',
    property: 'Greenway Apts',
    unit: 'Unit 205',
    amount: 2800,
    frequency: 'monthly',
    nextRunDate: '2026-01-01',
    paymentMethodId: 'pm_001',
    status: 'paused',
    createdAt: '2024-08-15',
    lastRunDate: '2025-11-01',
    lastRunStatus: 'failed',
  },
  {
    id: 'rp_003',
    tenantId: 't_003',
    tenantName: 'Bob Johnson',
    propertyId: 'prop_002',
    property: 'Oak Manor',
    unit: 'Unit 301',
    amount: 3200,
    frequency: 'monthly',
    nextRunDate: '2026-01-01',
    paymentMethodId: 'pm_003',
    status: 'active',
    createdAt: '2023-03-01',
    lastRunDate: '2025-12-01',
    lastRunStatus: 'success',
  },
  {
    id: 'rp_004',
    tenantId: 't_005',
    tenantName: 'Mike Davis',
    propertyId: 'prop_001',
    property: 'Greenway Apts',
    unit: 'Unit 110',
    amount: 2400,
    frequency: 'monthly',
    nextRunDate: '2026-01-01',
    paymentMethodId: 'pm_002',
    status: 'active',
    createdAt: '2024-11-01',
    lastRunDate: '2025-12-01',
    lastRunStatus: 'success',
  },
];

// Mock tenant invoices (for current demo tenant)
export const mockTenantInvoices: TenantInvoice[] = [
  {
    id: 'tinv_001',
    tenantId: 't_demo',
    property: 'Greenway Apts',
    unit: 'Unit 101',
    description: 'January 2026 Rent',
    billingPeriod: 'Jan 1 - Jan 31, 2026',
    chargeType: 'rent',
    amount: 2500,
    balance: 2500,
    dueDate: '2026-01-05',
    status: 'open',
    createdAt: '2025-12-20',
    lineItems: [
      { description: 'Monthly Rent', amount: 2400 },
      { description: 'Pet Fee', amount: 100 },
    ],
  },
  {
    id: 'tinv_005',
    tenantId: 't_demo',
    property: 'Greenway Apts',
    unit: 'Unit 101',
    description: 'Water Bill - December',
    billingPeriod: 'Dec 1 - Dec 31, 2025',
    chargeType: 'utility',
    amount: 85,
    balance: 85,
    dueDate: '2026-01-10',
    status: 'open',
    createdAt: '2025-12-28',
    lineItems: [
      { description: 'Water Usage', amount: 65 },
      { description: 'Sewer Fee', amount: 20 },
    ],
  },
  {
    id: 'tinv_002',
    tenantId: 't_demo',
    property: 'Greenway Apts',
    unit: 'Unit 101',
    description: 'December 2025 Rent',
    billingPeriod: 'Dec 1 - Dec 31, 2025',
    chargeType: 'rent',
    amount: 2500,
    balance: 0,
    dueDate: '2025-12-05',
    status: 'paid',
    createdAt: '2025-11-20',
    paidAt: '2025-12-03',
    lineItems: [
      { description: 'Monthly Rent', amount: 2400 },
      { description: 'Pet Fee', amount: 100 },
    ],
  },
  {
    id: 'tinv_003',
    tenantId: 't_demo',
    property: 'Greenway Apts',
    unit: 'Unit 101',
    description: 'November 2025 Rent',
    billingPeriod: 'Nov 1 - Nov 30, 2025',
    chargeType: 'rent',
    amount: 2500,
    balance: 0,
    dueDate: '2025-11-05',
    status: 'paid',
    createdAt: '2025-10-20',
    paidAt: '2025-11-02',
    lineItems: [
      { description: 'Monthly Rent', amount: 2400 },
      { description: 'Pet Fee', amount: 100 },
    ],
  },
  {
    id: 'tinv_004',
    tenantId: 't_demo',
    property: 'Greenway Apts',
    unit: 'Unit 101',
    description: 'Late Fee - November',
    chargeType: 'fee',
    amount: 75,
    balance: 75,
    dueDate: '2025-12-20',
    status: 'overdue',
    createdAt: '2025-11-10',
    lineItems: [
      { description: 'Late Payment Fee', amount: 75 },
    ],
  },
];

// Mock tenant payment history
export const mockTenantPayments: TenantPayment[] = [
  {
    id: 'tpay_001',
    tenantId: 't_demo',
    invoiceId: 'tinv_002',
    amount: 2500,
    method: 'card',
    methodLast4: '4242',
    status: 'cleared',
    date: '2025-12-03',
    reference: 'PAY-DEC2025',
    description: 'December 2025 Rent Payment',
    receiptUrl: '#',
  },
  {
    id: 'tpay_002',
    tenantId: 't_demo',
    invoiceId: 'tinv_003',
    amount: 2500,
    method: 'ach',
    methodLast4: '6789',
    status: 'cleared',
    date: '2025-11-02',
    reference: 'PAY-NOV2025',
    description: 'November 2025 Rent Payment',
    receiptUrl: '#',
  },
  {
    id: 'tpay_003',
    tenantId: 't_demo',
    invoiceId: undefined,
    amount: 2500,
    method: 'card',
    methodLast4: '4242',
    status: 'partial_refund',
    date: '2025-10-01',
    reference: 'PAY-OCT2025',
    description: 'October 2025 Rent Payment',
    receiptUrl: '#',
    refundAmount: 200,
    refundDate: '2025-10-15',
    refundReason: 'Maintenance credit applied',
  },
  {
    id: 'tpay_004',
    tenantId: 't_demo',
    invoiceId: undefined,
    amount: 2500,
    method: 'ach',
    methodLast4: '6789',
    status: 'refunded',
    date: '2025-09-01',
    reference: 'PAY-SEP2025',
    description: 'September 2025 Rent Payment',
    receiptUrl: '#',
    refundAmount: 2500,
    refundDate: '2025-09-05',
    refundReason: 'Duplicate payment refund',
  },
];

// Mock security deposit for tenant
export const mockTenantDeposit = {
  amount: 2500,
  heldSince: '2024-06-01',
  status: 'held' as const,
  history: [
    { date: '2024-06-01', description: 'Security deposit received', amount: 2500 },
  ],
};
