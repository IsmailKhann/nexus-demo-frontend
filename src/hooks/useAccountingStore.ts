import { useState, useCallback } from 'react';
import {
  Account,
  Transaction,
  Invoice,
  Bill,
  Payment,
  SecurityDeposit,
  OwnerStatement,
  AuditLog,
  RecentActivity,
  QuickBooksState,
  mockAccounts,
  mockTransactions,
  mockInvoices,
  mockBills,
  mockPayments,
  mockSecurityDeposits,
  mockOwnerStatements,
  mockAuditLogs,
  mockRecentActivity,
  mockQuickBooksState,
  currentUserRole,
  UserRole,
} from '@/data/accountingData';

export function useAccountingStore() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [securityDeposits, setSecurityDeposits] = useState<SecurityDeposit[]>(mockSecurityDeposits);
  const [ownerStatements, setOwnerStatements] = useState<OwnerStatement[]>(mockOwnerStatements);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(mockRecentActivity);
  const [quickBooksState, setQuickBooksState] = useState<QuickBooksState>(mockQuickBooksState);
  const [userRole] = useState<UserRole>(currentUserRole);

  // Add activity helper
  const addActivity = useCallback((message: string, type: RecentActivity['type']) => {
    const newActivity: RecentActivity = {
      id: `act_${Date.now()}`,
      message,
      user: userRole === 'Admin' ? 'Sarah Admin' : userRole,
      timestamp: 'Just now',
      type,
    };
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
  }, [userRole]);

  // Add audit log helper
  const addAuditLog = useCallback((action: string, entityType: string, entityId: string, oldValue?: string, newValue?: string) => {
    const newLog: AuditLog = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: userRole === 'Admin' ? 'Sarah Admin' : userRole,
      user_role: userRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
      ip_address: '192.168.1.100',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [userRole]);

  // Account operations
  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: String(Math.max(...accounts.map(a => parseInt(a.id))) + 100),
    };
    setAccounts(prev => [...prev, newAccount]);
    addActivity(`Account ${newAccount.name} created`, 'account');
    addAuditLog('Account Created', 'Account', newAccount.id, undefined, newAccount.name);
    return newAccount;
  }, [accounts, addActivity, addAuditLog]);

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    addActivity(`Account ${id} updated`, 'account');
    addAuditLog('Account Updated', 'Account', id, undefined, JSON.stringify(updates));
  }, [addActivity, addAuditLog]);

  // Invoice operations
  const applyPayment = useCallback((invoiceId: string, amount: number, method: Payment['method']) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    const newBalance = Math.max(0, invoice.balance - amount);
    const newStatus: Invoice['status'] = newBalance === 0 ? 'Paid' : 'Partially Paid';

    setInvoices(prev => prev.map(i => 
      i.id === invoiceId ? { ...i, balance: newBalance, status: newStatus } : i
    ));

    const newPayment: Payment = {
      id: `PAY-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Tenant',
      payer_payee: invoice.tenant,
      property: invoice.property,
      amount,
      method,
      status: 'Cleared',
      reference: invoiceId,
      linked_entries: [],
    };
    setPayments(prev => [newPayment, ...prev]);

    addActivity(`Payment $${amount.toLocaleString()} posted to ${invoiceId}`, 'payment');
    addAuditLog('Payment Applied', 'Invoice', invoiceId, `Balance: $${invoice.balance}`, `Balance: $${newBalance}`);
  }, [invoices, addActivity, addAuditLog]);

  // Bill operations
  const approveBill = useCallback((billId: string) => {
    setBills(prev => prev.map(b => 
      b.id === billId ? { ...b, status: 'Approved' as const } : b
    ));
    addActivity(`Bill ${billId} approved for payment`, 'account');
    addAuditLog('Bill Approved', 'Bill', billId, 'Pending', 'Approved');
  }, [addActivity, addAuditLog]);

  const payBill = useCallback((billId: string, method: Payment['method']) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    setBills(prev => prev.map(b => 
      b.id === billId ? { ...b, status: 'Paid' as const, balance: 0 } : b
    ));

    const newPayment: Payment = {
      id: `PAY-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Vendor',
      payer_payee: bill.vendor,
      property: bill.property,
      amount: bill.total,
      method,
      status: 'Pending',
      reference: billId,
      linked_entries: [],
    };
    setPayments(prev => [newPayment, ...prev]);

    addActivity(`Bill ${billId} paid - $${bill.total.toLocaleString()}`, 'payment');
    addAuditLog('Bill Paid', 'Bill', billId, 'Approved', 'Paid');
  }, [bills, addActivity, addAuditLog]);

  // Security Deposit operations
  const releaseDeposit = useCallback((depositId: string, refundAmount: number, deductions: { description: string; amount: number }[]) => {
    const deposit = securityDeposits.find(d => d.id === depositId);
    if (!deposit) return;

    setSecurityDeposits(prev => prev.map(d => 
      d.id === depositId ? { ...d, status: 'Released' as const } : d
    ));

    if (refundAmount > 0) {
      const newPayment: Payment = {
        id: `PAY-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'Deposit Movement',
        payer_payee: `${deposit.tenant} (Refund)`,
        property: deposit.property,
        amount: refundAmount,
        method: 'Check',
        status: 'Pending',
        reference: depositId,
        linked_entries: [],
      };
      setPayments(prev => [newPayment, ...prev]);
    }

    addActivity(`Security deposit ${depositId} released - Refund: $${refundAmount.toLocaleString()}`, 'payment');
    addAuditLog('Deposit Released', 'Security Deposit', depositId, 'Held', `Released - Refund: $${refundAmount}`);
  }, [securityDeposits, addActivity, addAuditLog]);

  // Owner Statement operations
  const generateStatement = useCallback((statementId: string) => {
    setOwnerStatements(prev => prev.map(s => 
      s.id === statementId ? { ...s, status: 'Generated' as const } : s
    ));
    addActivity(`Owner Statement ${statementId} generated`, 'statement');
    addAuditLog('Statement Generated', 'Owner Statement', statementId, 'Draft', 'Generated');
  }, [addActivity, addAuditLog]);

  const sendStatement = useCallback((statementId: string) => {
    setOwnerStatements(prev => prev.map(s => 
      s.id === statementId ? { ...s, status: 'Sent' as const } : s
    ));
    addActivity(`Owner Statement ${statementId} sent to owner`, 'statement');
    addAuditLog('Statement Sent', 'Owner Statement', statementId, 'Generated', 'Sent');
  }, [addActivity, addAuditLog]);

  // QuickBooks operations
  const connectQuickBooks = useCallback(() => {
    setQuickBooksState(prev => ({ ...prev, isConnected: true }));
    addActivity('QuickBooks connected successfully', 'sync');
    addAuditLog('QuickBooks Connected', 'Integration', 'quickbooks', 'Disconnected', 'Connected');
  }, [addActivity, addAuditLog]);

  const disconnectQuickBooks = useCallback(() => {
    setQuickBooksState(prev => ({ ...prev, isConnected: false }));
    addActivity('QuickBooks disconnected', 'sync');
    addAuditLog('QuickBooks Disconnected', 'Integration', 'quickbooks', 'Connected', 'Disconnected');
  }, [addActivity, addAuditLog]);

  const syncQuickBooks = useCallback(() => {
    const recordCount = Math.floor(Math.random() * 30) + 30;
    const newLog = {
      timestamp: new Date().toISOString(),
      status: 'success' as const,
      message: 'Full sync completed',
      records: recordCount,
    };
    setQuickBooksState(prev => ({
      ...prev,
      lastSyncTime: new Date().toISOString(),
      recordsSynced: prev.recordsSynced + recordCount,
      syncLogs: [newLog, ...prev.syncLogs.slice(0, 9)],
    }));
    addActivity(`QuickBooks sync completed - ${recordCount} records`, 'sync');
    addAuditLog('QuickBooks Sync', 'Integration', `sync_${Date.now()}`, undefined, `${recordCount} records synced`);
  }, [addActivity, addAuditLog]);

  const updateQuickBooksSettings = useCallback((settings: Partial<QuickBooksState>) => {
    setQuickBooksState(prev => ({ ...prev, ...settings }));
  }, []);

  // Record manual payment
  const recordManualPayment = useCallback((payment: Omit<Payment, 'id' | 'linked_entries'>) => {
    const newPayment: Payment = {
      ...payment,
      id: `PAY-${Date.now()}`,
      linked_entries: [],
    };
    setPayments(prev => [newPayment, ...prev]);
    addActivity(`Manual payment $${payment.amount.toLocaleString()} recorded`, 'payment');
    addAuditLog('Manual Payment Recorded', 'Payment', newPayment.id, undefined, `$${payment.amount} - ${payment.payer_payee}`);
  }, [addActivity, addAuditLog]);

  // Post journal entry
  const postJournalEntry = useCallback((entries: { accountId: string; debit: number; credit: number; description: string }[], property: string) => {
    const ref = `JE-${Date.now()}`;
    const newTransactions: Transaction[] = entries.map((entry, idx) => ({
      id: `txn_${Date.now()}_${idx}`,
      date: new Date().toISOString().split('T')[0],
      ref,
      account_id: entry.accountId,
      type: 'Journal' as const,
      property,
      debit: entry.debit,
      credit: entry.credit,
      description: entry.description,
      created_by: userRole === 'Admin' ? 'Sarah Admin' : userRole,
    }));
    setTransactions(prev => [...newTransactions, ...prev]);
    
    // Update account balances
    entries.forEach(entry => {
      setAccounts(prev => prev.map(acc => {
        if (acc.id === entry.accountId) {
          const balanceChange = acc.normal_balance === 'Debit' 
            ? entry.debit - entry.credit 
            : entry.credit - entry.debit;
          return { ...acc, balance: acc.balance + balanceChange };
        }
        return acc;
      }));
    });

    addActivity(`Journal entry ${ref} posted`, 'account');
    addAuditLog('Journal Entry Posted', 'Transaction', ref, undefined, `${entries.length} lines`);
  }, [userRole, addActivity, addAuditLog]);

  // Get transactions for account
  const getTransactionsForAccount = useCallback((accountId: string) => {
    return transactions.filter(t => t.account_id === accountId);
  }, [transactions]);

  // Run report (simulated)
  const runReport = useCallback((reportId: string, filters: { property?: string; dateRange?: { start: string; end: string } }) => {
    addActivity(`Report ${reportId} generated`, 'report');
    addAuditLog('Report Generated', 'Report', reportId, undefined, JSON.stringify(filters));
  }, [addActivity, addAuditLog]);

  return {
    // State
    accounts,
    transactions,
    invoices,
    bills,
    payments,
    securityDeposits,
    ownerStatements,
    auditLogs,
    recentActivity,
    quickBooksState,
    userRole,
    
    // Account operations
    addAccount,
    updateAccount,
    
    // Invoice operations
    applyPayment,
    
    // Bill operations
    approveBill,
    payBill,
    
    // Security Deposit operations
    releaseDeposit,
    
    // Owner Statement operations
    generateStatement,
    sendStatement,
    
    // QuickBooks operations
    connectQuickBooks,
    disconnectQuickBooks,
    syncQuickBooks,
    updateQuickBooksSettings,
    
    // Payment operations
    recordManualPayment,
    
    // Transaction operations
    postJournalEntry,
    getTransactionsForAccount,
    
    // Report operations
    runReport,
  };
}
