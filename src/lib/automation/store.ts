// Automation State Store
// In-memory state management for drip sequence execution
// All state persists across component re-renders but not page reloads (client-side only)

import {
  automations as baseAutomations,
  automationSteps as baseSteps,
  automationLogs as baseLogs,
  templates as baseTemplates,
  marketingLeads as baseLeads,
  users,
  properties,
  leadInteractions as baseInteractions,
  type Automation,
  type AutomationStep,
  type AutomationLog,
  type Template,
  type MarketingLead,
  type LeadInteraction,
} from '@/data/marketing';
import type { EnrollmentRecord, ExecutionLogEntry, EnrollmentStatus } from './types';

// Mutable state copies
let automations: Automation[] = [...baseAutomations];
let automationSteps: AutomationStep[] = [...baseSteps];
let automationLogs: AutomationLog[] = [...baseLogs];
let templates: Template[] = [...baseTemplates];
let marketingLeads: MarketingLead[] = [...baseLeads];
let leadInteractions: LeadInteraction[] = [...baseInteractions];

// Extended enrollment records with execution history
let enrollmentRecords: Map<string, EnrollmentRecord> = new Map();

// Detailed execution logs (separate from enrollment status)
let executionLogs: ExecutionLogEntry[] = [];

// ID generators following existing conventions
let logCounter = automationLogs.length + 1;
let stepLogCounter = 1;
let interactionCounter = baseInteractions.length + 1;

export function generateLogId(): string {
  return `ALOG_${String(logCounter++).padStart(3, '0')}`;
}

export function generateExecutionLogId(): string {
  return `EXLOG_${String(stepLogCounter++).padStart(4, '0')}`;
}

export function generateInteractionId(): string {
  return `INT_${String(interactionCounter++).padStart(3, '0')}`;
}

// Getters
export function getAutomations(): Automation[] {
  return automations;
}

export function getAutomationById(id: string): Automation | undefined {
  return automations.find(a => a.id === id);
}

export function getAutomationSteps(automationId: string): AutomationStep[] {
  return automationSteps
    .filter(s => s.automation_id === automationId)
    .sort((a, b) => a.step_order - b.step_order);
}

export function getStepById(stepId: string): AutomationStep | undefined {
  return automationSteps.find(s => s.id === stepId);
}

export function getNextStep(automationId: string, currentStepId: string): AutomationStep | undefined {
  const steps = getAutomationSteps(automationId);
  const currentIndex = steps.findIndex(s => s.id === currentStepId);
  if (currentIndex === -1 || currentIndex === steps.length - 1) return undefined;
  return steps[currentIndex + 1];
}

export function getFirstStep(automationId: string): AutomationStep | undefined {
  const steps = getAutomationSteps(automationId);
  return steps[0];
}

export function getAutomationLogs(automationId?: string): AutomationLog[] {
  if (automationId) {
    return automationLogs.filter(l => l.automation_id === automationId);
  }
  return automationLogs;
}

export function getLogsByLead(leadId: string): AutomationLog[] {
  return automationLogs.filter(l => l.lead_id === leadId);
}

export function getActiveEnrollment(automationId: string, leadId: string): AutomationLog | undefined {
  return automationLogs.find(
    l => l.automation_id === automationId && 
    l.lead_id === leadId && 
    (l.status === 'Active' || l.status === 'Paused')
  );
}

export function getTemplateById(templateId: string): Template | undefined {
  return templates.find(t => t.id === templateId);
}

export function getLeadById(leadId: string): MarketingLead | undefined {
  return marketingLeads.find(l => l.id === leadId);
}

export function getUserById(userId: string) {
  return users.find(u => u.id === userId);
}

export function getPropertyById(propertyId: string) {
  return properties.find(p => p.id === propertyId);
}

export function getEnrollmentRecord(enrollmentId: string): EnrollmentRecord | undefined {
  return enrollmentRecords.get(enrollmentId);
}

export function getExecutionLogs(automationId?: string, leadId?: string): ExecutionLogEntry[] {
  return executionLogs.filter(l => {
    const enrollment = Array.from(enrollmentRecords.values()).find(
      e => e.execution_history.some(h => h.id === l.id)
    );
    if (!enrollment) return false;
    if (automationId && enrollment.automation_id !== automationId) return false;
    if (leadId && enrollment.lead_id !== leadId) return false;
    return true;
  });
}

// Mutations
export function updateAutomationStatus(automationId: string, status: Automation['status']): boolean {
  const index = automations.findIndex(a => a.id === automationId);
  if (index === -1) return false;
  
  automations[index] = { ...automations[index], status };
  
  // If pausing, pause all active enrollments
  if (status === 'Paused') {
    automationLogs = automationLogs.map(log => {
      if (log.automation_id === automationId && log.status === 'Active') {
        return { ...log, status: 'Paused' };
      }
      return log;
    });
  }
  
  // If resuming, resume paused enrollments
  if (status === 'Active') {
    automationLogs = automationLogs.map(log => {
      if (log.automation_id === automationId && log.status === 'Paused') {
        return { ...log, status: 'Active' };
      }
      return log;
    });
  }
  
  return true;
}

