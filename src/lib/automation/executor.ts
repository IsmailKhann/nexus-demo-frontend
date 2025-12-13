// Step Execution Engine
// Executes automation workflow steps asynchronously

import type { 
  ExecutionResult, 
  StepExecutionContext, 
  ConditionRule, 
  MergeTokens,
  ExecutionLogEntry,
} from './types';
import {
  getStepById,
  getNextStep,
  getAutomationById,
  getLeadById,
  getTemplateById,
  getPropertyById,
  getUserById,
  updateEnrollment,
  addExecutionLog,
  addLeadInteraction,
  updateLead,
  getAutomationLogs,
  notifyListeners,
} from './store';
import type { AutomationStep, AutomationLog } from '@/data/marketing';

// Email connector stub
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  console.log(`[EmailConnector] STUB: Would send email to ${to}`);
  console.log(`[EmailConnector] Subject: ${subject}`);
  console.log(`[EmailConnector] Body preview: ${body.substring(0, 100)}...`);
  // In production, this would call the actual email service
  return true;
}

// SMS connector stub
async function sendSMS(to: string, body: string): Promise<boolean> {
  console.log(`[SMSConnector] STUB: Would send SMS to ${to}`);
  console.log(`[SMSConnector] Body: ${body}`);
  // In production, this would call the actual SMS service
  return true;
}

// Build merge tokens for template rendering
function buildMergeTokens(leadId: string): MergeTokens {
  const lead = getLeadById(leadId);
  if (!lead) {
    return {
      first_name: '',
      last_name: '',
      full_name: '',
      email: '',
      phone: '',
      property_name: '',
      unit_number: '',
      lead_score: 0,
    };
  }
  
  const property = getPropertyById(lead.property_id);
  
  return {
    first_name: lead.first_name,
    last_name: lead.last_name,
    full_name: lead.full_name,
    email: lead.email,
    phone: lead.phone,
    property_name: property?.name || '',
    unit_number: lead.unit_id || '',
    lead_score: lead.lead_score,
    feedback_link: `https://nexus.app/feedback/${leadId}`,
    review_link: `https://nexus.app/review/${leadId}`,
  };
}

// Apply merge tokens to template content
function applyMergeTokens(content: string, tokens: MergeTokens): string {
  let result = content;
  
  for (const [key, value] of Object.entries(tokens)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(placeholder, String(value || ''));
  }
  
  return result;
}

// Parse condition JSON and evaluate
function parseConditionJson(conditionJson: string): ConditionRule | null {
  if (!conditionJson || conditionJson === '{}') return null;
  
  try {
    const parsed = JSON.parse(conditionJson);
    
    // Handle score condition like {"score":">8"}
    if (parsed.score) {
      const match = String(parsed.score).match(/^([<>=]+)(\d+)$/);
      if (match) {
        return {
          field: 'lead_score',
          operator: match[1] as ConditionRule['operator'],
          value: parseInt(match[2], 10),
        };
      }
    }
    
    // Handle has_replied condition
    if ('has_replied' in parsed) {
      return {
        field: 'has_replied',
        operator: '=',
        value: parsed.has_replied,
      };
    }
    
    // Handle lead_score condition
    if (parsed.lead_score) {
      return {
        field: 'lead_score',
        operator: '>=',
        value: parseInt(parsed.lead_score, 10),
      };
    }
    
    // Handle tag exists condition
    if (parsed.tag_exists) {
      return {
        field: 'tag_exists',
        operator: 'exists',
        value: parsed.tag_exists,
      };
    }
    
    return null;
  } catch {
    console.warn(`[Executor] Failed to parse condition JSON: ${conditionJson}`);
    return null;
  }
}

