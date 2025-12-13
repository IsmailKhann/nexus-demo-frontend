// React Hook for Drip Sequence Automation
// Provides reactive access to automation engine state

import { useState, useEffect, useCallback } from 'react';
import {
  initializeAutomationEngine,
  getAutomations,
  getAutomationById,
  getAutomationSteps,
  getAutomationLogs,
  getLeadById,
  getUserById,
  getTemplateById,
  subscribe,
  manualEnroll,
  manualUnenroll,
  pauseAutomation,
  resumeAutomation,
  activateAutomation,
  retryEnrollmentStep,
  getEngineStats,
  isEngineRunning,
} from '@/lib/automation';
import type { Automation, AutomationStep, AutomationLog } from '@/data/marketing';

export interface UseAutomationEngineResult {
  // State
  automations: Automation[];
  isEngineRunning: boolean;
  stats: ReturnType<typeof getEngineStats>;
  
  // Getters
  getAutomation: (id: string) => Automation | undefined;
  getSteps: (automationId: string) => AutomationStep[];
  getLogs: (automationId?: string) => AutomationLog[];
  getLeadName: (leadId: string) => string;
  getOwnerName: (userId: string) => string;
  getTemplateName: (templateId: string) => string;
  
  // Actions
  enrollLead: (automationId: string, leadId: string) => { success: boolean; error?: string };
  unenrollLead: (enrollmentId: string, reason?: string) => { success: boolean; error?: string };
  pause: (automationId: string) => { success: boolean; error?: string };
  resume: (automationId: string) => { success: boolean; error?: string };
  activate: (automationId: string) => { success: boolean; error?: string };
  retryStep: (enrollmentId: string, stepId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Refresh
  refresh: () => void;
}

export function useAutomationEngine(): UseAutomationEngineResult {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [stats, setStats] = useState(getEngineStats());
  const [, setRefreshKey] = useState(0);
  
  // Initialize engine on first use
  useEffect(() => {
    initializeAutomationEngine();
  }, []);
  
  // Subscribe to state changes
  useEffect(() => {
    const updateState = () => {
      setAutomations([...getAutomations()]);
      setStats(getEngineStats());
    };
    
    // Initial load
    updateState();
    
    // Subscribe to changes
    const unsubscribe = subscribe(updateState);
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const refresh = useCallback(() => {
    setAutomations([...getAutomations()]);
    setStats(getEngineStats());
    setRefreshKey(k => k + 1);
  }, []);
  
  const getAutomation = useCallback((id: string) => {
    return getAutomationById(id);
  }, []);
  
  const getSteps = useCallback((automationId: string) => {
    return getAutomationSteps(automationId);
  }, []);
  
  const getLogs = useCallback((automationId?: string) => {
    return getAutomationLogs(automationId);
  }, []);
  
  const getLeadName = useCallback((leadId: string) => {
    const lead = getLeadById(leadId);
    return lead?.full_name || 'Unknown';
  }, []);
  
  const getOwnerName = useCallback((userId: string) => {
    const user = getUserById(userId);
    return user?.full_name || 'Unknown';
  }, []);
  
  const getTemplateName = useCallback((templateId: string) => {
    const template = getTemplateById(templateId);
    return template?.name || templateId;
  }, []);
  
  const enrollLead = useCallback((automationId: string, leadId: string) => {
    const result = manualEnroll(automationId, leadId);
    refresh();
    return result;
  }, [refresh]);
  
  const unenrollLead = useCallback((enrollmentId: string, reason?: string) => {
    const result = manualUnenroll(enrollmentId, reason);
    refresh();
    return result;
  }, [refresh]);
  
  const pause = useCallback((automationId: string) => {
    const result = pauseAutomation(automationId);
    refresh();
    return result;
  }, [refresh]);
  
  const resume = useCallback((automationId: string) => {
    const result = resumeAutomation(automationId);
    refresh();
    return result;
  }, [refresh]);
  
  const activate = useCallback((automationId: string) => {
    const result = activateAutomation(automationId);
    refresh();
    return result;
  }, [refresh]);
  
  const retryStep = useCallback(async (enrollmentId: string, stepId: string) => {
    const result = await retryEnrollmentStep(enrollmentId, stepId);
    refresh();
    return result;
  }, [refresh]);
  
  return {
    automations,
    isEngineRunning: isEngineRunning(),
    stats,
    getAutomation,
    getSteps,
    getLogs,
    getLeadName,
    getOwnerName,
    getTemplateName,
    enrollLead,
    unenrollLead,
    pause,
    resume,
    activate,
    retryStep,
    refresh,
  };
}
