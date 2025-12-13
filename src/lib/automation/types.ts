// Drip Sequence Automation Types
// Maintains strict referential integrity with Excel workbook

export type AutomationStatus = 'Draft' | 'Active' | 'Paused';
export type EnrollmentStatus = 'Active' | 'Paused' | 'Completed' | 'Terminated' | 'Failed';
export type TriggerType = 'Event' | 'Time' | 'Segment';

export type TriggerEvent = 
  | 'Lead Created'
  | 'Lead Updated'
  | 'Tag Added'
  | 'Tour Completed'
  | 'Move-in Completed'
  | 'Lease Ends 90 Days'
  | 'Birthday Matches'
  | 'No Activity 30 Days'
  | 'Rent Overdue 1 Day'
  | 'Invoice Received'
  | `Lead Source = ${string}`
  | `Tag = '${string}'`;

export type StepType = 'Action' | 'Delay' | 'Condition';

export type ActionType = 
  | 'Send Email'
  | 'Send SMS'
  | 'Assign Agent'
  | 'Create Task'
  | 'Add Tag'
  | 'Remove Tag'
  | 'Wait'
  | 'Check Score';

export interface ConditionRule {
  field: 'lead_score' | 'tag_exists' | 'has_replied' | 'lead_source' | 'score';
  operator: '>' | '<' | '=' | '>=' | '<=' | 'exists' | 'not_exists';
  value: string | number | boolean;
}

export interface StepExecutionContext {
  leadId: string;
  automationId: string;
  stepId: string;
  enrollmentId: string;
  timestamp: string;
}

export interface ExecutionResult {
  success: boolean;
  stepId: string;
  nextStepId?: string;
  conditionResult?: boolean;
  error?: string;
  timestamp: string;
}

export interface EnrollmentRecord {
  id: string;
  automation_id: string;
  lead_id: string;
  current_step_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  started_at: string;
  last_step_completed_at: string;
  next_step_due_at: string;
  condition_results: Record<string, boolean>;
  execution_history: ExecutionLogEntry[];
}

export interface ExecutionLogEntry {
  id: string;
  step_id: string;
  event_type: 'enrollment' | 'step_execution' | 'delay_start' | 'delay_complete' | 'condition_eval' | 'completion' | 'failure' | 'retry' | 'pause' | 'resume' | 'termination';
  timestamp: string;
  status: 'success' | 'failed' | 'pending' | 'skipped';
  details?: string;
  condition_result?: boolean;
  template_id?: string;
  error?: string;
}

export interface MergeTokens {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  property_name: string;
  unit_number: string;
  lead_score: number;
  feedback_link?: string;
  review_link?: string;
  [key: string]: string | number | undefined;
}

export interface TriggerContext {
  event: TriggerEvent;
  leadId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
