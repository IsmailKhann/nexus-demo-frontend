import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Building2, Users, Globe, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, 
  Search, Eye, Clock, CheckCircle, AlertCircle, Undo2
} from 'lucide-react';
import { Invoice, Payment, Transaction } from '@/data/accountingData';
import properties from '@/data/properties.json';

export type AccountingViewType = 'overall' | 'by-property' | 'by-tenant';

interface AccountingViewSelectorProps {
  currentView: AccountingViewType;
  onViewChange: (view: AccountingViewType) => void;
  invoices: Invoice[];
  payments: Payment[];
  transactions: Transaction[];
  onPaymentClick: (payment: Payment) => void;
  onInvoiceClick?: (invoice: Invoice) => void;
}

// Mock tenants derived from invoices
const getTenants = (invoices: Invoice[]) => {
  const tenantMap = new Map<string, { id: string; name: string; property: string }>();
  invoices.forEach(inv => {
    if (!tenantMap.has(inv.tenant_id)) {
      tenantMap.set(inv.tenant_id, { id: inv.tenant_id, name: inv.tenant, property: inv.property });
    }
  });
  return Array.from(tenantMap.values());
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, className?: string }> = {
    Open: { variant: 'secondary', icon: Clock },
    Overdue: { variant: 'destructive', icon: AlertCircle },
    Paid: { variant: 'default', icon: CheckCircle },
    'Partially Paid': { variant: 'outline', icon: Clock },
    Pending: { variant: 'secondary', icon: Clock },
    Cleared: { variant: 'default', icon: CheckCircle },
    Refunded: { variant: 'outline', icon: Undo2, className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  };
  const config = variants[status] || { variant: 'outline' as const, icon: Clock };
  const Icon = config.icon;
  return <Badge variant={config.variant} className={`gap-1 ${config.className || ''}`}><Icon className="h-3 w-3" />{status}</Badge>;
};

