// Trigger Evaluation System
// Evaluates automation triggers and enrolls matching leads

import type { TriggerContext, TriggerEvent } from './types';
import {
  getAutomations,
  getAutomationById,
  getFirstStep,
  getActiveEnrollment,
  createEnrollment,
  getLeadById,
  addExecutionLog,
} from './store';
import type { Automation, MarketingLead } from '@/data/marketing';

export interface TriggerFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'not_equals';
  value: string;
}

// Parse trigger_event to extract conditions
export function parseTriggerEvent(triggerEvent: string): { 
  baseEvent: string; 
  filters: TriggerFilter[] 
} {
  // Handle "Lead Source = X" pattern
  const sourceMatch = triggerEvent.match(/^Lead Source\s*=\s*(.+)$/i);
  if (sourceMatch) {
    return {
      baseEvent: 'Lead Source Match',
      filters: [{ field: 'source_id', operator: 'equals', value: sourceMatch[1].trim() }],
    };
  }
  
  // Handle "Tag = 'X'" pattern
  const tagMatch = triggerEvent.match(/^Tag\s*=\s*'([^']+)'$/i);
  if (tagMatch) {
    return {
      baseEvent: 'Tag Match',
      filters: [{ field: 'tag', operator: 'equals', value: tagMatch[1] }],
    };
  }
  
  return { baseEvent: triggerEvent, filters: [] };
}

// Check if a lead matches trigger filters
export function evaluateTriggerFilters(lead: MarketingLead, filters: TriggerFilter[]): boolean {
  for (const filter of filters) {
    const fieldValue = getLeadFieldValue(lead, filter.field);
    
    switch (filter.operator) {
      case 'equals':
        if (String(fieldValue).toLowerCase() !== String(filter.value).toLowerCase()) {
          return false;
        }
        break;
      case 'contains':
        if (!String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase())) {
          return false;
        }
        break;
      case 'starts_with':
        if (!String(fieldValue).toLowerCase().startsWith(String(filter.value).toLowerCase())) {
          return false;
        }
        break;
      case 'not_equals':
        if (String(fieldValue).toLowerCase() === String(filter.value).toLowerCase()) {
          return false;
        }
        break;
    }
  }
  return true;
}

function getLeadFieldValue(lead: MarketingLead, field: string): unknown {
  const fieldMap: Record<string, keyof MarketingLead> = {
    'source_id': 'source_id',
    'source': 'source_id',
    'status': 'status',
    'priority': 'priority',
    'lead_score': 'lead_score',
    'property_id': 'property_id',
    'team_id': 'team_id',
    'original_channel': 'original_channel',
  };
  
  const mappedField = fieldMap[field] || field;
  return lead[mappedField as keyof MarketingLead];
}

// Find matching automations for a trigger context
export function findMatchingAutomations(context: TriggerContext): Automation[] {
  const allAutomations = getAutomations();
  const matchingAutomations: Automation[] = [];
  
  for (const automation of allAutomations) {
    // Skip non-active automations
    if (automation.status !== 'Active') continue;
    
    const { baseEvent, filters } = parseTriggerEvent(automation.trigger_event);
    
    // Check if base event matches
    const eventMatches = matchesBaseEvent(context.event, baseEvent, automation.trigger_type);
    if (!eventMatches) continue;
    
    // Check additional filters against lead
    const lead = getLeadById(context.leadId);
    if (!lead) continue;
    
    if (filters.length > 0 && !evaluateTriggerFilters(lead, filters)) continue;
    
    matchingAutomations.push(automation);
  }
  
  return matchingAutomations;
}

function matchesBaseEvent(
  contextEvent: TriggerEvent, 
  automationBaseEvent: string, 
  triggerType: string
): boolean {
  // Direct match
  if (contextEvent === automationBaseEvent) return true;
  
  // Pattern matching for source-based triggers
  if (contextEvent.startsWith('Lead Source =') && automationBaseEvent === 'Lead Source Match') {
    return true;
  }
  
  // Handle Zillow-specific trigger
  if (automationBaseEvent === 'Lead Source = Zillow' || automationBaseEvent.includes('Zillow')) {
    if (contextEvent === 'Lead Created' || contextEvent.includes('Zillow')) {
      return true;
    }
  }
  
  return false;
}

// Main trigger handler - evaluates and enrolls
export function fireTrigger(context: TriggerContext): { 
  enrolledAutomations: string[]; 
  skippedAutomations: string[];
  errors: string[];
} {
  console.log(`[Triggers] Firing trigger: ${context.event} for lead ${context.leadId}`);
  
  const enrolledAutomations: string[] = [];
  const skippedAutomations: string[] = [];
  const errors: string[] = [];
  
  const matchingAutomations = findMatchingAutomations(context);
  
  for (const automation of matchingAutomations) {
    // Check for existing active enrollment (prevent duplicates)
    const existing = getActiveEnrollment(automation.id, context.leadId);
    if (existing) {
      console.log(`[Triggers] Lead ${context.leadId} already enrolled in ${automation.id}, skipping`);
      skippedAutomations.push(automation.id);
      continue;
    }
    
    // Get first step
    const firstStep = getFirstStep(automation.id);
    if (!firstStep) {
      console.error(`[Triggers] Automation ${automation.id} has no steps`);
      errors.push(`Automation ${automation.id} has no steps`);
      continue;
    }
    
    // Create enrollment
    const enrollment = createEnrollment(automation.id, context.leadId, firstStep.id);
    if (enrollment) {
      enrolledAutomations.push(automation.id);
      console.log(`[Triggers] Enrolled lead ${context.leadId} into automation ${automation.id}`);
    } else {
      errors.push(`Failed to create enrollment for ${automation.id}`);
    }
  }
  
  return { enrolledAutomations, skippedAutomations, errors };
}

// Convenience trigger functions for specific events
export function onLeadCreated(leadId: string): ReturnType<typeof fireTrigger> {
  const lead = getLeadById(leadId);
  
  // Fire base "Lead Created" trigger
  const result = fireTrigger({
    event: 'Lead Created',
    leadId,
    timestamp: new Date().toISOString(),
  });
  
  // Also check for source-specific triggers (e.g., Zillow)
  if (lead?.source_id) {
    const sourceResult = fireTrigger({
      event: `Lead Source = ${lead.source_id}` as TriggerEvent,
      leadId,
      timestamp: new Date().toISOString(),
    });
    
    result.enrolledAutomations.push(...sourceResult.enrolledAutomations);
    result.skippedAutomations.push(...sourceResult.skippedAutomations);
    result.errors.push(...sourceResult.errors);
  }
  
  return result;
}

export function onLeadUpdated(leadId: string, changedFields: string[]): ReturnType<typeof fireTrigger> {
  return fireTrigger({
    event: 'Lead Updated',
    leadId,
    timestamp: new Date().toISOString(),
    metadata: { changedFields },
  });
}

export function onTagAdded(leadId: string, tag: string): ReturnType<typeof fireTrigger> {
  return fireTrigger({
    event: 'Tag Added',
    leadId,
    timestamp: new Date().toISOString(),
    metadata: { tag },
  });
}

export function onTourCompleted(leadId: string): ReturnType<typeof fireTrigger> {
  return fireTrigger({
    event: 'Tour Completed',
    leadId,
    timestamp: new Date().toISOString(),
  });
}

export function onMoveInCompleted(leadId: string): ReturnType<typeof fireTrigger> {
  return fireTrigger({
    event: 'Move-in Completed',
    leadId,
    timestamp: new Date().toISOString(),
  });
}
