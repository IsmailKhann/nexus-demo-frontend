import { create } from 'zustand';

// Types
export type ChecklistItemStatus = 'missing' | 'uploaded' | 'verified' | 'rejected';
export type ApplicationStatus = 'draft' | 'pending_review' | 'in_screening' | 'manual_review' | 'approved' | 'ready_to_sign' | 'sent_for_signature' | 'signed' | 'rejected';
export type EsignStatus = 'not_sent' | 'sent' | 'signed' | 'expired';
export type UserRole = 'admin' | 'leasing' | 'property_manager' | 'tenant';

export interface ChecklistItem {
  status: ChecklistItemStatus;
  uploadedBy: 'tenant' | 'admin' | null;
  notes: string;
  timestamp: string | null;
  documentIds: string[];
  rejectionReason?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadedBy: 'tenant' | 'admin';
  url: string;
  previewType: 'image' | 'pdf';
  timestamp: string;
  size: number;
  checklistKey?: string;
}

export interface EsignData {
  templateId: string | null;
  status: EsignStatus;
  sentTimestamp: string | null;
  signedTimestamp: string | null;
  expiryDate: string | null;
  signers: Array<{
    name: string;
    email: string;
    role: string;
    signed: boolean;
    signedAt: string | null;
    ip?: string;
    userAgent?: string;
  }>;
  message?: string;
}

export interface ApplicationNote {
  id: string;
  user: string;
  role: UserRole;
  text: string;
  timestamp: string;
}

export interface LeaseData {
  templateId: string;
  templateName: string;
  rent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  duration: number;
  clauses: string[];
  generatedAt: string;
}

