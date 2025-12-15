import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Invoice, Bill, Payment } from '@/data/accountingData';
import { Download, DollarSign, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface KPIDrilldownPanelProps {
  open: boolean;
  onClose: () => void;
  type: 'revenue' | 'ar' | 'expenses' | 'netIncome' | 'trust' | null;
  invoices: Invoice[];
  bills: Bill[];
  payments: Payment[];
  agingFilter?: string;
}

export function KPIDrilldownPanel({
  open,
  onClose,
  type,
  invoices,
  bills,
  payments,
  agingFilter,
}: KPIDrilldownPanelProps) {
  if (!type) return null;

  const getTitle = () => {
    switch (type) {
      case 'revenue': return 'Revenue Breakdown';
      case 'ar': return agingFilter ? `AR Aging: ${agingFilter}` : 'Accounts Receivable';
      case 'expenses': return 'Expense Breakdown';
      case 'netIncome': return 'Net Income Details';
      case 'trust': return 'Trust Account Details';
      default: return 'Details';
    }
  };

  const handleExport = () => {
    toast({ title: 'Exporting...', description: 'Downloading data as CSV' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      Paid: { variant: 'default', icon: CheckCircle },
      Open: { variant: 'secondary', icon: Clock },
      Overdue: { variant: 'destructive', icon: AlertCircle },
      'Partially Paid': { variant: 'outline', icon: Clock },
    };
    const config = variants[status] || variants.Open;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  // Filter invoices based on aging
  const getFilteredInvoices = () => {
    if (type !== 'ar') return invoices;
    
    const openInvoices = invoices.filter(i => i.balance > 0);
    if (!agingFilter) return openInvoices;

    const today = new Date('2025-12-15');
    return openInvoices.filter(inv => {
      const due = new Date(inv.due_date);
      const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (agingFilter) {
        case 'Current': return daysOverdue <= 0;
        case '1-30': return daysOverdue > 0 && daysOverdue <= 30;
        case '31-60': return daysOverdue > 30 && daysOverdue <= 60;
        case '61+': return daysOverdue > 60;
        default: return true;
      }
    });
  };

  const renderContent = () => {
    switch (type) {
      case 'ar':
        const filteredInvoices = getFilteredInvoices();
        return (
          <>
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Outstanding:</span>
                <span className="font-mono font-bold text-lg">
                  ${filteredInvoices.reduce((s, i) => s + i.balance, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Invoices:</span>
                <span>{filteredInvoices.length}</span>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono">{inv.id}</TableCell>
                    <TableCell>{inv.tenant}</TableCell>
                    <TableCell>{inv.due_date}</TableCell>
                    <TableCell className="text-right font-mono">${inv.balance.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        );

      case 'expenses':
        const operatingExpenses = [
          { category: 'Repairs & Maintenance', amount: 18500 },
          { category: 'Landscaping', amount: 4200 },
          { category: 'Utilities', amount: 12000 },
          { category: 'Insurance', amount: 8500 },
          { category: 'Property Taxes', amount: 24000 },
          { category: 'Management Fees', amount: 25000 },
        ];
        const capitalExpenses = [
          { category: 'HVAC Replacement', amount: 28000 },
          { category: 'Roof Repair', amount: 17000 },
        ];
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Operating Expenses</h3>
              <div className="space-y-2">
                {operatingExpenses.map((exp, idx) => (
                  <div key={idx} className="flex justify-between p-2 bg-muted/30 rounded">
                    <span>{exp.category}</span>
                    <span className="font-mono">${exp.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between p-2 bg-muted/50 rounded font-medium border-t">
                  <span>Total Operating</span>
                  <span className="font-mono">${operatingExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Capital Expenditures</h3>
              <div className="space-y-2">
                {capitalExpenses.map((exp, idx) => (
                  <div key={idx} className="flex justify-between p-2 bg-muted/30 rounded">
                    <span>{exp.category}</span>
                    <span className="font-mono">${exp.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between p-2 bg-muted/50 rounded font-medium border-t">
                  <span>Total CapEx</span>
                  <span className="font-mono">${capitalExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'trust':
        const trustDetails = [
          { tenant: 'John Smith', unit: 'Greenway - 101', amount: 2500, status: 'Held' },
          { tenant: 'Jane Doe', unit: 'Greenway - 205', amount: 2800, status: 'Held' },
          { tenant: 'Bob Johnson', unit: 'Oak Manor - 301', amount: 3200, status: 'Held' },
          { tenant: 'Lisa Chen', unit: 'Greenway - 115', amount: 2500, status: 'Held' },
        ];
        const totalHeld = trustDetails.reduce((s, d) => s + d.amount, 0);
        return (
          <>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Trust Balance</span>
                <span className="font-mono font-bold text-lg text-primary">${(185000).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div className="p-2 bg-background rounded">
                  <div className="text-muted-foreground">Security Deposits Held</div>
                  <div className="font-mono font-medium">${totalHeld.toLocaleString()}</div>
                </div>
                <div className="p-2 bg-background rounded">
                  <div className="text-muted-foreground">Prepaid Rent</div>
                  <div className="font-mono font-medium">$8,500</div>
                </div>
              </div>
            </div>
            <h4 className="font-medium mb-2">Security Deposits by Tenant</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trustDetails.map((d, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{d.tenant}</TableCell>
                    <TableCell>{d.unit}</TableCell>
                    <TableCell className="text-right font-mono">${d.amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="secondary">{d.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        );

      case 'revenue':
        const revenueBreakdown = [
          { source: 'Rental Income - Greenway Apts', amount: 145000 },
          { source: 'Rental Income - Oak Manor', amount: 95000 },
          { source: 'Late Fees', amount: 4500 },
          { source: 'Application Fees', amount: 2800 },
          { source: 'Pet Fees', amount: 3200 },
        ];
        return (
          <div className="space-y-2">
            {revenueBreakdown.map((rev, idx) => (
              <div key={idx} className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span>{rev.source}</span>
                <span className="font-mono font-medium text-green-600">${rev.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between p-3 bg-green-50 border border-green-200 rounded-lg font-medium mt-4">
              <span>Total Revenue</span>
              <span className="font-mono text-green-600">${revenueBreakdown.reduce((s, r) => s + r.amount, 0).toLocaleString()}</span>
            </div>
          </div>
        );

      case 'netIncome':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-mono text-green-600">$250,500</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Total Expenses</span>
                <span className="font-mono text-destructive">-$47,500</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-medium">
                <span>Net Operating Income (NOI)</span>
                <span className="font-mono text-primary">$203,000</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <div className="flex items-center gap-2 font-medium text-blue-800">
                <DollarSign className="h-4 w-4" />
                NOI Margin: 81.0%
              </div>
              <p className="text-blue-600 mt-1">
                Strong operational efficiency with expenses at 19% of revenue.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
          <SheetDescription>
            Detailed breakdown for the current period
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={handleExport} className="mb-4">
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