export function AccountingViewSelector({
  currentView,
  onViewChange,
  invoices,
  payments,
  transactions,
  onPaymentClick,
  onInvoiceClick,
}: AccountingViewSelectorProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [tenantSearch, setTenantSearch] = useState('');

  const tenants = getTenants(invoices);

  // Filter data based on selection
  const getPropertyFilteredData = () => {
    if (selectedProperty === 'all') {
      return { invoices, payments, transactions };
    }
    const propName = properties.find(p => p.id === selectedProperty)?.name || '';
    return {
      invoices: invoices.filter(i => i.property.includes(propName) || i.property_id === selectedProperty),
      payments: payments.filter(p => p.property.includes(propName)),
      transactions: transactions.filter(t => t.property.includes(propName) || t.property === 'All Properties'),
    };
  };

  const getTenantFilteredData = () => {
    if (!selectedTenant) return { invoices: [], payments: [] };
    const tenant = tenants.find(t => t.id === selectedTenant);
    if (!tenant) return { invoices: [], payments: [] };
    return {
      invoices: invoices.filter(i => i.tenant_id === selectedTenant),
      payments: payments.filter(p => p.payer_payee.includes(tenant.name)),
    };
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(tenantSearch.toLowerCase())
  );

  // Property summary calculations
  const propData = getPropertyFilteredData();
  const propRentCollected = propData.payments
    .filter(p => p.type === 'Tenant' && p.status === 'Cleared')
    .reduce((sum, p) => sum + p.amount, 0);
  const propOutstanding = propData.invoices
    .filter(i => i.status !== 'Paid')
    .reduce((sum, i) => sum + i.balance, 0);
  const propExpenses = propData.payments
    .filter(p => p.type === 'Vendor')
    .reduce((sum, p) => sum + Math.abs(p.amount), 0);

  // Tenant summary calculations
  const tenantData = getTenantFilteredData();
  const tenantBalance = tenantData.invoices.reduce((sum, i) => sum + i.balance, 0);
  const tenantOverdue = tenantData.invoices
    .filter(i => i.status === 'Overdue')
    .reduce((sum, i) => sum + i.balance, 0);
  const lastPayment = tenantData.payments
    .filter(p => p.type === 'Tenant' && p.status === 'Cleared')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  if (currentView === 'overall') {
    return null; // Overall view uses the existing content
  }

  if (currentView === 'by-property') {
    return (
      <div className="space-y-6">
        {/* Property Selector */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property Accounting
                </CardTitle>
                <CardDescription>View transactions by property</CardDescription>
              </div>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map(prop => (
                    <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Property Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rent Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${propRentCollected.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />This period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">${propOutstanding.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{propData.invoices.filter(i => i.status !== 'Paid').length} unpaid invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${propExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Vendor payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${(propRentCollected - propExpenses).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Property-only</p>
            </CardContent>
          </Card>
        </div>

        {/* Property Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Property Transactions</CardTitle>
            <CardDescription>All transactions for {selectedProperty === 'all' ? 'all properties' : properties.find(p => p.id === selectedProperty)?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tenant/Vendor</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propData.payments.slice(0, 10).map(pmt => (
                    <TableRow key={pmt.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onPaymentClick(pmt)}>
                      <TableCell>{pmt.date}</TableCell>
                      <TableCell><Badge variant="outline">{pmt.type}</Badge></TableCell>
                      <TableCell>{pmt.payer_payee}</TableCell>
                      <TableCell className={`text-right font-mono ${pmt.amount < 0 ? 'text-amber-600' : ''}`}>
                        {pmt.amount < 0 ? '-' : ''}${Math.abs(pmt.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(pmt.status)}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{pmt.reference}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {propData.payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No transactions found for this property
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === 'by-tenant') {
    return (
      <div className="space-y-6">
        {/* Tenant Selector */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tenant Accounting
                </CardTitle>
                <CardDescription>View financial history by tenant</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search tenants..." 
                    className="pl-8"
                    value={tenantSearch}
                    onChange={(e) => setTenantSearch(e.target.value)}
                  />
                </div>
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTenants.map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {selectedTenant ? (
          <>
            {/* Tenant Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${tenantBalance > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    ${tenantBalance.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tenantBalance > 0 ? 'Amount due' : 'No balance'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {lastPayment ? `$${lastPayment.amount.toLocaleString()}` : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lastPayment ? lastPayment.date : 'No payments recorded'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${tenantOverdue > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    ${tenantOverdue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tenantOverdue > 0 ? 'Past due date' : 'All current'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tenant Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Tenant Transactions</CardTitle>
                <CardDescription>All financial activity for {tenants.find(t => t.id === selectedTenant)?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenantData.invoices.map(inv => (
                        <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onInvoiceClick?.(inv)}>
                          <TableCell>{inv.created_at}</TableCell>
                          <TableCell>
                            <span className="font-medium">{inv.id}</span>
                            <span className="text-muted-foreground ml-2">
                              {inv.line_items.map(li => li.description).join(', ')}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{inv.property}</TableCell>
                          <TableCell className="text-right font-mono">${inv.total.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono">${inv.balance.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(inv.status)}</TableCell>
                        </TableRow>
                      ))}
                      {tenantData.payments.map(pmt => (
                        <TableRow key={pmt.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onPaymentClick(pmt)}>
                          <TableCell>{pmt.date}</TableCell>
                          <TableCell>
                            <span className="font-medium">Payment</span>
                            <span className="text-muted-foreground ml-2">{pmt.method}</span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{pmt.property}</TableCell>
                          <TableCell className="text-right font-mono text-green-600">-${pmt.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono">-</TableCell>
                          <TableCell>{getStatusBadge(pmt.status)}</TableCell>
                        </TableRow>
                      ))}
                      {tenantData.invoices.length === 0 && tenantData.payments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No transactions found for this tenant
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a tenant to view their financial history</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
}
