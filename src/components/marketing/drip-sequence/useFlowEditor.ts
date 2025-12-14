// Flow Editor State Management Hook

import { useState, useCallback } from 'react';
import { BlockType, DripBlock, FlowStep, DripTrigger, StepCustomer, DripTriggerType, defaultBlocks, sampleSteps } from './types';
import { BlockSettings } from './BlockSettingsModal';
import { TriggerRunConfig } from './RunTriggerModal';

// Activity log types
export interface ActivityEntry {
  id: string;
  action: string;
  target: string;
  journey: string;
  time: string;
  timestamp: Date;
  icon: 'UserPlus' | 'CheckCircle' | 'Gift' | 'Bell' | 'Play' | 'Pause' | 'Settings';
  type: 'enrollment' | 'completion' | 'trigger' | 'settings' | 'status';
}

// Initialize blocks with sample steps
const initialBlocks: DripBlock[] = defaultBlocks.map(block => ({
  ...block,
  steps: sampleSteps[block.type] || [],
}));

// Initial activity log
const initialActivity: ActivityEntry[] = [
  { id: 'act_1', action: 'Lead enrolled', target: 'John Smith', journey: 'Lead Journey', time: '2 min ago', timestamp: new Date(Date.now() - 2*60*1000), icon: 'UserPlus', type: 'enrollment' },
  { id: 'act_2', action: 'Step completed', target: 'Emily Davis', journey: 'Lead Journey', time: '15 min ago', timestamp: new Date(Date.now() - 15*60*1000), icon: 'CheckCircle', type: 'completion' },
  { id: 'act_3', action: 'Birthday wish sent', target: 'Robert Ford', journey: 'Wishes', time: '1 hour ago', timestamp: new Date(Date.now() - 60*60*1000), icon: 'Gift', type: 'trigger' },
  { id: 'act_4', action: 'Reminder triggered', target: 'Sarah Chen', journey: 'Reminders', time: '2 hours ago', timestamp: new Date(Date.now() - 2*60*60*1000), icon: 'Bell', type: 'trigger' },
];

