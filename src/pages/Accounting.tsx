import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Upload,
  Settings,
  Search,
  Filter,
  RefreshCw,
  CreditCard,
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Accounting = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for GL accounts
  const glAccounts = [
    { id: '1000', name: 'Cash', type: 'Asset', balance: 125000, status: 'active' },
    { id: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 45000, status: 'active' },
    { id: '1500', name: 'Security Deposits Held', type: 'Asset', balance: 85000, status: 'active' },
    { id: '2000', name: 'Accounts Payable', type: 'Liability', balance: -32000, status: 'active' },
    { id: '2100', name: 'Tenant Deposits', type: 'Liability', balance: -85000, status: 'active' },
    { id: '4000', name: 'Rental Income', type: 'Revenue', balance: 250000, status: 'active' },
    { id: '5000', name: 'Property Maintenance', type: 'Expense', balance: 35000, status: 'active' },
    { id: '5100', name: 'Utilities', type: 'Expense', balance: 12000, status: 'active' },
  ];

  // Mock data for AR invoices
  const arInvoices = [
    { 
      id: 'INV-001', 
      tenant: 'John Doe', 
      property: '123 Main St #101', 
      amount: 2500, 
      dueDate: '2025-02-01', 
      status: 'pending',
      daysOverdue: 0
    },
    { 
      id: 'INV-002', 
      tenant: 'Jane Smith', 
      property: '456 Oak Ave #202', 
      amount: 3200, 
      dueDate: '2025-01-15', 
      status: 'overdue',
      daysOverdue: 23
    },
    { 
      id: 'INV-003', 
      tenant: 'Bob Johnson', 
      property: '789 Pine Rd #303', 
      amount: 2800, 
      dueDate: '2025-02-05', 
      status: 'pending',
      daysOverdue: 0
    },
    { 
      id: 'INV-004', 
      tenant: 'Sarah Williams', 
      property: '321 Elm St #404', 
      amount: 2500, 
      dueDate: '2025-01-20', 
      status: 'paid',
      daysOverdue: 0
    },
  ];

  // Mock data for payments
  const payments = [
    { 
      id: 'PAY-001', 
      date: '2025-01-20', 
      tenant: 'Sarah Williams', 
      amount: 2500, 
      method: 'ACH',
      status: 'completed',
      reference: 'INV-004'
    },
    { 
      id: 'PAY-002', 
      date: '2025-01-18', 
      tenant: 'Mike Davis', 
      amount: 3000, 
      method: 'Credit Card',
      status: 'completed',
      reference: 'INV-005'
    },
    { 
      id: 'PAY-003', 
      date: '2025-01-15', 
      tenant: 'Lisa Anderson', 
      amount: 2700, 
      method: 'Check',
      status: 'processing',
      reference: 'INV-006'
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      active: { variant: 'default', icon: CheckCircle },
      pending: { variant: 'secondary', icon: Clock },
      overdue: { variant: 'destructive', icon: AlertCircle },
      paid: { variant: 'default', icon: CheckCircle },
      completed: { variant: 'default', icon: CheckCircle },
      processing: { variant: 'secondary', icon: Clock },
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting & Financials</h1>
          <p className="text-muted-foreground">
            Manage GL, AR, payments, and QuickBooks integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$250,000</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts Receivable</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,000</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-red-500" />
              <span className="text-red-500">3 overdue</span> invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$47,000</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-red-500" />
              <span className="text-red-500">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$203,000</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+15.3%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="gl" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gl">General Ledger</TabsTrigger>
          <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="quickbooks">QuickBooks</TabsTrigger>
        </TabsList>

        {/* General Ledger Tab */}
        <TabsContent value="gl" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Chart of Accounts</CardTitle>
                  <CardDescription>Manage your general ledger accounts</CardDescription>
                </div>
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  New Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search accounts..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account #</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {glAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.id}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell className="text-right font-mono">
                          ${Math.abs(account.balance).toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(account.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Receivable Tab */}
        <TabsContent value="ar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>Track and manage tenant invoices</CardDescription>
                </div>
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Create Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.tenant}</TableCell>
                        <TableCell>{invoice.property}</TableCell>
                        <TableCell className="text-right font-mono">
                          ${invoice.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {invoice.dueDate}
                            {invoice.daysOverdue > 0 && (
                              <span className="text-xs text-destructive">
                                ({invoice.daysOverdue}d overdue)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Send</Button>
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
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>View and manage payment transactions</CardDescription>
                </div>
                <Button className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Record Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{payment.tenant}</TableCell>
                        <TableCell className="text-right font-mono">
                          ${payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.method}</Badge>
                        </TableCell>
                        <TableCell>{payment.reference}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QuickBooks Integration Tab */}
        <TabsContent value="quickbooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                QuickBooks Integration
              </CardTitle>
              <CardDescription>
                Sync your financial data with QuickBooks Online
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">QuickBooks Online</p>
                    <p className="text-sm text-muted-foreground">Connected to Nexus Property Management</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Configure
                  </Button>
                </div>
              </div>

              {/* Sync Status */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Sync Status</h3>
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Sync Now
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">2 hours ago</p>
                      <p className="text-xs text-muted-foreground">Jan 20, 2025 at 10:30 AM</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Records Synced</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">1,247</p>
                      <p className="text-xs text-muted-foreground">Invoices, payments, and expenses</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sync Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold">Sync Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-sync">Automatic Sync</Label>
                      <p className="text-sm text-muted-foreground">
                        Sync data automatically every hour
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="sync-invoices">Sync Invoices</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically create invoices in QuickBooks
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="sync-payments">Sync Payments</Label>
                      <p className="text-sm text-muted-foreground">
                        Record payments in QuickBooks automatically
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="sync-expenses">Sync Expenses</Label>
                      <p className="text-sm text-muted-foreground">
                        Track property expenses in QuickBooks
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                </div>
              </div>

              {/* Account Mapping */}
              <div className="space-y-4">
                <h3 className="font-semibold">Account Mapping</h3>
                <p className="text-sm text-muted-foreground">
                  Map Nexus accounts to QuickBooks accounts
                </p>
                <Button variant="outline" className="w-full gap-2">
                  <Settings className="h-4 w-4" />
                  Configure Account Mapping
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Accounting;
