import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, FileText, TrendingUp, Clock, CheckCircle, AlertCircle, Download, Upload, Settings, Search, Filter, RefreshCw, CreditCard, Building2, ArrowUpRight, ArrowDownRight, Plus, Eye, Edit, Send, Shield, Wallet, Users, FileSpreadsheet, AlertTriangle, ChevronRight
} from 'lucide-react';
import { useAccountingStore } from '@/hooks/useAccountingStore';
import { calculateARAgingSummary } from '@/data/accountingData';
import { LedgerDrilldownPanel } from '@/components/accounting/LedgerDrilldownPanel';
import { AccountModal } from '@/components/accounting/AccountModal';
import { ApplyPaymentModal } from '@/components/accounting/ApplyPaymentModal';
import { PayBillModal } from '@/components/accounting/PayBillModal';
import { ReleaseDepositModal } from '@/components/accounting/ReleaseDepositModal';
import { OwnerStatementModal } from '@/components/accounting/OwnerStatementModal';
import { RecordPaymentModal } from '@/components/accounting/RecordPaymentModal';
import { AuditLogModal } from '@/components/accounting/AuditLogModal';
import { ReportsTab } from '@/components/accounting/ReportsTab';
import { KPIDrilldownPanel } from '@/components/accounting/KPIDrilldownPanel';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const Accounting = () => {
  const store = useAccountingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [kpiPeriod, setKpiPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  
  // Panel states
  const [ledgerPanelOpen, setLedgerPanelOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<typeof store.accounts[0] | null>(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<typeof store.accounts[0] | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof store.invoices[0] | null>(null);
  const [payBillModalOpen, setPayBillModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<typeof store.bills[0] | null>(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<typeof store.securityDeposits[0] | null>(null);
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<typeof store.ownerStatements[0] | null>(null);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [kpiDrilldownOpen, setKpiDrilldownOpen] = useState(false);
  const [kpiDrilldownType, setKpiDrilldownType] = useState<'revenue' | 'ar' | 'expenses' | 'netIncome' | 'trust' | null>(null);
  const [arAgingFilter, setArAgingFilter] = useState<string>('');

  const arAging = calculateARAgingSummary(store.invoices);
  
  const openKpiDrilldown = (type: typeof kpiDrilldownType, agingBucket?: string) => {
    setKpiDrilldownType(type);
    setArAgingFilter(agingBucket || '');
    setKpiDrilldownOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      active: { variant: 'default', icon: CheckCircle },
      Open: { variant: 'secondary', icon: Clock },
      Overdue: { variant: 'destructive', icon: AlertCircle },
      Paid: { variant: 'default', icon: CheckCircle },
      'Partially Paid': { variant: 'outline', icon: Clock },
      Pending: { variant: 'secondary', icon: Clock },
      Approved: { variant: 'default', icon: CheckCircle },
      Cleared: { variant: 'default', icon: CheckCircle },
      Held: { variant: 'secondary', icon: Shield },
      Released: { variant: 'outline', icon: CheckCircle },
      Draft: { variant: 'outline', icon: FileText },
      Generated: { variant: 'secondary', icon: FileText },
      Sent: { variant: 'default', icon: Send },
    };
    const config = variants[status] || { variant: 'outline' as const, icon: Clock };
    const Icon = config.icon;
    return <Badge variant={config.variant} className="gap-1"><Icon className="h-3 w-3" />{status}</Badge>;
  };

  const filteredAccounts = store.accounts.filter(a => {
    if (searchTerm && !a.name.toLowerCase().includes(searchTerm.toLowerCase()) && !a.id.includes(searchTerm)) return false;
    if (filterStatus !== 'all' && a.type.toLowerCase() !== filterStatus) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting & Financials</h1>
          <p className="text-muted-foreground">Manage GL, AR, AP, payments, and QuickBooks integration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAuditLogOpen(true)}><Shield className="h-4 w-4 mr-1" />Audit Log</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
          <Button size="sm"><Upload className="h-4 w-4 mr-1" />Import</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => openKpiDrilldown('revenue')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$250,500</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUpRight className="h-3 w-3 text-green-500" /><span className="text-green-500">+12.5%</span> from last month</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => openKpiDrilldown('ar')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts Receivable</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(arAging.current + arAging['1-30'] + arAging['31-60'] + arAging['61+']).toLocaleString()}</div>
            <div className="flex gap-1 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); openKpiDrilldown('ar', 'Current'); }}>0: ${(arAging.current / 1000).toFixed(0)}k</Badge>
              <Badge variant="outline" className="text-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); openKpiDrilldown('ar', '1-30'); }}>1-30: ${(arAging['1-30'] / 1000).toFixed(0)}k</Badge>
              <Badge variant="destructive" className="text-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); openKpiDrilldown('ar', '61+'); }}>{arAging.overdueCount} overdue</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => openKpiDrilldown('expenses')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$47,500</div>
            <p className="text-xs text-muted-foreground">Operating: $92K • CapEx: $45K</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => openKpiDrilldown('netIncome')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$203,000</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUpRight className="h-3 w-3 text-green-500" />NOI: 81.0%</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => openKpiDrilldown('trust')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trust Account</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$185,000</div>
            <p className="text-xs text-muted-foreground">Deposits held in trust</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="gl" className="space-y-4">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="gl">General Ledger</TabsTrigger>
              <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
              <TabsTrigger value="ap">Accounts Payable</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="deposits">Security Deposits</TabsTrigger>
              <TabsTrigger value="statements">Owner Statements</TabsTrigger>
              <TabsTrigger value="quickbooks">QuickBooks</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* General Ledger */}
            <TabsContent value="gl">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div><CardTitle>Chart of Accounts</CardTitle><CardDescription>Manage your general ledger accounts</CardDescription></div>
                    <Button onClick={() => { setEditingAccount(null); setAccountModalOpen(true); }}><Plus className="h-4 w-4 mr-1" />New Account</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search accounts..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="asset">Asset</SelectItem><SelectItem value="liability">Liability</SelectItem><SelectItem value="equity">Equity</SelectItem><SelectItem value="revenue">Revenue</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent></Select>
                  </div>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader><TableRow><TableHead>Account #</TableHead><TableHead>Account Name</TableHead><TableHead>Type</TableHead><TableHead>Parent</TableHead><TableHead>Normal</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {filteredAccounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-mono">{account.id}</TableCell>
                            <TableCell className="font-medium">{account.name}</TableCell>
                            <TableCell><Badge variant="outline">{account.type}</Badge></TableCell>
                            <TableCell className="text-muted-foreground">{account.parent || '-'}</TableCell>
                            <TableCell>{account.normal_balance}</TableCell>
                            <TableCell className="text-right font-mono">${Math.abs(account.balance).toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(account.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(account); setLedgerPanelOpen(true); }}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => { setEditingAccount(account); setAccountModalOpen(true); }} disabled={account.system}><Edit className="h-4 w-4" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AR Tab */}
            <TabsContent value="ar">
              <Card>
                <CardHeader><div className="flex items-center justify-between"><div><CardTitle>Invoices</CardTitle><CardDescription>Track and manage tenant invoices</CardDescription></div><Button><Plus className="h-4 w-4 mr-1" />Create Invoice</Button></div></CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Tenant</TableHead><TableHead>Property</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {store.invoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-mono">{inv.id}</TableCell>
                            <TableCell>{inv.tenant}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{inv.property}</TableCell>
                            <TableCell className="text-right font-mono">${inv.total.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">${inv.balance.toLocaleString()}</TableCell>
                            <TableCell>{inv.due_date}</TableCell>
                            <TableCell>{getStatusBadge(inv.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                              {inv.balance > 0 && <Button variant="ghost" size="sm" onClick={() => { setSelectedInvoice(inv); setPaymentModalOpen(true); }}><DollarSign className="h-4 w-4" /></Button>}
                              {inv.status === 'Overdue' && <Button variant="ghost" size="sm" onClick={() => toast({ title: 'Reminder Sent', description: `Email sent to ${inv.tenant}` })}><Send className="h-4 w-4" /></Button>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AP Tab */}
            <TabsContent value="ap">
              <Card>
                <CardHeader><div className="flex items-center justify-between"><div><CardTitle>Vendor Bills</CardTitle><CardDescription>Manage accounts payable</CardDescription></div><Button><Plus className="h-4 w-4 mr-1" />Create Bill</Button></div></CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader><TableRow><TableHead>Bill #</TableHead><TableHead>Vendor</TableHead><TableHead>Property</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Due Date</TableHead><TableHead>1099</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {store.bills.map((bill) => (
                          <TableRow key={bill.id}>
                            <TableCell className="font-mono">{bill.id}</TableCell>
                            <TableCell className="font-medium">{bill.vendor}</TableCell>
                            <TableCell className="text-muted-foreground">{bill.property}</TableCell>
                            <TableCell>{bill.category}</TableCell>
                            <TableCell className="text-right font-mono">${bill.total.toLocaleString()}</TableCell>
                            <TableCell>{bill.due_date}</TableCell>
                            <TableCell>{bill.is_1099 ? <Badge variant="outline">1099</Badge> : '-'}</TableCell>
                            <TableCell>{getStatusBadge(bill.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                              {bill.status === 'Pending' && <Button variant="ghost" size="sm" onClick={() => { store.approveBill(bill.id); toast({ title: 'Bill Approved' }); }}><CheckCircle className="h-4 w-4" /></Button>}
                              {bill.status === 'Approved' && <Button variant="ghost" size="sm" onClick={() => { setSelectedBill(bill); setPayBillModalOpen(true); }}><DollarSign className="h-4 w-4" /></Button>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card>
                <CardHeader><div className="flex items-center justify-between"><div><CardTitle>Payment History</CardTitle><CardDescription>All payment transactions</CardDescription></div><Button onClick={() => setRecordPaymentOpen(true)}><CreditCard className="h-4 w-4 mr-1" />Record Payment</Button></div></CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader><TableRow><TableHead>Payment #</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Payer/Payee</TableHead><TableHead>Property</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {store.payments.map((pmt) => (
                          <TableRow key={pmt.id}>
                            <TableCell className="font-mono">{pmt.id}</TableCell>
                            <TableCell>{pmt.date}</TableCell>
                            <TableCell><Badge variant="outline">{pmt.type}</Badge></TableCell>
                            <TableCell>{pmt.payer_payee}</TableCell>
                            <TableCell className="text-muted-foreground">{pmt.property}</TableCell>
                            <TableCell className="text-right font-mono">${pmt.amount.toLocaleString()}</TableCell>
                            <TableCell><Badge variant="secondary">{pmt.method}</Badge></TableCell>
                            <TableCell>{getStatusBadge(pmt.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Deposits Tab */}
            <TabsContent value="deposits">
              <Card>
                <CardHeader><CardTitle>Security Deposits</CardTitle><CardDescription>Trust account deposit ledger</CardDescription></CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader><TableRow><TableHead>Deposit ID</TableHead><TableHead>Tenant</TableHead><TableHead>Property / Unit</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Move-In</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {store.securityDeposits.map((dep) => (
                          <TableRow key={dep.id}>
                            <TableCell className="font-mono">{dep.id}</TableCell>
                            <TableCell className="font-medium">{dep.tenant}</TableCell>
                            <TableCell>{dep.property} - {dep.unit}</TableCell>
                            <TableCell className="text-right font-mono">${dep.amount.toLocaleString()}</TableCell>
                            <TableCell>{dep.move_in_date}</TableCell>
                            <TableCell>{getStatusBadge(dep.status)}</TableCell>
                            <TableCell className="text-right">
                              {dep.status === 'Held' && <Button variant="outline" size="sm" onClick={() => { setSelectedDeposit(dep); setDepositModalOpen(true); }}>Release</Button>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Owner Statements Tab */}
            <TabsContent value="statements">
              <Card>
                <CardHeader><div className="flex items-center justify-between"><div><CardTitle>Owner Statements</CardTitle><CardDescription>Generate and send owner distributions</CardDescription></div><Button><Plus className="h-4 w-4 mr-1" />New Statement</Button></div></CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader><TableRow><TableHead>Statement ID</TableHead><TableHead>Owner</TableHead><TableHead>Property</TableHead><TableHead>Period</TableHead><TableHead className="text-right">Net to Owner</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {store.ownerStatements.map((stmt) => (
                          <TableRow key={stmt.id}>
                            <TableCell className="font-mono">{stmt.id}</TableCell>
                            <TableCell className="font-medium">{stmt.owner}</TableCell>
                            <TableCell>{stmt.property}</TableCell>
                            <TableCell>{stmt.period_start} - {stmt.period_end}</TableCell>
                            <TableCell className="text-right font-mono text-green-600">${stmt.net_to_owner.toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(stmt.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedStatement(stmt); setStatementModalOpen(true); }}><Eye className="h-4 w-4 mr-1" />View</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* QuickBooks Tab */}
            <TabsContent value="quickbooks">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />QuickBooks Integration</CardTitle><CardDescription>Sync your financial data with QuickBooks Online</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-primary" /></div>
                      <div><p className="font-medium">QuickBooks Online</p><p className="text-sm text-muted-foreground">{store.quickBooksState.isConnected ? store.quickBooksState.companyName : 'Not connected'}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={store.quickBooksState.isConnected ? 'default' : 'secondary'}>{store.quickBooksState.isConnected ? 'Connected' : 'Disconnected'}</Badge>
                      {store.quickBooksState.isConnected ? (
                        <Button variant="outline" size="sm" onClick={() => { store.disconnectQuickBooks(); }}>Disconnect</Button>
                      ) : (
                        <Button size="sm" onClick={() => { store.connectQuickBooks(); }}>Connect</Button>
                      )}
                    </div>
                  </div>
                  {store.quickBooksState.isConnected && (
                    <>
                      <div className="flex items-center justify-between"><h3 className="font-semibold">Sync Status</h3><Button variant="outline" size="sm" onClick={() => { store.syncQuickBooks(); }}><RefreshCw className="h-4 w-4 mr-1" />Sync Now</Button></div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Last Sync</p><p className="text-lg font-medium">{format(new Date(store.quickBooksState.lastSyncTime), 'MMM d, h:mm a')}</p></CardContent></Card>
                        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total Synced</p><p className="text-lg font-medium">{store.quickBooksState.recordsSynced.toLocaleString()} records</p></CardContent></Card>
                        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Direction</p><p className="text-lg font-medium">{store.quickBooksState.syncDirection === 'two-way' ? 'Two-way Sync' : 'Nexus → QB'}</p></CardContent></Card>
                      </div>
                      <div><h3 className="font-semibold mb-3">Recent Sync Log</h3>
                        <div className="space-y-2">
                          {store.quickBooksState.syncLogs.slice(0, 4).map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant={log.status === 'success' ? 'default' : log.status === 'warning' ? 'secondary' : 'destructive'}>{log.status}</Badge>
                                <span>{log.message}</span>
                              </div>
                              <span className="text-muted-foreground">{log.records} records</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports"><ReportsTab onRunReport={store.runReport} /></TabsContent>
          </Tabs>
        </div>

        {/* Recent Activity Sidebar */}
        <div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {store.recentActivity.map((act) => (
                    <div key={act.id} className="flex gap-2 text-sm border-b pb-2">
                      <div className="flex-1"><p>{act.message}</p><p className="text-xs text-muted-foreground">{act.user} • {act.timestamp}</p></div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-sm">Current Role</CardTitle></CardHeader>
            <CardContent><Badge variant="default">{store.userRole}</Badge><p className="text-xs text-muted-foreground mt-2">Full access to all accounting features</p></CardContent>
          </Card>
        </div>
      </div>

      {/* Modals & Panels */}
      <LedgerDrilldownPanel open={ledgerPanelOpen} onClose={() => setLedgerPanelOpen(false)} account={selectedAccount} transactions={store.transactions} onPostJournalEntry={store.postJournalEntry} accounts={store.accounts} />
      <AccountModal open={accountModalOpen} onClose={() => setAccountModalOpen(false)} account={editingAccount} accounts={store.accounts} onSave={store.addAccount} onUpdate={store.updateAccount} />
      <ApplyPaymentModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} invoice={selectedInvoice} onApply={store.applyPayment} />
      <PayBillModal open={payBillModalOpen} onClose={() => setPayBillModalOpen(false)} bill={selectedBill} onPay={store.payBill} />
      <ReleaseDepositModal open={depositModalOpen} onClose={() => setDepositModalOpen(false)} deposit={selectedDeposit} onRelease={store.releaseDeposit} />
      <OwnerStatementModal open={statementModalOpen} onClose={() => setStatementModalOpen(false)} statement={selectedStatement} onGenerate={store.generateStatement} onSend={store.sendStatement} />
      <RecordPaymentModal open={recordPaymentOpen} onClose={() => setRecordPaymentOpen(false)} onRecord={store.recordManualPayment} />
      <AuditLogModal open={auditLogOpen} onClose={() => setAuditLogOpen(false)} auditLogs={store.auditLogs} />
      <KPIDrilldownPanel open={kpiDrilldownOpen} onClose={() => setKpiDrilldownOpen(false)} type={kpiDrilldownType} invoices={store.invoices} bills={store.bills} payments={store.payments} agingFilter={arAgingFilter} />
    </div>
  );
};

export default Accounting;
