// Drip Sequence Automation Engine
// Public API for Nexus Marketing Automation

export * from './types';
export * from './engine';

// Initialize engine on import (lazy start)
import { startEngine } from './engine';

// Auto-start engine when module is first imported
let initialized = false;
export function initializeAutomationEngine(): void {
  if (initialized) return;
  initialized = true;
  startEngine();
  console.log('[AutomationEngine] Initialized and ready');
}
