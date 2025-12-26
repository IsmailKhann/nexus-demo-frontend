import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, FileText, CreditCard, Clock, CheckCircle, AlertCircle, 
  Download, ArrowRight, Plus, Trash2, Star, Building2, Calendar,
  RefreshCw, Pause, Play, Shield
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

  const outstandingBalance = getOutstandingBalance();
  const lastPayment = getLastPayment();
  const recurringPlan = getTenantRecurringPlan();
  const openInvoices = tenantInvoices.filter(i => i.balance > 0);
  const paidInvoices = tenantInvoices.filter(i => i.status === 'paid');

  const handlePayNow = (invoice: TenantInvoice) => {
    setSelectedInvoice(invoice);
    setPayNowOpen(true);
  };

  const handleViewInvoice = (invoice: TenantInvoice) => {
    setSelectedInvoice(invoice);
    setInvoiceDetailOpen(true);
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
      toast({ title: 'Recurring Payment Cancelled' });
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      open: { variant: 'secondary', icon: Clock },
      overdue: { variant: 'destructive', icon: AlertCircle },
      paid: { variant: 'default', icon: CheckCircle },
      partial: { variant: 'outline', icon: Clock },
    };
    const c = config[status] || { variant: 'outline', icon: Clock };
    const Icon = c.icon;
    return <Badge variant={c.variant} className="gap-1"><Icon className="h-3 w-3" />{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      cleared: { variant: 'default' },
      pending: { variant: 'secondary' },
      processing: { variant: 'outline' },
      failed: { variant: 'destructive' },
      refunded: { variant: 'outline' },
    };
    return <Badge variant={config[status]?.variant || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={outstandingBalance > 0 ? 'border-destructive/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${outstandingBalance > 0 ? 'text-destructive' : 'text-green-600'}`}>
              ${outstandingBalance.toLocaleString()}
            </div>
            {outstandingBalance > 0 && (
              <Button size="sm" className="mt-2 w-full" onClick={() => openInvoices[0] && handlePayNow(openInvoices[0])}>
                Pay Now <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Rent</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,500</div>
            <p className="text-xs text-muted-foreground">Due January 5, 2026</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${lastPayment?.amount.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">{lastPayment?.date || 'No payments yet'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Pay</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recurringPlan ? 'Active' : 'Off'}</div>
            {recurringPlan ? (
              <p className="text-xs text-muted-foreground">Next: {recurringPlan.nextRunDate}</p>
            ) : (
              <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => setSetupRecurringOpen(true)}>
                Set Up Auto-Pay
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Payments</TabsTrigger>
          <TabsTrigger value="deposit">Security Deposit</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>View and pay your invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Open Invoices */}
              {openInvoices.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Open / Overdue</h4>
                  {openInvoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{inv.description}</p>
                          <p className="text-sm text-muted-foreground">Due: {inv.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-mono font-bold">${inv.balance.toLocaleString()}</p>
                          {getInvoiceStatusBadge(inv.status)}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(inv)}>
                            View
                          </Button>
                          <Button size="sm" onClick={() => handlePayNow(inv)}>
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paid Invoices */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Paid</h4>
                {paidInvoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{inv.description}</p>
                        <p className="text-sm text-muted-foreground">Paid: {inv.paidAt?.split('T')[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-mono">${inv.amount.toLocaleString()}</p>
                      <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(inv)}>
                        <Download className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All your past payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tenantPayments.map(pmt => (
                  <div key={pmt.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        pmt.status === 'cleared' ? 'bg-green-500/10' : 
                        pmt.status === 'pending' ? 'bg-yellow-500/10' : 'bg-red-500/10'
                      }`}>
                        {pmt.method === 'card' ? <CreditCard className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{pmt.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {pmt.method === 'card' ? 'Card' : 'Bank'} •••• {pmt.methodLast4} • {pmt.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-mono font-bold">${pmt.amount.toLocaleString()}</p>
                        {getPaymentStatusBadge(pmt.status)}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="methods">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your saved payment methods</CardDescription>
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
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        {method.type === 'card' ? (
                          <CreditCard className="h-6 w-6" />
                        ) : (
                          <Building2 className="h-6 w-6" />
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
                          {method.type === 'card' && ` • Expires ${method.expiryMonth}/${method.expiryYear}`}
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
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveMethod(method.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recurring Payments Tab */}
        <TabsContent value="recurring">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recurring Payments</CardTitle>
                  <CardDescription>Manage automatic rent payments</CardDescription>
                </div>
                {!recurringPlan && (
                  <Button onClick={() => setSetupRecurringOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Set Up Auto-Pay
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {recurringPlan ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-green-500/5 border-green-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Auto-Pay is Active</span>
                      </div>
                      <Badge variant="default">
                        {recurringPlan.status === 'active' ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-lg font-bold">${recurringPlan.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Frequency</p>
                        <p className="text-lg font-bold capitalize">{recurringPlan.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Payment</p>
                        <p className="text-lg font-bold">{recurringPlan.nextRunDate}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancelRecurring}>
                      Cancel Auto-Pay
                    </Button>
                  </div>

                  {/* Upcoming scheduled payments */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Upcoming Scheduled Payments</h4>
                    <div className="space-y-2">
                      {[0, 1, 2].map(i => {
                        const date = new Date(recurringPlan.nextRunDate);
                        date.setMonth(date.getMonth() + i);
                        return (
                          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <span className="font-mono">${recurringPlan.amount.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Auto-Pay Set Up</h3>
                  <p className="text-muted-foreground mb-4">
                    Set up automatic payments to never miss a rent deadline
                  </p>
                  <Button onClick={() => setSetupRecurringOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Set Up Auto-Pay
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Deposit Tab */}
        <TabsContent value="deposit">
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
                  <Badge variant="secondary" className="mt-2">{tenantDeposit.status}</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Held Since</p>
                  <p className="text-lg font-medium">{tenantDeposit.heldSince}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your deposit is held in a secure trust account
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
                        <p className="text-sm text-muted-foreground">{item.date}</p>
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
        </TabsContent>
      </Tabs>

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
    </div>
  );
};
