// Main Automation Engine
// Coordinates triggers, execution, and state management

import {
  getAutomations,
  getAutomationById,
  getAutomationLogs,
  getFirstStep,
  createEnrollment,
  updateEnrollment,
  terminateEnrollment,
  updateAutomationStatus,
  getActiveEnrollment,
  getLeadById,
  notifyListeners,
} from './store';
import { fireTrigger, onLeadCreated, onTourCompleted, onMoveInCompleted } from './triggers';
import { processEnrollment, retryStep } from './executor';
import type { TriggerContext, EnrollmentStatus } from './types';

// Engine state
let engineRunning = false;
let processingInterval: ReturnType<typeof setInterval> | null = null;

// Start the automation engine
export function startEngine(): void {
  if (engineRunning) {
    console.log('[Engine] Already running');
    return;
  }
  
  engineRunning = true;
  console.log('[Engine] Starting automation engine...');
  
  // Process pending enrollments periodically
  processingInterval = setInterval(() => {
    processAllPendingEnrollments();
  }, 5000); // Every 5 seconds
  
  console.log('[Engine] Automation engine started');
}

// Stop the automation engine
export function stopEngine(): void {
  if (!engineRunning) return;
  
  engineRunning = false;
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
  }
  
  console.log('[Engine] Automation engine stopped');
}

// Check if engine is running
export function isEngineRunning(): boolean {
  return engineRunning;
}

// Process all pending enrollments
async function processAllPendingEnrollments(): Promise<void> {
  const logs = getAutomationLogs();
  const activeEnrollments = logs.filter(l => l.status === 'Active');
  
  for (const enrollment of activeEnrollments) {
    // Check if automation is still active
    const automation = getAutomationById(enrollment.automation_id);
    if (!automation || automation.status !== 'Active') continue;
    
    // Check if delay has passed
    if (enrollment.next_step_due_at) {
      const dueAt = new Date(enrollment.next_step_due_at);
      if (dueAt > new Date()) continue;
    }
    
    // Process this enrollment
    try {
      await processEnrollment(enrollment.id);
    } catch (error) {
      console.error(`[Engine] Error processing enrollment ${enrollment.id}:`, error);
    }
  }
}

// Manual enrollment
export function manualEnroll(automationId: string, leadId: string): {
  success: boolean;
  enrollmentId?: string;
  error?: string;
} {
  const automation = getAutomationById(automationId);
  if (!automation) {
    return { success: false, error: 'Automation not found' };
  }
  
  if (automation.status !== 'Active') {
    return { success: false, error: 'Automation is not active' };
  }
  
  const lead = getLeadById(leadId);
  if (!lead) {
    return { success: false, error: 'Lead not found' };
  }
  
  // Check for existing enrollment
  const existing = getActiveEnrollment(automationId, leadId);
  if (existing) {
    return { success: false, error: 'Lead is already enrolled in this automation' };
  }
  
  const firstStep = getFirstStep(automationId);
  if (!firstStep) {
    return { success: false, error: 'Automation has no steps' };
  }
  
  const enrollment = createEnrollment(automationId, leadId, firstStep.id);
  if (!enrollment) {
    return { success: false, error: 'Failed to create enrollment' };
  }
  
  // Start processing immediately
  processEnrollment(enrollment.id);
  notifyListeners();
  
  return { success: true, enrollmentId: enrollment.id };
}

// Manual unenroll
export function manualUnenroll(enrollmentId: string, reason?: string): {
  success: boolean;
  error?: string;
} {
  const result = terminateEnrollment(enrollmentId, reason || 'Manually unenrolled');
  notifyListeners();
  
  return { 
    success: result, 
    error: result ? undefined : 'Failed to terminate enrollment' 
  };
}

// Pause automation
export function pauseAutomation(automationId: string): {
  success: boolean;
  error?: string;
} {
  const automation = getAutomationById(automationId);
  if (!automation) {
    return { success: false, error: 'Automation not found' };
  }
  
  const result = updateAutomationStatus(automationId, 'Paused');
  notifyListeners();
  
  return { 
    success: result, 
    error: result ? undefined : 'Failed to pause automation' 
  };
}

// Resume automation
export function resumeAutomation(automationId: string): {
  success: boolean;
  error?: string;
} {
  const automation = getAutomationById(automationId);
  if (!automation) {
    return { success: false, error: 'Automation not found' };
  }
  
  const result = updateAutomationStatus(automationId, 'Active');
  
  if (result) {
    // Resume processing paused enrollments
    const logs = getAutomationLogs(automationId);
    logs.filter(l => l.status === 'Active').forEach(enrollment => {
      processEnrollment(enrollment.id);
    });
  }
  
  notifyListeners();
  
  return { 
    success: result, 
    error: result ? undefined : 'Failed to resume automation' 
  };
}

// Activate draft automation
export function activateAutomation(automationId: string): {
  success: boolean;
  error?: string;
} {
  const automation = getAutomationById(automationId);
  if (!automation) {
    return { success: false, error: 'Automation not found' };
  }
  
  const firstStep = getFirstStep(automationId);
  if (!firstStep) {
    return { success: false, error: 'Automation has no steps defined' };
  }
  
  const result = updateAutomationStatus(automationId, 'Active');
  notifyListeners();
  
  return { 
    success: result, 
    error: result ? undefined : 'Failed to activate automation' 
  };
}

// Retry a failed step
export async function retryEnrollmentStep(enrollmentId: string, stepId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await retryStep(enrollmentId, stepId);
    return { success: result.success, error: result.error };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Get engine statistics
export function getEngineStats(): {
  isRunning: boolean;
  totalAutomations: number;
  activeAutomations: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  pausedEnrollments: number;
} {
  const automations = getAutomations();
  const logs = getAutomationLogs();
  
  return {
    isRunning: engineRunning,
    totalAutomations: automations.length,
    activeAutomations: automations.filter(a => a.status === 'Active').length,
    totalEnrollments: logs.length,
    activeEnrollments: logs.filter(l => l.status === 'Active').length,
    completedEnrollments: logs.filter(l => l.status === 'Completed').length,
    pausedEnrollments: logs.filter(l => l.status === 'Paused').length,
  };
}

// Export trigger functions for external use
export { 
  fireTrigger, 
  onLeadCreated, 
  onTourCompleted, 
  onMoveInCompleted 
} from './triggers';

// Export store functions for UI
export {
  getAutomations,
  getAutomationById,
  getAutomationSteps,
  getAutomationLogs,
  getLeadById,
  getUserById,
  getTemplateById,
  getPropertyById,
  subscribe,
  notifyListeners,
} from './store';