// Evaluate a condition against lead data
function evaluateCondition(rule: ConditionRule, leadId: string): boolean {
  const lead = getLeadById(leadId);
  if (!lead) return false;
  
  switch (rule.field) {
    case 'lead_score':
    case 'score': {
      const score = lead.lead_score;
      const target = Number(rule.value);
      switch (rule.operator) {
        case '>': return score > target;
        case '<': return score < target;
        case '>=': return score >= target;
        case '<=': return score <= target;
        case '=': return score === target;
        default: return false;
      }
    }
    
    case 'has_replied': {
      // Check if lead has any inbound interactions after enrollment
      // For demo purposes, check if last_inbound_at exists
      return Boolean(lead.last_inbound_at);
    }
    
    case 'tag_exists': {
      // Tags would be stored in lead.notes or a separate field
      // For demo, check if notes contain the tag
      return lead.notes?.toLowerCase().includes(String(rule.value).toLowerCase()) || false;
    }
    
    case 'lead_source': {
      return lead.source_id === rule.value || lead.original_channel === rule.value;
    }
    
    default:
      return false;
  }
}

// Execute a single step
export async function executeStep(context: StepExecutionContext): Promise<ExecutionResult> {
  const { stepId, leadId, automationId, enrollmentId } = context;
  const now = new Date().toISOString();
  
  console.log(`[Executor] Executing step ${stepId} for lead ${leadId} in automation ${automationId}`);
  
  const step = getStepById(stepId);
  if (!step) {
    return {
      success: false,
      stepId,
      error: `Step ${stepId} not found`,
      timestamp: now,
    };
  }
  
  const lead = getLeadById(leadId);
  if (!lead) {
    return {
      success: false,
      stepId,
      error: `Lead ${leadId} not found`,
      timestamp: now,
    };
  }
  
  try {
    switch (step.type) {
      case 'Delay':
        return await executeDelayStep(step, context);
      
      case 'Condition':
        return await executeConditionStep(step, context);
      
      case 'Action':
        return await executeActionStep(step, context);
      
      default:
        return {
          success: false,
          stepId,
          error: `Unknown step type: ${step.type}`,
          timestamp: now,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    addExecutionLog(enrollmentId, {
      step_id: stepId,
      event_type: 'failure',
      timestamp: now,
      status: 'failed',
      error: errorMessage,
    });
    
    return {
      success: false,
      stepId,
      error: errorMessage,
      timestamp: now,
    };
  }
}

async function executeDelayStep(
  step: AutomationStep, 
  context: StepExecutionContext
): Promise<ExecutionResult> {
  const { enrollmentId, automationId } = context;
  const now = new Date();
  
  // Calculate when the delay ends
  const delayMs = step.delay_hours * 60 * 60 * 1000;
  const nextDueAt = new Date(now.getTime() + delayMs).toISOString();
  
  // Log delay start
  addExecutionLog(enrollmentId, {
    step_id: step.id,
    event_type: 'delay_start',
    timestamp: now.toISOString(),
    status: 'success',
    details: `Delay started: ${step.delay_hours} hours`,
  });
  
  // Update enrollment with next step due time
  updateEnrollment(enrollmentId, {
    next_step_due_at: nextDueAt,
    last_step_completed_at: now.toISOString(),
  });
  
  // Schedule the next step (in a real system, this would use a job queue)
  const nextStep = getNextStep(automationId, step.id);
  
  // For demo, we'll simulate the delay completing immediately but log it
  console.log(`[Executor] Delay step ${step.id}: Would wait ${step.delay_hours} hours until ${nextDueAt}`);
  
  return {
    success: true,
    stepId: step.id,
    nextStepId: nextStep?.id,
    timestamp: now.toISOString(),
  };
}

async function executeConditionStep(
  step: AutomationStep, 
  context: StepExecutionContext
): Promise<ExecutionResult> {
  const { leadId, enrollmentId, automationId } = context;
  const now = new Date().toISOString();
  
  const rule = parseConditionJson(step.condition_json);
  let conditionResult = true;
  
  if (rule) {
    conditionResult = evaluateCondition(rule, leadId);
  }
  
  // Log condition evaluation
  addExecutionLog(enrollmentId, {
    step_id: step.id,
    event_type: 'condition_eval',
    timestamp: now,
    status: 'success',
    condition_result: conditionResult,
    details: `Condition "${step.condition_json}" evaluated to ${conditionResult}`,
  });
  
  console.log(`[Executor] Condition step ${step.id}: Result = ${conditionResult}`);
  
  // Determine next step based on condition result
  // In a full implementation, we'd have branch step IDs
  // For now, continue to next sequential step only if condition is true
  const nextStep = conditionResult ? getNextStep(automationId, step.id) : undefined;
  
  updateEnrollment(enrollmentId, {
    last_step_completed_at: now,
  });
  
  return {
    success: true,
    stepId: step.id,
    nextStepId: nextStep?.id,
    conditionResult,
    timestamp: now,
  };
}

async function executeActionStep(
  step: AutomationStep, 
  context: StepExecutionContext
): Promise<ExecutionResult> {
  const { leadId, enrollmentId, automationId } = context;
  const now = new Date().toISOString();
  const lead = getLeadById(leadId);
  
  if (!lead) {
    return { success: false, stepId: step.id, error: 'Lead not found', timestamp: now };
  }
  
  let success = false;
  let details = '';
  
  switch (step.action) {
    case 'Send Email': {
      const template = getTemplateById(step.content_template_id);
      if (!template) {
        return { 
          success: false, 
          stepId: step.id, 
          error: `Template ${step.content_template_id} not found`, 
          timestamp: now 
        };
      }
      
      const tokens = buildMergeTokens(leadId);
      const subject = applyMergeTokens(template.subject, tokens);
      const body = applyMergeTokens(template.body, tokens);
      
      success = await sendEmail(lead.email, subject, body);
      details = `Sent email "${subject}" to ${lead.email}`;
      
      // Log as interaction
      addLeadInteraction(leadId, {
        lead_id: leadId,
        type: 'Message',
        direction: 'Outbound',
        channel: 'Email',
        thread_id: '',
        subject,
        message_body: body,
        channel_message_id: `auto_${enrollmentId}_${step.id}`,
        attachments: '',
        created_by_user_id: 'USR_004', // AI Bot
        created_by_source: 'Automation',
        timestamp: now,
        duration_seconds: 0,
        is_visible_to_resident: true,
        is_unread: false,
        assigned_to_user_id: lead.lead_owner_id,
      });
      break;
    }
    
    case 'Send SMS': {
      const template = getTemplateById(step.content_template_id);
      const tokens = buildMergeTokens(leadId);
      const body = template ? applyMergeTokens(template.body, tokens) : 'Hello from Nexus';
      
      success = await sendSMS(lead.phone, body);
      details = `Sent SMS to ${lead.phone}`;
      
      // Log as interaction
      addLeadInteraction(leadId, {
        lead_id: leadId,
        type: 'Message',
        direction: 'Outbound',
        channel: 'SMS',
        thread_id: '',
        subject: '',
        message_body: body,
        channel_message_id: `auto_${enrollmentId}_${step.id}`,
        attachments: '',
        created_by_user_id: 'USR_004',
        created_by_source: 'Automation',
        timestamp: now,
        duration_seconds: 0,
        is_visible_to_resident: true,
        is_unread: false,
        assigned_to_user_id: lead.lead_owner_id,
      });
      break;
    }
    
    case 'Assign Agent': {
      // Parse team/agent from condition_json
      let assignedUserId = lead.lead_owner_id;
      try {
        const config = JSON.parse(step.condition_json || '{}');
        if (config.user_id) {
          assignedUserId = config.user_id;
        } else if (config.team) {
          // Get first available agent from team (simplified)
          assignedUserId = 'USR_001'; // Default to first agent
        }
      } catch { /* ignore */ }
      
      updateLead(leadId, { lead_owner_id: assignedUserId });
      success = true;
      details = `Assigned lead to agent ${assignedUserId}`;
      break;
    }
    
    case 'Create Task': {
      let taskTitle = 'Follow up';
      try {
        const config = JSON.parse(step.condition_json || '{}');
        taskTitle = config.task_title || taskTitle;
      } catch { /* ignore */ }
      
      // In a real system, this would create an actual task
      console.log(`[Executor] Would create task "${taskTitle}" for lead ${leadId}`);
      success = true;
      details = `Created task: ${taskTitle}`;
      break;
    }
    
    case 'Add Tag':
    case 'Remove Tag': {
      // Tags would be managed on lead record
      success = true;
      details = `${step.action} operation completed`;
      break;
    }
    
    default:
      return { 
        success: false, 
        stepId: step.id, 
        error: `Unknown action: ${step.action}`, 
        timestamp: now 
      };
  }
  
  // Log step execution
  addExecutionLog(enrollmentId, {
    step_id: step.id,
    event_type: 'step_execution',
    timestamp: now,
    status: success ? 'success' : 'failed',
    details,
    template_id: step.content_template_id || undefined,
  });
  
  // Update enrollment
  updateEnrollment(enrollmentId, {
    last_step_completed_at: now,
  });
  
  // Determine next step
  const nextStep = getNextStep(automationId, step.id);
  
  return {
    success,
    stepId: step.id,
    nextStepId: nextStep?.id,
    timestamp: now,
  };
}

// Process all pending steps for an enrollment
export async function processEnrollment(enrollmentId: string): Promise<void> {
  const logs = getAutomationLogs();
  const enrollment = logs.find(l => l.id === enrollmentId);
  
  if (!enrollment || enrollment.status !== 'Active') {
    console.log(`[Executor] Enrollment ${enrollmentId} is not active, skipping`);
    return;
  }
  
  const automation = getAutomationById(enrollment.automation_id);
  if (!automation || automation.status !== 'Active') {
    console.log(`[Executor] Automation ${enrollment.automation_id} is not active, skipping`);
    return;
  }
  
  // Check if delay is still pending
  if (enrollment.next_step_due_at) {
    const dueAt = new Date(enrollment.next_step_due_at);
    if (dueAt > new Date()) {
      console.log(`[Executor] Enrollment ${enrollmentId} is waiting until ${enrollment.next_step_due_at}`);
      return;
    }
  }
  
  // Execute current step
  const result = await executeStep({
    stepId: enrollment.current_step_id,
    leadId: enrollment.lead_id,
    automationId: enrollment.automation_id,
    enrollmentId,
    timestamp: new Date().toISOString(),
  });
  
  if (result.success && result.nextStepId) {
    // Move to next step
    updateEnrollment(enrollmentId, {
      current_step_id: result.nextStepId,
    });
    
    // Continue processing (async, non-blocking)
    // In production, this would be queued
    setTimeout(() => processEnrollment(enrollmentId), 100);
  } else if (result.success && !result.nextStepId) {
    // Automation completed
    updateEnrollment(enrollmentId, {
      status: 'Completed',
    });
    
    addExecutionLog(enrollmentId, {
      step_id: enrollment.current_step_id,
      event_type: 'completion',
      timestamp: new Date().toISOString(),
      status: 'success',
      details: 'Automation workflow completed successfully',
    });
    
    console.log(`[Executor] Enrollment ${enrollmentId} completed successfully`);
  } else {
    // Step failed
    console.error(`[Executor] Step execution failed: ${result.error}`);
  }
  
  notifyListeners();
}

// Retry a specific step
export async function retryStep(enrollmentId: string, stepId: string): Promise<ExecutionResult> {
  const logs = getAutomationLogs();
  const enrollment = logs.find(l => l.id === enrollmentId);
  
  if (!enrollment) {
    return {
      success: false,
      stepId,
      error: 'Enrollment not found',
      timestamp: new Date().toISOString(),
    };
  }
  
  addExecutionLog(enrollmentId, {
    step_id: stepId,
    event_type: 'retry',
    timestamp: new Date().toISOString(),
    status: 'pending',
    details: 'Retry requested',
  });
  
  const result = await executeStep({
    stepId,
    leadId: enrollment.lead_id,
    automationId: enrollment.automation_id,
    enrollmentId,
    timestamp: new Date().toISOString(),
  });
  
  notifyListeners();
  return result;
}