export interface Application {
  id: string;
  applicant: {
    name: string;
    email: string;
    phone: string;
  };
  property: string;
  propertyId: string;
  unit: string;
  unitId: string;
  rent: number;
  status: ApplicationStatus;
  createdAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason?: string;
  checklist: {
    id_front: ChecklistItem;
    id_back: ChecklistItem;
    proof_of_income: ChecklistItem;
    paystubs: ChecklistItem;
    gov_id: ChecklistItem;
    credit_report: ChecklistItem;
    eviction_history: ChecklistItem;
    references: ChecklistItem;
  };
  documents: Document[];
  esign: EsignData;
  notes: ApplicationNote[];
  lease: LeaseData | null;
  screeningPassed: boolean;
  manualChecks: {
    [key: string]: {
      completed: boolean;
      note: string;
      completedBy: string;
      timestamp: string | null;
    };
  };
  monthlyIncome: number;
  creditScore: number | null;
  employmentStatus: string;
  pets: boolean;
  coApplicants: Array<{ name: string; relationship: string; income: number }>;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  target: string;
  targetType: 'application' | 'document' | 'lease' | 'esign' | 'payment';
  before: any;
  after: any;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

export interface Notification {
  id: string;
  to: string;
  toRole: UserRole;
  type: 'upload' | 'verify' | 'reject' | 'request_info' | 'esign_sent' | 'esign_signed' | 'approved' | 'rejected' | 'refund';
  message: string;
  timestamp: string;
  read: boolean;
  applicationId?: string;
}

const CHECKLIST_LABELS: Record<string, string> = {
  id_front: 'ID (Front)',
  id_back: 'ID (Back)',
  proof_of_income: 'Proof of Income',
  paystubs: 'Pay Stubs (Last 2 Months)',
  gov_id: 'Government ID',
  credit_report: 'Credit Report Authorization',
  eviction_history: 'Eviction History Check',
  references: 'References',
};

const MANUAL_CHECKS = [
  { key: 'identity_verified', label: 'Identity Verified In-Person' },
  { key: 'references_called', label: 'References Called' },
  { key: 'employment_verified', label: 'Employment Verified' },
  { key: 'background_complete', label: 'Background Check Complete' },
];

const createEmptyChecklist = (): Application['checklist'] => ({
  id_front: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
  id_back: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
  proof_of_income: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
  paystubs: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
  gov_id: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
  credit_report: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
  eviction_history: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
  references: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
});

const createEmptyManualChecks = () => {
  const checks: Application['manualChecks'] = {};
  MANUAL_CHECKS.forEach(check => {
    checks[check.key] = { completed: false, note: '', completedBy: '', timestamp: null };
  });
  return checks;
};

// Initial mock data
const initialApplications: Application[] = [
  {
    id: 'APP-1001',
    applicant: { name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 123-4567' },
    property: 'Greenway Apartments',
    propertyId: 'prop-1',
    unit: 'Unit 101',
    unitId: 'unit-101',
    rent: 2500,
    status: 'pending_review',
    createdAt: '2025-01-15T10:30:00Z',
    submittedAt: '2025-01-15T14:20:00Z',
    approvedAt: null,
    rejectedAt: null,
    checklist: {
      id_front: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-15T14:00:00Z', documentIds: ['doc-1'] },
      id_back: { status: 'uploaded', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-15T14:05:00Z', documentIds: ['doc-2'] },
      proof_of_income: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-15T14:10:00Z', documentIds: ['doc-3'] },
      paystubs: { status: 'uploaded', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-15T14:12:00Z', documentIds: ['doc-4', 'doc-5'] },
      gov_id: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
      credit_report: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-15T14:15:00Z', documentIds: ['doc-6'] },
      eviction_history: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
      references: { status: 'uploaded', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-15T14:18:00Z', documentIds: ['doc-7'] },
    },
    documents: [
      { id: 'doc-1', name: 'drivers_license_front.jpg', type: 'id_front', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'image', timestamp: '2025-01-15T14:00:00Z', size: 245000, checklistKey: 'id_front' },
      { id: 'doc-2', name: 'drivers_license_back.jpg', type: 'id_back', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'image', timestamp: '2025-01-15T14:05:00Z', size: 198000, checklistKey: 'id_back' },
      { id: 'doc-3', name: 'employment_letter.pdf', type: 'proof_of_income', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'pdf', timestamp: '2025-01-15T14:10:00Z', size: 89000, checklistKey: 'proof_of_income' },
      { id: 'doc-4', name: 'paystub_dec.pdf', type: 'paystubs', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'pdf', timestamp: '2025-01-15T14:12:00Z', size: 67000, checklistKey: 'paystubs' },
      { id: 'doc-5', name: 'paystub_nov.pdf', type: 'paystubs', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'pdf', timestamp: '2025-01-15T14:12:00Z', size: 65000, checklistKey: 'paystubs' },
      { id: 'doc-6', name: 'credit_authorization.pdf', type: 'credit_report', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'pdf', timestamp: '2025-01-15T14:15:00Z', size: 45000, checklistKey: 'credit_report' },
      { id: 'doc-7', name: 'references_list.pdf', type: 'references', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'pdf', timestamp: '2025-01-15T14:18:00Z', size: 32000, checklistKey: 'references' },
    ],
    esign: { templateId: null, status: 'not_sent', sentTimestamp: null, signedTimestamp: null, expiryDate: null, signers: [] },
    notes: [
      { id: 'note-1', user: 'Admin User', role: 'admin', text: 'Excellent credit history, stable employment', timestamp: '2025-01-16T09:00:00Z' },
    ],
    lease: null,
    screeningPassed: false,
    manualChecks: createEmptyManualChecks(),
    monthlyIncome: 6500,
    creditScore: 720,
    employmentStatus: 'full_time',
    pets: true,
    coApplicants: [{ name: 'Michael Johnson', relationship: 'spouse', income: 5800 }],
  },
  {
    id: 'APP-1002',
    applicant: { name: 'David Chen', email: 'd.chen@email.com', phone: '(555) 234-5678' },
    property: 'Harbor View Apartments',
    propertyId: 'prop-2',
    unit: 'Unit 205',
    unitId: 'unit-205',
    rent: 3200,
    status: 'ready_to_sign',
    createdAt: '2025-01-14T09:15:00Z',
    submittedAt: '2025-01-14T16:45:00Z',
    approvedAt: '2025-01-16T11:20:00Z',
    rejectedAt: null,
    checklist: {
      id_front: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-14T16:00:00Z', documentIds: ['doc-10'] },
      id_back: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-14T16:05:00Z', documentIds: ['doc-11'] },
      proof_of_income: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-14T16:10:00Z', documentIds: ['doc-12'] },
      paystubs: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-14T16:15:00Z', documentIds: ['doc-13'] },
      gov_id: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-14T16:20:00Z', documentIds: ['doc-14'] },
      credit_report: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-14T16:25:00Z', documentIds: ['doc-15'] },
      eviction_history: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-14T16:30:00Z', documentIds: ['doc-16'] },
      references: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-14T16:35:00Z', documentIds: ['doc-17'] },
    },
    documents: [
      { id: 'doc-10', name: 'passport.jpg', type: 'id_front', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'image', timestamp: '2025-01-14T16:00:00Z', size: 320000, checklistKey: 'id_front' },
      { id: 'doc-11', name: 'passport_back.jpg', type: 'id_back', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'image', timestamp: '2025-01-14T16:05:00Z', size: 280000, checklistKey: 'id_back' },
      { id: 'doc-12', name: 'employment_letter.pdf', type: 'proof_of_income', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'pdf', timestamp: '2025-01-14T16:10:00Z', size: 95000, checklistKey: 'proof_of_income' },
      { id: 'doc-13', name: 'paystubs.pdf', type: 'paystubs', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'pdf', timestamp: '2025-01-14T16:15:00Z', size: 78000, checklistKey: 'paystubs' },
      { id: 'doc-14', name: 'ssn_card.jpg', type: 'gov_id', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'image', timestamp: '2025-01-14T16:20:00Z', size: 156000, checklistKey: 'gov_id' },
      { id: 'doc-15', name: 'credit_auth.pdf', type: 'credit_report', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'pdf', timestamp: '2025-01-14T16:25:00Z', size: 42000, checklistKey: 'credit_report' },
      { id: 'doc-16', name: 'eviction_clearance.pdf', type: 'eviction_history', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'pdf', timestamp: '2025-01-14T16:30:00Z', size: 38000, checklistKey: 'eviction_history' },
      { id: 'doc-17', name: 'references.pdf', type: 'references', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'pdf', timestamp: '2025-01-14T16:35:00Z', size: 29000, checklistKey: 'references' },
    ],
    esign: { templateId: null, status: 'not_sent', sentTimestamp: null, signedTimestamp: null, expiryDate: null, signers: [] },
    notes: [],
    lease: {
      templateId: 'standard',
      templateName: 'Standard Residential Lease',
      rent: 3200,
      securityDeposit: 3200,
      startDate: '2025-02-01',
      endDate: '2026-01-31',
      duration: 12,
      clauses: ['pets', 'parking'],
      generatedAt: '2025-01-16T12:00:00Z',
    },
    screeningPassed: true,
    manualChecks: {
      identity_verified: { completed: true, note: 'Verified in office', completedBy: 'Admin User', timestamp: '2025-01-15T10:00:00Z' },
      references_called: { completed: true, note: 'Both references confirmed', completedBy: 'Leasing Agent', timestamp: '2025-01-15T11:00:00Z' },
      employment_verified: { completed: true, note: 'HR confirmed employment', completedBy: 'Admin User', timestamp: '2025-01-15T14:00:00Z' },
      background_complete: { completed: true, note: 'Clear background', completedBy: 'Admin User', timestamp: '2025-01-16T09:00:00Z' },
    },
    monthlyIncome: 8200,
    creditScore: 780,
    employmentStatus: 'full_time',
    pets: false,
    coApplicants: [],
  },
  {
    id: 'APP-1003',
    applicant: { name: 'Emily Rodriguez', email: 'emily.r@email.com', phone: '(555) 345-6789' },
    property: 'Downtown Lofts',
    propertyId: 'prop-3',
    unit: 'Unit 302',
    unitId: 'unit-302',
    rent: 2800,
    status: 'in_screening',
    createdAt: '2025-01-17T13:00:00Z',
    submittedAt: '2025-01-17T15:30:00Z',
    approvedAt: null,
    rejectedAt: null,
    checklist: {
      id_front: { status: 'uploaded', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-17T15:00:00Z', documentIds: ['doc-20'] },
      id_back: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
      proof_of_income: { status: 'rejected', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-17T15:10:00Z', documentIds: ['doc-21'], rejectionReason: 'Document is blurry, please re-upload a clearer copy' },
      paystubs: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
      gov_id: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
      credit_report: { status: 'uploaded', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-17T15:20:00Z', documentIds: ['doc-22'] },
      eviction_history: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
      references: { status: 'missing', uploadedBy: null, notes: '', timestamp: null, documentIds: [] },
    },
    documents: [
      { id: 'doc-20', name: 'id_front.jpg', type: 'id_front', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'image', timestamp: '2025-01-17T15:00:00Z', size: 210000, checklistKey: 'id_front' },
      { id: 'doc-21', name: 'income_proof_blurry.jpg', type: 'proof_of_income', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'image', timestamp: '2025-01-17T15:10:00Z', size: 156000, checklistKey: 'proof_of_income' },
      { id: 'doc-22', name: 'credit_auth.pdf', type: 'credit_report', uploadedBy: 'tenant', url: '/placeholder.svg', previewType: 'pdf', timestamp: '2025-01-17T15:20:00Z', size: 44000, checklistKey: 'credit_report' },
    ],
    esign: { templateId: null, status: 'not_sent', sentTimestamp: null, signedTimestamp: null, expiryDate: null, signers: [] },
    notes: [],
    lease: null,
    screeningPassed: false,
    manualChecks: createEmptyManualChecks(),
    monthlyIncome: 5200,
    creditScore: null,
    employmentStatus: 'full_time',
    pets: true,
    coApplicants: [],
  },
  {
    id: 'APP-1004',
    applicant: { name: 'Marcus Thompson', email: 'm.thompson@email.com', phone: '(555) 456-7890' },
    property: 'Riverside Commons',
    propertyId: 'prop-4',
    unit: 'Unit 410',
    unitId: 'unit-410',
    rent: 2200,
    status: 'signed',
    createdAt: '2025-01-10T09:00:00Z',
    submittedAt: '2025-01-10T14:20:00Z',
    approvedAt: '2025-01-12T10:15:00Z',
    rejectedAt: null,
    checklist: {
      id_front: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-10T14:00:00Z', documentIds: ['doc-30'] },
      id_back: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-10T14:02:00Z', documentIds: ['doc-31'] },
      proof_of_income: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-10T14:05:00Z', documentIds: ['doc-32'] },
      paystubs: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-10T14:08:00Z', documentIds: ['doc-33'] },
      gov_id: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-10T14:10:00Z', documentIds: ['doc-34'] },
      credit_report: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-10T14:12:00Z', documentIds: ['doc-35'] },
      eviction_history: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-10T14:14:00Z', documentIds: ['doc-36'] },
      references: { status: 'verified', uploadedBy: 'tenant', notes: '', timestamp: '2025-01-10T14:16:00Z', documentIds: ['doc-37'] },
    },
    documents: [],
    esign: {
      templateId: 'standard',
      status: 'signed',
      sentTimestamp: '2025-01-12T14:00:00Z',
      signedTimestamp: '2025-01-13T10:30:00Z',
      expiryDate: '2025-01-19T14:00:00Z',
      signers: [
        { name: 'Marcus Thompson', email: 'm.thompson@email.com', role: 'tenant', signed: true, signedAt: '2025-01-13T10:30:00Z', ip: '192.168.1.100', userAgent: 'Mozilla/5.0' },
      ],
    },
    notes: [],
    lease: {
      templateId: 'standard',
      templateName: 'Standard Residential Lease',
      rent: 2200,
      securityDeposit: 2200,
      startDate: '2025-02-01',
      endDate: '2026-01-31',
      duration: 12,
      clauses: [],
      generatedAt: '2025-01-12T11:00:00Z',
    },
    screeningPassed: true,
    manualChecks: {
      identity_verified: { completed: true, note: 'Verified', completedBy: 'Admin', timestamp: '2025-01-11T10:00:00Z' },
      references_called: { completed: true, note: 'Confirmed', completedBy: 'Admin', timestamp: '2025-01-11T11:00:00Z' },
      employment_verified: { completed: true, note: 'Verified', completedBy: 'Admin', timestamp: '2025-01-11T12:00:00Z' },
      background_complete: { completed: true, note: 'Clear', completedBy: 'Admin', timestamp: '2025-01-11T14:00:00Z' },
    },
    monthlyIncome: 7100,
    creditScore: 680,
    employmentStatus: 'self_employed',
    pets: false,
    coApplicants: [],
  },
];

const initialAuditLogs: AuditLogEntry[] = [
  { id: 'log-1', actor: 'Admin User', actorRole: 'admin', action: 'Document Verified', target: 'APP-1001', targetType: 'document', before: { status: 'uploaded' }, after: { status: 'verified' }, timestamp: '2025-01-16T09:00:00Z' },
  { id: 'log-2', actor: 'System', actorRole: 'admin', action: 'Lease Generated', target: 'APP-1002', targetType: 'lease', before: null, after: { templateId: 'standard' }, timestamp: '2025-01-16T12:00:00Z' },
  { id: 'log-3', actor: 'Marcus Thompson', actorRole: 'tenant', action: 'Lease Signed', target: 'APP-1004', targetType: 'esign', before: { status: 'sent' }, after: { status: 'signed' }, timestamp: '2025-01-13T10:30:00Z' },
];

const initialNotifications: Notification[] = [
  { id: 'notif-1', to: 'admin', toRole: 'admin', type: 'upload', message: 'Sarah Johnson uploaded new documents for APP-1001', timestamp: '2025-01-15T14:20:00Z', read: false, applicationId: 'APP-1001' },
  { id: 'notif-2', to: 'emily.r@email.com', toRole: 'tenant', type: 'reject', message: 'Your proof of income document was rejected. Please upload a clearer copy.', timestamp: '2025-01-17T16:00:00Z', read: false, applicationId: 'APP-1003' },
];

interface ApplicationsStore {
  applications: Application[];
  auditLogs: AuditLogEntry[];
  notifications: Notification[];
  currentUser: { name: string; role: UserRole };
  
  // Getters
  getApplication: (id: string) => Application | undefined;
  getChecklistStats: (id: string) => { uploaded: number; verified: number; total: number };
  
  // Application actions
  updateApplicationStatus: (id: string, status: ApplicationStatus, reason?: string) => void;
  
  // Document actions
  uploadDocument: (applicationId: string, checklistKey: string, file: { name: string; type: string; size: number }) => void;
  verifyDocument: (applicationId: string, checklistKey: string, verifiedBy: string) => void;
  rejectDocument: (applicationId: string, checklistKey: string, reason: string, rejectedBy: string) => void;
  requestMoreInfo: (applicationId: string, checklistKey: string, message: string) => void;
  
  // Note actions
  addNote: (applicationId: string, text: string) => void;
  
  // Manual checks
  toggleManualCheck: (applicationId: string, checkKey: string, note: string) => void;
  
  // Screening
  markScreeningPassed: (applicationId: string) => void;
  
  // Lease actions
  generateLease: (applicationId: string, leaseData: Omit<LeaseData, 'generatedAt'>) => void;
  
  // E-sign actions
  sendForSignature: (applicationId: string, signers: Array<{ name: string; email: string; role: string }>, message: string, expiryDays: number) => void;
  signLease: (applicationId: string, signerEmail: string) => void;
  
  // Notification actions
  markNotificationRead: (id: string) => void;
  getUnreadNotifications: (role: UserRole) => Notification[];
  
  // Audit
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
}

export const useApplicationsStore = create<ApplicationsStore>((set, get) => ({
  applications: initialApplications,
  auditLogs: initialAuditLogs,
  notifications: initialNotifications,
  currentUser: { name: 'Admin User', role: 'admin' },
  
  getApplication: (id) => get().applications.find(app => app.id === id),
  
  getChecklistStats: (id) => {
    const app = get().getApplication(id);
    if (!app) return { uploaded: 0, verified: 0, total: 8 };
    const items = Object.values(app.checklist) as ChecklistItem[];
    return {
      uploaded: items.filter(i => i.status === 'uploaded' || i.status === 'verified').length,
      verified: items.filter(i => i.status === 'verified').length,
      total: items.length,
    };
  },
  
  updateApplicationStatus: (id, status, reason) => {
    set(state => ({
      applications: state.applications.map(app => {
        if (app.id !== id) return app;
        const updates: Partial<Application> = { status };
        if (status === 'approved') updates.approvedAt = new Date().toISOString();
        if (status === 'rejected') {
          updates.rejectedAt = new Date().toISOString();
          updates.rejectionReason = reason;
        }
        return { ...app, ...updates };
      }),
    }));
    get().addAuditLog({
      actor: get().currentUser.name,
      actorRole: get().currentUser.role,
      action: `Application ${status}`,
      target: id,
      targetType: 'application',
      before: { status: get().getApplication(id)?.status },
      after: { status, reason },
    });
  },
  
  uploadDocument: (applicationId, checklistKey, file) => {
    const docId = `doc-${Date.now()}`;
    const now = new Date().toISOString();
    
    set(state => ({
      applications: state.applications.map(app => {
        if (app.id !== applicationId) return app;
        const newDoc: Document = {
          id: docId,
          name: file.name,
          type: checklistKey,
          uploadedBy: 'tenant',
          url: '/placeholder.svg',
          previewType: file.type.includes('pdf') ? 'pdf' : 'image',
          timestamp: now,
          size: file.size,
          checklistKey,
        };
        const checklist = { ...app.checklist };
        const key = checklistKey as keyof typeof checklist;
        checklist[key] = {
          ...checklist[key],
          status: 'uploaded',
          uploadedBy: 'tenant',
          timestamp: now,
          documentIds: [...checklist[key].documentIds, docId],
        };
        return { ...app, documents: [...app.documents, newDoc], checklist };
      }),
      notifications: [
        ...state.notifications,
        {
          id: `notif-${Date.now()}`,
          to: 'admin',
          toRole: 'admin',
          type: 'upload',
          message: `New document uploaded for ${applicationId}: ${file.name}`,
          timestamp: now,
          read: false,
          applicationId,
        },
      ],
    }));
    
    get().addAuditLog({
      actor: 'Tenant',
      actorRole: 'tenant',
      action: 'Document Uploaded',
      target: applicationId,
      targetType: 'document',
      before: null,
      after: { checklistKey, fileName: file.name },
    });
  },
  
  verifyDocument: (applicationId, checklistKey, verifiedBy) => {
    set(state => ({
      applications: state.applications.map(app => {
        if (app.id !== applicationId) return app;
        const checklist = { ...app.checklist };
        const key = checklistKey as keyof typeof checklist;
        checklist[key] = { ...checklist[key], status: 'verified' };
        return { ...app, checklist };
      }),
    }));
    
    get().addAuditLog({
      actor: verifiedBy,
      actorRole: get().currentUser.role,
      action: 'Document Verified',
      target: applicationId,
      targetType: 'document',
      before: { status: 'uploaded' },
      after: { status: 'verified', checklistKey },
    });
  },
  
  rejectDocument: (applicationId, checklistKey, reason, rejectedBy) => {
    const now = new Date().toISOString();
    const app = get().getApplication(applicationId);
    
    set(state => ({
      applications: state.applications.map(app => {
        if (app.id !== applicationId) return app;
        const checklist = { ...app.checklist };
        const key = checklistKey as keyof typeof checklist;
        checklist[key] = { ...checklist[key], status: 'rejected', rejectionReason: reason };
        return { ...app, checklist };
      }),
      notifications: [
        ...state.notifications,
        {
          id: `notif-${Date.now()}`,
          to: app?.applicant.email || '',
          toRole: 'tenant',
          type: 'reject',
          message: `Your ${CHECKLIST_LABELS[checklistKey] || checklistKey} document was rejected: ${reason}`,
          timestamp: now,
          read: false,
          applicationId,
        },
      ],
    }));
    
    get().addAuditLog({
      actor: rejectedBy,
      actorRole: get().currentUser.role,
      action: 'Document Rejected',
      target: applicationId,
      targetType: 'document',
      before: { status: 'uploaded' },
      after: { status: 'rejected', checklistKey, reason },
    });
  },
  
  requestMoreInfo: (applicationId, checklistKey, message) => {
    const now = new Date().toISOString();
    const app = get().getApplication(applicationId);
    
    set(state => ({
      notifications: [
        ...state.notifications,
        {
          id: `notif-${Date.now()}`,
          to: app?.applicant.email || '',
          toRole: 'tenant',
          type: 'request_info',
          message: `More information requested for ${CHECKLIST_LABELS[checklistKey] || checklistKey}: ${message}`,
          timestamp: now,
          read: false,
          applicationId,
        },
      ],
    }));
    
    get().addAuditLog({
      actor: get().currentUser.name,
      actorRole: get().currentUser.role,
      action: 'Requested More Info',
      target: applicationId,
      targetType: 'document',
      before: null,
      after: { checklistKey, message },
    });
  },
  
  addNote: (applicationId, text) => {
    const note: ApplicationNote = {
      id: `note-${Date.now()}`,
      user: get().currentUser.name,
      role: get().currentUser.role,
      text,
      timestamp: new Date().toISOString(),
    };
    
    set(state => ({
      applications: state.applications.map(app =>
        app.id === applicationId ? { ...app, notes: [...app.notes, note] } : app
      ),
    }));
  },
  
  toggleManualCheck: (applicationId, checkKey, note) => {
    const now = new Date().toISOString();
    
    set(state => ({
      applications: state.applications.map(app => {
        if (app.id !== applicationId) return app;
        const manualChecks = { ...app.manualChecks };
        const wasCompleted = manualChecks[checkKey]?.completed;
        manualChecks[checkKey] = {
          completed: !wasCompleted,
          note: note || manualChecks[checkKey]?.note || '',
          completedBy: get().currentUser.name,
          timestamp: !wasCompleted ? now : null,
        };
        return { ...app, manualChecks };
      }),
    }));
    
    get().addAuditLog({
      actor: get().currentUser.name,
      actorRole: get().currentUser.role,
      action: 'Manual Check Updated',
      target: applicationId,
      targetType: 'application',
      before: null,
      after: { checkKey, note },
    });
  },
  
  markScreeningPassed: (applicationId) => {
    set(state => ({
      applications: state.applications.map(app =>
        app.id === applicationId ? { ...app, screeningPassed: true, status: 'approved' as ApplicationStatus, approvedAt: new Date().toISOString() } : app
      ),
    }));
    
    get().addAuditLog({
      actor: get().currentUser.name,
      actorRole: get().currentUser.role,
      action: 'Screening Passed',
      target: applicationId,
      targetType: 'application',
      before: { screeningPassed: false },
      after: { screeningPassed: true },
    });
  },
  
  generateLease: (applicationId, leaseData) => {
    const now = new Date().toISOString();
    const lease: LeaseData = { ...leaseData, generatedAt: now };
    
    set(state => ({
      applications: state.applications.map(app =>
        app.id === applicationId ? { ...app, lease, status: 'ready_to_sign' as ApplicationStatus } : app
      ),
    }));
    
    get().addAuditLog({
      actor: get().currentUser.name,
      actorRole: get().currentUser.role,
      action: 'Lease Generated',
      target: applicationId,
      targetType: 'lease',
      before: null,
      after: lease,
    });
  },
  
  sendForSignature: (applicationId, signers, message, expiryDays) => {
    const now = new Date().toISOString();
    const expiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();
    const app = get().getApplication(applicationId);
    
    set(state => ({
      applications: state.applications.map(app => {
        if (app.id !== applicationId) return app;
        return {
          ...app,
          status: 'sent_for_signature' as ApplicationStatus,
          esign: {
            templateId: app.lease?.templateId || 'standard',
            status: 'sent',
            sentTimestamp: now,
            signedTimestamp: null,
            expiryDate,
            signers: signers.map(s => ({ ...s, signed: false, signedAt: null })),
            message,
          },
        };
      }),
      notifications: [
        ...state.notifications,
        ...signers.map(signer => ({
          id: `notif-${Date.now()}-${signer.email}`,
          to: signer.email,
          toRole: 'tenant' as UserRole,
          type: 'esign_sent' as const,
          message: `You have a lease agreement to sign for ${app?.property}. Please review and sign.`,
          timestamp: now,
          read: false,
          applicationId,
        })),
      ],
    }));
    
    get().addAuditLog({
      actor: get().currentUser.name,
      actorRole: get().currentUser.role,
      action: 'Lease Sent for Signature',
      target: applicationId,
      targetType: 'esign',
      before: { status: 'not_sent' },
      after: { status: 'sent', signers: signers.map(s => s.email) },
    });
  },
  
  signLease: (applicationId, signerEmail) => {
    const now = new Date().toISOString();
    const app = get().getApplication(applicationId);
    
    set(state => ({
      applications: state.applications.map(app => {
        if (app.id !== applicationId) return app;
        const signers = app.esign.signers.map(s =>
          s.email === signerEmail
            ? { ...s, signed: true, signedAt: now, ip: '192.168.1.1', userAgent: navigator.userAgent }
            : s
        );
        const allSigned = signers.every(s => s.signed);
        return {
          ...app,
          status: allSigned ? 'signed' as ApplicationStatus : app.status,
          esign: {
            ...app.esign,
            status: allSigned ? 'signed' : 'sent',
            signedTimestamp: allSigned ? now : null,
            signers,
          },
        };
      }),
      notifications: [
        ...state.notifications,
        {
          id: `notif-${Date.now()}`,
          to: 'admin',
          toRole: 'admin',
          type: 'esign_signed',
          message: `${signerEmail} has signed the lease for ${app?.property}`,
          timestamp: now,
          read: false,
          applicationId,
        },
      ],
    }));
    
    get().addAuditLog({
      actor: signerEmail,
      actorRole: 'tenant',
      action: 'Lease Signed',
      target: applicationId,
      targetType: 'esign',
      before: { signed: false },
      after: { signed: true, signedAt: now, ip: '192.168.1.1' },
    });
  },
  
  markNotificationRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },
  
  getUnreadNotifications: (role) => {
    return get().notifications.filter(n => !n.read && n.toRole === role);
  },
  
  addAuditLog: (entry) => {
    const log: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    set(state => ({ auditLogs: [log, ...state.auditLogs] }));
  },
}));

export { CHECKLIST_LABELS, MANUAL_CHECKS };