export function createEnrollment(
  automationId: string, 
  leadId: string, 
  firstStepId: string
): AutomationLog | null {
  // Check for duplicate active enrollment
  const existing = getActiveEnrollment(automationId, leadId);
  if (existing) {
    console.log(`[AutomationStore] Lead ${leadId} already enrolled in ${automationId}`);
    return null;
  }
  
  const now = new Date().toISOString();
  const logId = generateLogId();
  
  const newLog: AutomationLog = {
    id: logId,
    automation_id: automationId,
    lead_id: leadId,
    current_step_id: firstStepId,
    status: 'Active',
    started_at: now,
    last_step_completed_at: now,
    next_step_due_at: '',
  };
  
  automationLogs.push(newLog);
  
  // Update automation enrolled count
  const autoIndex = automations.findIndex(a => a.id === automationId);
  if (autoIndex !== -1) {
    automations[autoIndex] = {
      ...automations[autoIndex],
      enrolled_count: automations[autoIndex].enrolled_count + 1,
    };
  }
  
  // Create detailed enrollment record
  const enrollmentRecord: EnrollmentRecord = {
    id: logId,
    automation_id: automationId,
    lead_id: leadId,
    current_step_id: firstStepId,
    status: 'Active',
    enrolled_at: now,
    started_at: now,
    last_step_completed_at: now,
    next_step_due_at: '',
    condition_results: {},
    execution_history: [{
      id: generateExecutionLogId(),
      step_id: firstStepId,
      event_type: 'enrollment',
      timestamp: now,
      status: 'success',
      details: `Enrolled lead ${leadId} into automation ${automationId}`,
    }],
  };
  
  enrollmentRecords.set(logId, enrollmentRecord);
  executionLogs.push(enrollmentRecord.execution_history[0]);
  
  console.log(`[AutomationStore] Created enrollment ${logId} for lead ${leadId} in automation ${automationId}`);
  
  return newLog;
}

export function updateEnrollment(
  enrollmentId: string,
  updates: Partial<Pick<AutomationLog, 'current_step_id' | 'status' | 'last_step_completed_at' | 'next_step_due_at'>>
): boolean {
  const index = automationLogs.findIndex(l => l.id === enrollmentId);
  if (index === -1) return false;
  
  const previousStatus = automationLogs[index].status;
  automationLogs[index] = { ...automationLogs[index], ...updates };
  
  // Update enrollment record
  const record = enrollmentRecords.get(enrollmentId);
  if (record) {
    if (updates.current_step_id) record.current_step_id = updates.current_step_id;
    if (updates.status) record.status = updates.status as EnrollmentStatus;
    if (updates.last_step_completed_at) record.last_step_completed_at = updates.last_step_completed_at;
    if (updates.next_step_due_at) record.next_step_due_at = updates.next_step_due_at;
  }
  
  // Update completed count if transitioning to Completed
  if (updates.status === 'Completed' && previousStatus !== 'Completed') {
    const log = automationLogs[index];
    const autoIndex = automations.findIndex(a => a.id === log.automation_id);
    if (autoIndex !== -1) {
      automations[autoIndex] = {
        ...automations[autoIndex],
        completed_count: automations[autoIndex].completed_count + 1,
      };
    }
  }
  
  return true;
}

export function terminateEnrollment(enrollmentId: string, reason?: string): boolean {
  const result = updateEnrollment(enrollmentId, { status: 'Terminated' });
  
  if (result) {
    const record = enrollmentRecords.get(enrollmentId);
    if (record) {
      const logEntry: ExecutionLogEntry = {
        id: generateExecutionLogId(),
        step_id: record.current_step_id,
        event_type: 'termination',
        timestamp: new Date().toISOString(),
        status: 'success',
        details: reason || 'Manually terminated',
      };
      record.execution_history.push(logEntry);
      executionLogs.push(logEntry);
    }
  }
  
  return result;
}

export function addExecutionLog(
  enrollmentId: string, 
  entry: Omit<ExecutionLogEntry, 'id'>
): ExecutionLogEntry | null {
  const record = enrollmentRecords.get(enrollmentId);
  if (!record) return null;
  
  const logEntry: ExecutionLogEntry = {
    ...entry,
    id: generateExecutionLogId(),
  };
  
  record.execution_history.push(logEntry);
  executionLogs.push(logEntry);
  
  return logEntry;
}

export function addLeadInteraction(
  leadId: string,
  interaction: Omit<LeadInteraction, 'id'>
): LeadInteraction {
  const newInteraction: LeadInteraction = {
    ...interaction,
    id: generateInteractionId(),
  };
  
  leadInteractions.push(newInteraction);
  return newInteraction;
}

export function updateLead(leadId: string, updates: Partial<MarketingLead>): boolean {
  const index = marketingLeads.findIndex(l => l.id === leadId);
  if (index === -1) return false;
  
  marketingLeads[index] = { ...marketingLeads[index], ...updates };
  return true;
}

// State reset (for testing)
export function resetState(): void {
  automations = [...baseAutomations];
  automationSteps = [...baseSteps];
  automationLogs = [...baseLogs];
  templates = [...baseTemplates];
  marketingLeads = [...baseLeads];
  leadInteractions = [...baseInteractions];
  enrollmentRecords.clear();
  executionLogs = [];
  logCounter = baseLogs.length + 1;
  stepLogCounter = 1;
  interactionCounter = baseInteractions.length + 1;
}

// Listeners for state changes (for UI reactivity)
type StateChangeCallback = () => void;
const listeners: Set<StateChangeCallback> = new Set();

export function subscribe(callback: StateChangeCallback): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function notifyListeners(): void {
  listeners.forEach(callback => callback());
}
