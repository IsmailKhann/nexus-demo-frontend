// Flow Editor State Management Hook

import { useState, useCallback } from 'react';
import { BlockType, DripBlock, FlowStep, DripTrigger, StepCustomer, defaultBlocks, sampleSteps } from './types';

// Initialize blocks with sample steps
const initialBlocks: DripBlock[] = defaultBlocks.map(block => ({
  ...block,
  steps: sampleSteps[block.type] || [],
}));

export function useFlowEditor() {
  const [blocks, setBlocks] = useState<DripBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;
  const selectedStep = selectedBlock?.steps.find(s => s.id === selectedStepId) || null;

  const selectBlock = useCallback((blockId: string | null) => {
    setSelectedBlockId(blockId);
    setSelectedStepId(null);
  }, []);

  const selectStep = useCallback((stepId: string | null) => {
    setSelectedStepId(stepId);
  }, []);

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
  }, []);

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
    selectBlock,
    selectStep,
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
