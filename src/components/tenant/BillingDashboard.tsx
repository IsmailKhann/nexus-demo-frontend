import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  DollarSign, FileText, CreditCard, Clock, CheckCircle, AlertCircle, 
  Download, ArrowRight, Plus, Trash2, Star, Building2, Calendar,
  RefreshCw, Shield, AlertTriangle, Undo2, ChevronRight, Zap
} from 'lucide-react';
import { usePaymentStore } from '@/hooks/usePaymentStore';
import { PayNowModal } from './PayNowModal';
import { AddPaymentMethodModal } from './AddPaymentMethodModal';
import { SetupRecurringModal } from './SetupRecurringModal';
import { InvoiceDetailPanel } from './InvoiceDetailPanel';
import { toast } from '@/hooks/use-toast';
import { TenantInvoice } from '@/lib/paymentEngine';

export const BillingDashboard = () => {
  const {
    paymentMethods,
    tenantInvoices,
    tenantPayments,
    tenantDeposit,
    payInvoice,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    setupRecurringPayment,
    cancelRecurringPayment,
    getTenantRecurringPlan,
    getOutstandingBalance,
    getLastPayment,
    isProcessing,
  } = usePaymentStore();

  const [payNowOpen, setPayNowOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<TenantInvoice | null>(null);
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [setupRecurringOpen, setSetupRecurringOpen] = useState(false);
  const [invoiceDetailOpen, setInvoiceDetailOpen] = useState(false);
  const [chargeDetailOpen, setChargeDetailOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<TenantInvoice | null>(null);

  const outstandingBalance = getOutstandingBalance();
  const lastPayment = getLastPayment();
  const recurringPlan = getTenantRecurringPlan();
  const openInvoices = tenantInvoices.filter(i => i.balance > 0);
  const paidInvoices = tenantInvoices.filter(i => i.status === 'paid');
  const defaultMethod = paymentMethods.find(m => m.isDefault);

  // Get next due date
  const nextDueInvoice = openInvoices.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )[0];

  // Get status for balance
  const getBalanceStatus = () => {
    if (outstandingBalance === 0) return 'paid';
    if (openInvoices.some(i => i.status === 'overdue')) return 'overdue';
    if (openInvoices.some(i => i.status === 'partial')) return 'partial';
    return 'due';
  };

  const balanceStatus = getBalanceStatus();

  const handlePayNow = (invoice: TenantInvoice) => {
    setSelectedInvoice(invoice);
    setPayNowOpen(true);
  };

  const handleViewCharge = (charge: TenantInvoice) => {
    setSelectedCharge(charge);
    setChargeDetailOpen(true);
  };

  const handleRemoveMethod = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method?.isDefault) {
      toast({ title: 'Cannot Remove', description: 'Cannot remove default payment method', variant: 'destructive' });
      return;
    }
    removePaymentMethod(methodId);
    toast({ title: 'Payment Method Removed' });
  };

  const handleSetDefault = (methodId: string) => {
    setDefaultPaymentMethod(methodId);
    toast({ title: 'Default Updated', description: 'Default payment method updated' });
  };

  const handleCancelRecurring = () => {
    if (recurringPlan) {
      cancelRecurringPayment(recurringPlan.id);
      toast({ title: 'Auto-Pay Cancelled' });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      open: { variant: 'secondary', label: 'Due' },
      overdue: { variant: 'destructive', label: 'Overdue' },
      paid: { variant: 'default', label: 'Paid' },
      partial: { variant: 'outline', label: 'Partially Paid' },
      due: { variant: 'secondary', label: 'Due' },
    };
    const c = config[status] || { variant: 'outline', label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string, refundAmount?: number) => {
    if (status === 'refunded') {
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Refunded</Badge>;
    }
    if (status === 'partial_refund') {
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Partial Refund</Badge>;
    }
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      cleared: { variant: 'default' },
      pending: { variant: 'secondary' },
      processing: { variant: 'outline' },
      failed: { variant: 'destructive' },
    };
    return <Badge variant={config[status]?.variant || 'outline'}>{status}</Badge>;
  };

  const getChargeTypeIcon = (type: string) => {
    switch (type) {
      case 'rent': return <Building2 className="h-4 w-4" />;
      case 'utility': return <Zap className="h-4 w-4" />;
      case 'fee': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1️⃣ BALANCE SUMMARY - Prominent top section */}
      <Card className={`border-2 ${balanceStatus === 'overdue' ? 'border-destructive bg-destructive/5' : balanceStatus === 'due' ? 'border-primary/50' : 'border-green-500/50 bg-green-500/5'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
              <div className="flex items-center gap-3">
                <span className={`text-4xl font-bold ${balanceStatus === 'overdue' ? 'text-destructive' : balanceStatus === 'paid' ? 'text-green-600' : ''}`}>
                  ${outstandingBalance.toLocaleString()}
                </span>
                {getStatusBadge(balanceStatus)}
              </div>
              {nextDueInvoice && outstandingBalance > 0 && (
                <p className="text-sm text-muted-foreground">
                  Due by {new Date(nextDueInvoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              {outstandingBalance === 0 && (
                <p className="text-sm text-green-600">You're all caught up!</p>
              )}
            </div>
            {outstandingBalance > 0 && (
              <Button size="lg" className="w-full md:w-auto" onClick={() => openInvoices[0] && handlePayNow(openInvoices[0])}>
                <DollarSign className="h-5 w-5 mr-2" />
                Pay Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2️⃣ LEASE & RENT CHARGES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lease & Rent Charges
          </CardTitle>
          <CardDescription>Your current and past charges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium text-sm">Description</th>
                  <th className="text-left p-3 font-medium text-sm hidden md:table-cell">Billing Period</th>
                  <th className="text-right p-3 font-medium text-sm">Amount</th>
                  <th className="text-right p-3 font-medium text-sm">Balance</th>
                  <th className="text-center p-3 font-medium text-sm">Status</th>
                  <th className="text-right p-3 font-medium text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tenantInvoices.map(charge => (
                  <tr 
                    key={charge.id} 
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handleViewCharge(charge)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${charge.chargeType === 'rent' ? 'bg-primary/10 text-primary' : charge.chargeType === 'fee' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>
                          {getChargeTypeIcon(charge.chargeType)}
                        </div>
                        <div>
                          <p className="font-medium">{charge.description}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{charge.billingPeriod || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">
                      {charge.billingPeriod || '-'}
                    </td>
                    <td className="p-3 text-right font-mono">${charge.amount.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-medium">
                      ${charge.balance.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">{getStatusBadge(charge.status)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {charge.balance > 0 && (
                          <Button 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); handlePayNow(charge); }}
                          >
                            Pay
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewCharge(charge); }}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 3️⃣ AUTO-PAY SETTINGS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Auto-Pay Settings
          </CardTitle>
          <CardDescription>Set up automatic rent payments</CardDescription>
        </CardHeader>
        <CardContent>
          {recurringPlan && recurringPlan.status === 'active' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-700">Auto-Pay is Active</p>
                    <p className="text-sm text-muted-foreground">
                      ${recurringPlan.amount.toLocaleString()} • Monthly • {paymentMethods.find(m => m.id === recurringPlan.paymentMethodId)?.type === 'card' ? 'Card' : 'Bank'} •••• {paymentMethods.find(m => m.id === recurringPlan.paymentMethodId)?.last4}
                    </p>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="text-lg font-bold capitalize">{recurringPlan.frequency}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Next Payment</p>
                  <p className="text-lg font-bold">{new Date(recurringPlan.nextRunDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <div className="flex items-center gap-2">
                    {paymentMethods.find(m => m.id === recurringPlan.paymentMethodId)?.type === 'card' ? (
                      <CreditCard className="h-4 w-4" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                    <span className="font-medium">•••• {paymentMethods.find(m => m.id === recurringPlan.paymentMethodId)?.last4}</span>
                  </div>
                </div>
              </div>

              {recurringPlan.lastRunDate && (
                <p className="text-sm text-muted-foreground">
                  Last payment: {recurringPlan.lastRunDate} • Status: {recurringPlan.lastRunStatus === 'success' ? '✓ Success' : '✗ Failed'}
                </p>
              )}

              <Button variant="outline" onClick={handleCancelRecurring}>
                Disable Auto-Pay
              </Button>

              {/* Check for expiring payment method */}
              {(() => {
                const method = paymentMethods.find(m => m.id === recurringPlan.paymentMethodId);
                if (method?.type === 'card' && method.expiryYear && method.expiryMonth) {
                  const now = new Date();
                  const expiryDate = new Date(method.expiryYear, method.expiryMonth - 1);
                  const threeMonthsFromNow = new Date();
                  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
                  if (expiryDate <= threeMonthsFromNow) {
                    return (
                      <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Your payment card expires {method.expiryMonth}/{method.expiryYear}. Please update before next payment.</span>
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch id="autopay" checked={false} onCheckedChange={() => setSetupRecurringOpen(true)} />
                  <Label htmlFor="autopay" className="font-medium">Enable Auto-Pay</Label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Never miss a payment. Set up automatic payments to have your rent charged automatically each month.
              </p>
              <Button onClick={() => setSetupRecurringOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Set Up Auto-Pay
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4️⃣ PAYMENT METHODS */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage your saved cards and bank accounts</CardDescription>
            </div>
            <Button onClick={() => setAddMethodOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethods.map(method => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${method.type === 'card' ? 'bg-primary/10' : 'bg-blue-500/10'}`}>
                    {method.type === 'card' ? (
                      <CreditCard className="h-6 w-6 text-primary" />
                    ) : (
                      <Building2 className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {method.type === 'card' ? method.brand : method.bankName} •••• {method.last4}
                      </p>
                      {method.isDefault && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {method.nickname}
                      {method.type === 'card' && method.expiryMonth && method.expiryYear && (
                        <span className={`ml-2 ${
                          (() => {
                            const now = new Date();
                            const expiry = new Date(method.expiryYear, method.expiryMonth - 1);
                            return expiry <= now ? 'text-destructive' : '';
                          })()
                        }`}>
                          • Expires {method.expiryMonth}/{method.expiryYear}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => handleSetDefault(method.id)}>
                      <Star className="h-4 w-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  {!method.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMethod(method.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5️⃣ PAYMENT HISTORY & RECEIPTS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Payment History & Receipts
          </CardTitle>
          <CardDescription>View all your past payments and download receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tenantPayments.map(pmt => (
              <div key={pmt.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      pmt.status === 'cleared' ? 'bg-green-500/10' : 
                      pmt.status === 'pending' ? 'bg-yellow-500/10' :
                      pmt.status === 'refunded' || pmt.status === 'partial_refund' ? 'bg-amber-500/10' :
                      'bg-red-500/10'
                    }`}>
                      {pmt.status === 'refunded' || pmt.status === 'partial_refund' ? (
                        <Undo2 className="h-5 w-5 text-amber-600" />
                      ) : pmt.method === 'card' ? (
                        <CreditCard className="h-5 w-5" />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{pmt.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {pmt.method === 'card' ? 'Card' : 'Bank'} •••• {pmt.methodLast4} • {new Date(pmt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono font-bold">${pmt.amount.toLocaleString()}</p>
                      {getPaymentStatusBadge(pmt.status, pmt.refundAmount)}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toast({ title: 'Receipt Downloaded', description: `Receipt for payment ${pmt.reference}` })}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 6️⃣ REFUND VISIBILITY */}
                {(pmt.status === 'refunded' || pmt.status === 'partial_refund') && pmt.refundAmount && (
                  <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 mb-1">
                      <Undo2 className="h-4 w-4" />
                      <span className="font-medium">
                        {pmt.status === 'refunded' ? 'Full Refund' : 'Partial Refund'}
                      </span>
                    </div>
                    <div className="grid gap-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Refund Amount</span>
                        <span className="font-mono font-medium text-amber-700">-${pmt.refundAmount.toLocaleString()}</span>
                      </div>
                      {pmt.refundDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Refund Date</span>
                          <span>{new Date(pmt.refundDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                      {pmt.refundReason && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reason</span>
                          <span>{pmt.refundReason}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Payment</span>
                        <span className="font-mono">{pmt.reference}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 7️⃣ SECURITY DEPOSIT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Deposit
          </CardTitle>
          <CardDescription>Your security deposit information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Deposit Amount</p>
              <p className="text-3xl font-bold text-primary">${tenantDeposit.amount.toLocaleString()}</p>
              <Badge variant="secondary" className="mt-2 capitalize">{tenantDeposit.status}</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Held Since</p>
              <p className="text-lg font-medium">{new Date(tenantDeposit.heldSince).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Held in a secure trust account
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Deposit History</h4>
            <div className="space-y-2">
              {tenantDeposit.history.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <span className="font-mono text-green-600">+${item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Your security deposit will be returned within 30 days of move-out, 
              less any deductions for damages or unpaid rent. You'll receive an itemized statement.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 8️⃣ NEXUS SUBSCRIPTION (Platform Fee) */}
      <Card>
        <CardHeader>
          <CardTitle>Nexus Subscription (Platform Fee)</CardTitle>
          <CardDescription>Your Nexus portal subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Tenant Portal Access</p>
              <p className="text-sm text-muted-foreground">Included with your lease</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">Free</p>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Portal access is included as part of your lease agreement. No additional subscription fees apply.
          </p>
        </CardContent>
      </Card>

      {/* Modals */}
      <PayNowModal
        open={payNowOpen}
        onClose={() => setPayNowOpen(false)}
        invoice={selectedInvoice}
        paymentMethods={paymentMethods}
        onPay={payInvoice}
        isProcessing={isProcessing}
      />
      <AddPaymentMethodModal
        open={addMethodOpen}
        onClose={() => setAddMethodOpen(false)}
        onAdd={addPaymentMethod}
      />
      <SetupRecurringModal
        open={setupRecurringOpen}
        onClose={() => setSetupRecurringOpen(false)}
        paymentMethods={paymentMethods}
        onSetup={setupRecurringPayment}
      />
      <InvoiceDetailPanel
        open={invoiceDetailOpen}
        onClose={() => setInvoiceDetailOpen(false)}
        invoice={selectedInvoice}
        onPayNow={() => {
          setInvoiceDetailOpen(false);
          setPayNowOpen(true);
        }}
      />

      {/* Charge Detail Side Panel */}
      <Sheet open={chargeDetailOpen} onOpenChange={setChargeDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Charge Details</SheetTitle>
            <SheetDescription>{selectedCharge?.description}</SheetDescription>
          </SheetHeader>
          
          {selectedCharge && (
            <div className="mt-6 space-y-6">
              {/* Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice ID</span>
                  <span className="font-mono text-sm">{selectedCharge.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Period</span>
                  <span>{selectedCharge.billingPeriod || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span>{new Date(selectedCharge.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(selectedCharge.status)}
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-mono font-bold">${selectedCharge.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance Due</span>
                  <span className={`font-mono font-bold ${selectedCharge.balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    ${selectedCharge.balance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="font-medium mb-3">Line Items</h4>
                <div className="space-y-2">
                  {selectedCharge.lineItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-3 border rounded-lg">
                      <span>{item.description}</span>
                      <span className="font-mono">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment History for this charge */}
              <div>
                <h4 className="font-medium mb-3">Payment History</h4>
                {tenantPayments.filter(p => p.invoiceId === selectedCharge.id).length > 0 ? (
                  <div className="space-y-2">
                    {tenantPayments.filter(p => p.invoiceId === selectedCharge.id).map(pmt => (
                      <div key={pmt.id} className="flex justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">${pmt.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{pmt.date}</p>
                        </div>
                        {getPaymentStatusBadge(pmt.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No payments applied yet</p>
                )}
              </div>

              {selectedCharge.balance > 0 && (
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setChargeDetailOpen(false);
                    handlePayNow(selectedCharge);
                  }}
                >
                  Pay ${selectedCharge.balance.toLocaleString()}
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};