export function useFlowEditor() {
  const [blocks, setBlocks] = useState<DripBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>(initialActivity);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;
  const selectedStep = selectedBlock?.steps.find(s => s.id === selectedStepId) || null;

  const selectBlock = useCallback((blockId: string | null) => {
    setSelectedBlockId(blockId);
    setSelectedStepId(null);
  }, []);

  const selectStep = useCallback((stepId: string | null) => {
    setSelectedStepId(stepId);
  }, []);

  // Add activity to log
  const addActivity = useCallback((entry: Omit<ActivityEntry, 'id' | 'time' | 'timestamp'>) => {
    const now = new Date();
    const newEntry: ActivityEntry = {
      ...entry,
      id: `act_${Date.now()}`,
      time: 'Just now',
      timestamp: now,
    };
    setActivityLog(prev => [newEntry, ...prev.slice(0, 19)]); // Keep last 20
  }, []);

  // Create new block
  const createBlock = useCallback((config: {
    name: string;
    type: BlockType | 'custom';
    description: string;
    triggerMode: 'automated' | 'manual' | 'hybrid';
  }) => {
    const blockType: BlockType = config.type === 'custom' ? 'lead-journey' : config.type;
    
    // Determine allowed triggers based on type and mode
    let allowedTriggers: DripTriggerType[] = ['manual_only'];
    if (config.type !== 'community-message') {
      if (config.triggerMode === 'automated' || config.triggerMode === 'hybrid') {
        allowedTriggers = ['on_entry', 'after_delay', 'at_datetime', 'on_condition', 'manual_only'];
      }
      if (config.type === 'wishes') {
        allowedTriggers = ['at_datetime', 'manual_only'];
      }
    }

    const newBlock: DripBlock = {
      id: `block_${Date.now()}`,
      type: blockType,
      name: config.name,
      description: config.description || `Custom ${config.type} block`,
      icon: config.type === 'lead-journey' ? 'route' :
            config.type === 'community-message' ? 'megaphone' :
            config.type === 'reminders' ? 'bell' :
            config.type === 'wishes' ? 'gift' : 'route',
      steps: [{
        id: `step_${Date.now()}`,
        title: 'Welcome Step',
        subject: 'Welcome!',
        body: 'Enter your message content here...',
        trigger: { type: allowedTriggers[0] },
        isEnabled: true,
        order: 1,
        customers: [],
      }],
      allowedTriggers,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBlocks(prev => [...prev, newBlock]);
    
    addActivity({
      action: 'Block created',
      target: config.name,
      journey: config.name,
      icon: 'Settings',
      type: 'settings',
    });

    return newBlock.id;
  }, [addActivity]);

  // Update block settings
  const updateBlockSettings = useCallback((blockId: string, updates: Partial<DripBlock> & { settings?: BlockSettings }) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      
      const updatedBlock = {
        ...block,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Remove settings from the block object as it's not a standard field
      delete (updatedBlock as any).settings;

      return updatedBlock;
    }));

    const block = blocks.find(b => b.id === blockId);
    if (block) {
      addActivity({
        action: 'Settings updated',
        target: updates.name || block.name,
        journey: updates.name || block.name,
        icon: 'Settings',
        type: 'settings',
      });
    }
  }, [blocks, addActivity]);

  // Toggle block active status
  const toggleBlockActive = useCallback((blockId: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      
      return {
        ...block,
        isActive: !block.isActive,
        updatedAt: new Date().toISOString(),
      };
    }));

    const block = blocks.find(b => b.id === blockId);
    if (block) {
      addActivity({
        action: block.isActive ? 'Block paused' : 'Block activated',
        target: block.name,
        journey: block.name,
        icon: block.isActive ? 'Pause' : 'Play',
        type: 'status',
      });
    }
  }, [blocks, addActivity]);

  // Run trigger
  const runTrigger = useCallback((blockId: string, config: TriggerRunConfig) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Update block status
    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId) return b;
      return {
        ...b,
        isActive: true,
        updatedAt: new Date().toISOString(),
      };
    }));

    // Add activity
    const actionText = config.mode === 'once' 
      ? (config.runImmediately ? 'Trigger executed' : 'Trigger scheduled')
      : 'Series scheduled';
    
    addActivity({
      action: actionText,
      target: block.name,
      journey: block.name,
      icon: 'Play',
      type: 'trigger',
    });

    return {
      success: true,
      message: config.mode === 'once' && config.runImmediately 
        ? 'Trigger executed successfully'
        : `Trigger ${config.mode === 'series' ? 'series' : ''} scheduled successfully`,
    };
  }, [blocks, addActivity]);

  const addStep = useCallback((blockId: string, afterStepId?: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      
      const newStep: FlowStep = {
        id: `step_${Date.now()}`,
        title: 'New Step',
        subject: 'New Message Subject',
        body: 'Enter your message content here...',
        trigger: { type: block.allowedTriggers[0] || 'manual_only' },
        isEnabled: true,
        order: block.steps.length + 1,
        customers: [],
      };

      let newSteps: FlowStep[];
      if (afterStepId) {
        const afterIndex = block.steps.findIndex(s => s.id === afterStepId);
        newSteps = [
          ...block.steps.slice(0, afterIndex + 1),
          newStep,
          ...block.steps.slice(afterIndex + 1),
        ];
      } else {
        newSteps = [...block.steps, newStep];
      }

      // Reorder steps
      newSteps = newSteps.map((s, i) => ({ ...s, order: i + 1 }));

      return { ...block, steps: newSteps, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const updateStep = useCallback((blockId: string, stepId: string, updates: Partial<FlowStep>) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      
      const newSteps = block.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      );

      return { ...block, steps: newSteps, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const deleteStep = useCallback((blockId: string, stepId: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      
      const newSteps = block.steps
        .filter(s => s.id !== stepId)
        .map((s, i) => ({ ...s, order: i + 1 }));

      return { ...block, steps: newSteps, updatedAt: new Date().toISOString() };
    }));
    
    if (selectedStepId === stepId) {
      setSelectedStepId(null);
    }
  }, [selectedStepId]);

  const duplicateStep = useCallback((blockId: string, stepId: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      
      const stepIndex = block.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return block;

      const originalStep = block.steps[stepIndex];
      const duplicatedStep: FlowStep = {
        ...originalStep,
        id: `step_${Date.now()}`,
        title: `${originalStep.title} (Copy)`,
        customers: [],
      };

      const newSteps = [
        ...block.steps.slice(0, stepIndex + 1),
        duplicatedStep,
        ...block.steps.slice(stepIndex + 1),
      ].map((s, i) => ({ ...s, order: i + 1 }));

      return { ...block, steps: newSteps, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const toggleStepEnabled = useCallback((blockId: string, stepId: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      
      const newSteps = block.steps.map(step => 
        step.id === stepId ? { ...step, isEnabled: !step.isEnabled } : step
      );

      return { ...block, steps: newSteps, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const updateStepTrigger = useCallback((blockId: string, stepId: string, trigger: DripTrigger) => {
    updateStep(blockId, stepId, { trigger });
  }, [updateStep]);

  const reorderSteps = useCallback((blockId: string, fromIndex: number, toIndex: number) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      
      const newSteps = [...block.steps];
      const [removed] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, removed);

      return { 
        ...block, 
        steps: newSteps.map((s, i) => ({ ...s, order: i + 1 })),
        updatedAt: new Date().toISOString() 
      };
    }));
  }, []);

  const addCustomerToStep = useCallback((blockId: string, stepId: string, customer: StepCustomer) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      
      const newSteps = block.steps.map(step => {
        if (step.id !== stepId) return step;
        if (step.customers.some(c => c.id === customer.id)) return step;
        return { ...step, customers: [...step.customers, customer] };
      });

      return { ...block, steps: newSteps, updatedAt: new Date().toISOString() };
    }));

    const block = blocks.find(b => b.id === blockId);
    if (block) {
      addActivity({
        action: 'Customer added',
        target: customer.name,
        journey: block.name,
        icon: 'UserPlus',
        type: 'enrollment',
      });
    }
  }, [blocks, addActivity]);

  const removeCustomerFromStep = useCallback((blockId: string, stepId: string, customerId: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      
      const newSteps = block.steps.map(step => {
        if (step.id !== stepId) return step;
        return { ...step, customers: step.customers.filter(c => c.id !== customerId) };
      });

      return { ...block, steps: newSteps, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const moveCustomerToStep = useCallback((
    blockId: string, 
    fromStepId: string, 
    toStepId: string, 
    customerId: string
  ) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      
      let customerToMove: StepCustomer | null = null;
      
      const newSteps = block.steps.map(step => {
        if (step.id === fromStepId) {
          customerToMove = step.customers.find(c => c.id === customerId) || null;
          return { ...step, customers: step.customers.filter(c => c.id !== customerId) };
        }
        return step;
      }).map(step => {
        if (step.id === toStepId && customerToMove) {
          return { 
            ...step, 
            customers: [...step.customers, { ...customerToMove, enteredAt: new Date().toISOString(), status: 'active' as const }] 
          };
        }
        return step;
      });

      return { ...block, steps: newSteps, updatedAt: new Date().toISOString() };
    }));
  }, []);

  return {
    blocks,
    selectedBlock,
    selectedStep,
    selectedBlockId,
    selectedStepId,
    activityLog,
    selectBlock,
    selectStep,
    createBlock,
    updateBlockSettings,
    toggleBlockActive,
    runTrigger,
    addStep,
    updateStep,
    deleteStep,
    duplicateStep,
    toggleStepEnabled,
    updateStepTrigger,
    reorderSteps,
    addCustomerToStep,
    removeCustomerFromStep,
    moveCustomerToStep,
  };
}
