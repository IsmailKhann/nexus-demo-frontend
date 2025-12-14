// Automations Store - In-memory state management for automation control center
import { useState, useCallback } from 'react';
import { automations as initialAutomations, type Automation } from '@/data/marketing';

export interface ExtendedAutomation extends Automation {
  description?: string;
  blockId?: string;
  triggerMode: 'automated' | 'manual' | 'hybrid';
  allowManualRun: boolean;
  allowMultipleRuns: boolean;
  cooldownPeriod: number;
  lastRunAt?: string;
  nextRunAt?: string;
  runHistory: RunHistoryEntry[];
  isScheduled?: boolean;
  scheduleConfig?: ScheduleConfig;
}

export interface RunHistoryEntry {
  id: string;
  type: 'once' | 'series';
  status: 'completed' | 'running' | 'scheduled' | 'failed';
  startedAt: string;
  completedAt?: string;
  enrolledCount: number;
  successCount: number;
  failedCount: number;
}

export interface ScheduleConfig {
  mode: 'once' | 'series';
  runDate?: string;
  runTime?: string;
  startDate?: string;
  endDate?: string;
  hasEndDate?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  customInterval?: number;
  customUnit?: 'days' | 'weeks' | 'months';
  audienceType: 'all' | 'segment' | 'custom';
  audienceSegment?: string;
}

export interface AutomationActivityEntry {
  id: string;
  automationId: string;
  automationName: string;
  action: string;
  timestamp: Date;
  details?: string;
}

// Initialize with extended properties
const initializeAutomations = (): ExtendedAutomation[] => {
  return initialAutomations.map(a => ({
    ...a,
    triggerMode: 'automated' as const,
    allowManualRun: true,
    allowMultipleRuns: false,
    cooldownPeriod: 24,
    runHistory: [],
    lastRunAt: a.enrolled_count > 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  }));
};

