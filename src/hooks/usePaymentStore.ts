import { useState, useCallback } from 'react';
import {
  PaymentMethod,
  RecurringPlan,
  TenantInvoice,
  TenantPayment,
  mockPaymentMethods,
  mockRecurringPlans,
  mockTenantInvoices,
  mockTenantPayments,
  mockTenantDeposit,
  processCardPayment,
  processACHPayment,
  calculateNextRunDate,
  setSimulateFailure,
} from '@/lib/paymentEngine';

export function usePaymentStore() {
  // Admin state
  const [recurringPlans, setRecurringPlans] = useState<RecurringPlan[]>(mockRecurringPlans);
  
  // Tenant state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [tenantInvoices, setTenantInvoices] = useState<TenantInvoice[]>(mockTenantInvoices);
  const [tenantPayments, setTenantPayments] = useState<TenantPayment[]>(mockTenantPayments);
  const [tenantDeposit] = useState(mockTenantDeposit);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulateFailures, setSimulateFailures] = useState(false);

  // Toggle failure simulation
  const toggleFailureSimulation = useCallback((enabled: boolean) => {
    setSimulateFailures(enabled);
    setSimulateFailure(enabled);
  }, []);

  // === ADMIN OPERATIONS ===

  // Pause recurring plan
  const pauseRecurringPlan = useCallback((planId: string) => {
    setRecurringPlans(prev =>
      prev.map(p => (p.id === planId ? { ...p, status: 'paused' as const } : p))
    );
  }, []);

  // Resume recurring plan
  const resumeRecurringPlan = useCallback((planId: string) => {
    setRecurringPlans(prev =>
      prev.map(p => (p.id === planId ? { ...p, status: 'active' as const } : p))
    );
  }, []);

  // Run recurring payment now (simulate)
  const runRecurringNow = useCallback(async (planId: string) => {
    const plan = recurringPlans.find(p => p.id === planId);
    if (!plan) return { success: false, message: 'Plan not found' };

    setIsProcessing(true);
    
    const paymentMethod = paymentMethods.find(pm => pm.id === plan.paymentMethodId);
    const result = paymentMethod?.type === 'card'
      ? await processCardPayment(plan.amount, plan.paymentMethodId)
      : await processACHPayment(plan.amount, plan.paymentMethodId);

    setRecurringPlans(prev =>
      prev.map(p => {
        if (p.id === planId) {
          return {
            ...p,
            lastRunDate: new Date().toISOString().split('T')[0],
            lastRunStatus: result.success ? 'success' : 'failed',
            nextRunDate: result.success
              ? calculateNextRunDate(new Date().toISOString().split('T')[0], p.frequency)
              : p.nextRunDate,
          };
        }
        return p;
      })
    );

    setIsProcessing(false);
    return result;
  }, [recurringPlans, paymentMethods]);

  // Run all due recurring payments
  const runAllDueRecurring = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const duePlans = recurringPlans.filter(
      p => p.status === 'active' && p.nextRunDate <= today
    );

    setIsProcessing(true);
    const results: { planId: string; success: boolean }[] = [];

    for (const plan of duePlans) {
      const paymentMethod = paymentMethods.find(pm => pm.id === plan.paymentMethodId);
      const result = paymentMethod?.type === 'card'
        ? await processCardPayment(plan.amount, plan.paymentMethodId)
        : await processACHPayment(plan.amount, plan.paymentMethodId);

      results.push({ planId: plan.id, success: result.success });

      setRecurringPlans(prev =>
        prev.map(p => {
          if (p.id === plan.id) {
            return {
              ...p,
              lastRunDate: today,
              lastRunStatus: result.success ? 'success' : 'failed',
              nextRunDate: result.success
                ? calculateNextRunDate(today, p.frequency)
                : p.nextRunDate,
            };
          }
          return p;
        })
      );
    }

    setIsProcessing(false);
    return results;
  }, [recurringPlans, paymentMethods]);

  // Clear pending ACH (admin demo control)
  const clearAllPendingACH = useCallback(() => {
    setTenantPayments(prev =>
      prev.map(p => (p.status === 'pending' ? { ...p, status: 'cleared' as const } : p))
    );
  }, []);

  // === TENANT OPERATIONS ===

  // Pay invoice
  const payInvoice = useCallback(
    async (invoiceId: string, amount: number, paymentMethodId: string) => {
      const invoice = tenantInvoices.find(i => i.id === invoiceId);
      const method = paymentMethods.find(pm => pm.id === paymentMethodId);
      if (!invoice || !method) return { success: false, message: 'Invalid invoice or payment method' };

      setIsProcessing(true);

      const result =
        method.type === 'card'
          ? await processCardPayment(amount, paymentMethodId)
          : await processACHPayment(amount, paymentMethodId);

      if (result.success) {
        // Update invoice
        const newBalance = Math.max(0, invoice.balance - amount);
        setTenantInvoices(prev =>
          prev.map(i => {
            if (i.id === invoiceId) {
              return {
                ...i,
                balance: newBalance,
                status: newBalance === 0 ? 'paid' : 'partial',
                paidAt: newBalance === 0 ? new Date().toISOString() : undefined,
              };
            }
            return i;
          })
        );

        // Add payment record
        const newPayment: TenantPayment = {
          id: `tpay_${Date.now()}`,
          tenantId: invoice.tenantId,
          invoiceId,
          amount,
          method: method.type,
          methodLast4: method.last4,
          status: result.status === 'cleared' ? 'cleared' : 'pending',
          date: new Date().toISOString().split('T')[0],
          reference: result.transactionId || `PAY-${Date.now()}`,
          description: `Payment for ${invoice.description}`,
          receiptUrl: '#',
        };
        setTenantPayments(prev => [newPayment, ...prev]);
      }

      setIsProcessing(false);
      return result;
    },
    [tenantInvoices, paymentMethods]
  );

  // Add payment method
  const addPaymentMethod = useCallback((method: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm_${Date.now()}`,
    };
    
    // If this is set as default, unset others
    if (newMethod.isDefault) {
      setPaymentMethods(prev => [
        ...prev.map(pm => ({ ...pm, isDefault: false })),
        newMethod,
      ]);
    } else {
      setPaymentMethods(prev => [...prev, newMethod]);
    }
    
    return newMethod;
  }, []);

  // Remove payment method
  const removePaymentMethod = useCallback((methodId: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== methodId));
  }, []);

  // Set default payment method
  const setDefaultPaymentMethod = useCallback((methodId: string) => {
    setPaymentMethods(prev =>
      prev.map(pm => ({ ...pm, isDefault: pm.id === methodId }))
    );
  }, []);

  // Setup recurring payment (tenant)
  const setupRecurringPayment = useCallback(
    (
      amount: number,
      frequency: RecurringPlan['frequency'],
      startDate: string,
      paymentMethodId: string,
      property: string,
      unit: string
    ) => {
      const newPlan: RecurringPlan = {
        id: `rp_${Date.now()}`,
        tenantId: 't_demo',
        tenantName: 'Demo Tenant',
        propertyId: 'prop_demo',
        property,
        unit,
        amount,
        frequency,
        nextRunDate: startDate,
        paymentMethodId,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setRecurringPlans(prev => [...prev, newPlan]);
      return newPlan;
    },
    []
  );

  // Cancel recurring payment (tenant)
  const cancelRecurringPayment = useCallback((planId: string) => {
    setRecurringPlans(prev =>
      prev.map(p => (p.id === planId ? { ...p, status: 'cancelled' as const } : p))
    );
  }, []);

  // Get tenant's recurring plan
  const getTenantRecurringPlan = useCallback(() => {
    return recurringPlans.find(
      p => p.tenantId === 't_demo' && p.status !== 'cancelled'
    );
  }, [recurringPlans]);

  // Calculate outstanding balance
  const getOutstandingBalance = useCallback(() => {
    return tenantInvoices
      .filter(i => i.tenantId === 't_demo' && i.balance > 0)
      .reduce((sum, i) => sum + i.balance, 0);
  }, [tenantInvoices]);

  // Get last payment
  const getLastPayment = useCallback(() => {
    return tenantPayments.find(p => p.tenantId === 't_demo' && p.status === 'cleared');
  }, [tenantPayments]);

  return {
    // Admin state & operations
    recurringPlans,
    pauseRecurringPlan,
    resumeRecurringPlan,
    runRecurringNow,
    runAllDueRecurring,
    clearAllPendingACH,

    // Tenant state
    paymentMethods,
    tenantInvoices,
    tenantPayments,
    tenantDeposit,

    // Tenant operations
    payInvoice,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    setupRecurringPayment,
    cancelRecurringPayment,
    getTenantRecurringPlan,
    getOutstandingBalance,
    getLastPayment,

    // Processing state
    isProcessing,
    simulateFailures,
    toggleFailureSimulation,
  };
}