export function useAutomationsStore() {
  const [automations, setAutomations] = useState<ExtendedAutomation[]>(initializeAutomations());
  const [activityLog, setActivityLog] = useState<AutomationActivityEntry[]>([]);

  const addActivity = useCallback((entry: Omit<AutomationActivityEntry, 'id' | 'timestamp'>) => {
    setActivityLog(prev => [{
      ...entry,
      id: `act_${Date.now()}`,
      timestamp: new Date(),
    }, ...prev.slice(0, 49)]); // Keep last 50
  }, []);

  const getAutomation = useCallback((id: string) => {
    return automations.find(a => a.id === id);
  }, [automations]);

  const createAutomation = useCallback((config: {
    name: string;
    blockId: string;
    triggerMode: 'automated' | 'manual' | 'hybrid';
  }) => {
    const newAutomation: ExtendedAutomation = {
      id: `AUTO_${Date.now()}`,
      name: config.name,
      trigger_type: config.triggerMode === 'manual' ? 'Manual' : 'Event',
      trigger_event: config.triggerMode === 'manual' ? 'Manual Trigger' : 'Lead Created',
      status: 'Active',
      enrolled_count: 0,
      completed_count: 0,
      open_rate: 0,
      click_rate: 0,
      created_by_user_id: 'USR_001',
      created_at: new Date().toISOString(),
      blockId: config.blockId,
      triggerMode: config.triggerMode,
      allowManualRun: true,
      allowMultipleRuns: false,
      cooldownPeriod: 24,
      runHistory: [],
    };

    setAutomations(prev => [newAutomation, ...prev]);
    
    addActivity({
      automationId: newAutomation.id,
      automationName: newAutomation.name,
      action: 'Automation created',
    });

    return newAutomation;
  }, [addActivity]);

  const updateAutomation = useCallback((id: string, updates: Partial<ExtendedAutomation>) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates } : a
    ));

    const automation = automations.find(a => a.id === id);
    if (automation) {
      addActivity({
        automationId: id,
        automationName: updates.name || automation.name,
        action: 'Settings updated',
      });
    }
  }, [automations, addActivity]);

  const pauseAutomation = useCallback((id: string) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'Paused' } : a
    ));

    const automation = automations.find(a => a.id === id);
    if (automation) {
      addActivity({
        automationId: id,
        automationName: automation.name,
        action: 'Automation paused',
      });
    }
  }, [automations, addActivity]);

  const resumeAutomation = useCallback((id: string) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'Active' } : a
    ));

    const automation = automations.find(a => a.id === id);
    if (automation) {
      addActivity({
        automationId: id,
        automationName: automation.name,
        action: 'Automation resumed',
      });
    }
  }, [automations, addActivity]);

  const duplicateAutomation = useCallback((id: string) => {
    const original = automations.find(a => a.id === id);
    if (!original) return null;

    const duplicate: ExtendedAutomation = {
      ...original,
      id: `AUTO_${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: 'Draft',
      enrolled_count: 0,
      completed_count: 0,
      created_at: new Date().toISOString(),
      runHistory: [],
      lastRunAt: undefined,
      nextRunAt: undefined,
      isScheduled: false,
      scheduleConfig: undefined,
    };

    setAutomations(prev => [duplicate, ...prev]);
    
    addActivity({
      automationId: duplicate.id,
      automationName: duplicate.name,
      action: 'Automation duplicated',
      details: `From "${original.name}"`,
    });

    return duplicate;
  }, [automations, addActivity]);

  const archiveAutomation = useCallback((id: string) => {
    const automation = automations.find(a => a.id === id);
    setAutomations(prev => prev.filter(a => a.id !== id));

    if (automation) {
      addActivity({
        automationId: id,
        automationName: automation.name,
        action: 'Automation archived',
      });
    }
  }, [automations, addActivity]);

  const runAutomation = useCallback((id: string, config: ScheduleConfig) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    const isImmediate = config.mode === 'once' && !config.runDate;
    const runEntry: RunHistoryEntry = {
      id: `run_${Date.now()}`,
      type: config.mode,
      status: isImmediate ? 'running' : 'scheduled',
      startedAt: new Date().toISOString(),
      enrolledCount: config.audienceType === 'all' ? 508 : 
                     config.audienceSegment ? Math.floor(Math.random() * 200) + 20 : 0,
      successCount: 0,
      failedCount: 0,
    };

    setAutomations(prev => prev.map(a => {
      if (a.id !== id) return a;
      
      return {
        ...a,
        status: isImmediate ? 'Active' : a.status,
        isScheduled: config.mode === 'series' || (!isImmediate),
        scheduleConfig: config,
        lastRunAt: isImmediate ? new Date().toISOString() : a.lastRunAt,
        nextRunAt: !isImmediate ? config.runDate : 
                   config.mode === 'series' ? config.startDate : undefined,
        runHistory: [runEntry, ...a.runHistory.slice(0, 9)],
        enrolled_count: isImmediate ? a.enrolled_count + runEntry.enrolledCount : a.enrolled_count,
      };
    }));

    // Simulate completion for immediate runs
    if (isImmediate) {
      setTimeout(() => {
        setAutomations(prev => prev.map(a => {
          if (a.id !== id) return a;
          
          const updatedHistory = a.runHistory.map((r, i) => 
            i === 0 ? { 
              ...r, 
              status: 'completed' as const, 
              completedAt: new Date().toISOString(),
              successCount: Math.floor(r.enrolledCount * 0.95),
              failedCount: Math.floor(r.enrolledCount * 0.05),
            } : r
          );
          
          return {
            ...a,
            runHistory: updatedHistory,
            completed_count: a.completed_count + updatedHistory[0].successCount,
          };
        }));
      }, 2000);
    }

    addActivity({
      automationId: id,
      automationName: automation.name,
      action: isImmediate ? 'Automation executed' : 
              config.mode === 'series' ? 'Series scheduled' : 'Run scheduled',
      details: config.mode === 'series' 
        ? `${config.frequency} starting ${config.startDate}` 
        : isImmediate ? 'Immediate execution' : `Scheduled for ${config.runDate}`,
    });
  }, [automations, addActivity]);

  return {
    automations,
    activityLog,
    getAutomation,
    createAutomation,
    updateAutomation,
    pauseAutomation,
    resumeAutomation,
    duplicateAutomation,
    archiveAutomation,
    runAutomation,
  };
}
