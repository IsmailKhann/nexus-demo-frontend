import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { reportTemplates, ReportTemplate } from '@/data/accountingData';
import { toast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Scale, 
  ArrowRightLeft, 
  FileText, 
  AlertTriangle, 
  ClipboardList,
  FileSpreadsheet,
  Play,
  Download,
  Calendar
} from 'lucide-react';

interface ReportsTabProps {
  onRunReport: (reportId: string, filters: { property?: string; dateRange?: { start: string; end: string } }) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  Scale,
  ArrowRightLeft,
  FileText,
  AlertTriangle,
  ClipboardList,
  FileSpreadsheet,
};

export function ReportsTab({ onRunReport }: ReportsTabProps) {
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    property: 'all',
    startDate: '2025-11-01',
    endDate: '2025-11-30',
  });
  const [isRunning, setIsRunning] = useState(false);

  const handleRunReport = async () => {
    if (!selectedReport) return;
    
    setIsRunning(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onRunReport(selectedReport.id, {
      property: filters.property === 'all' ? undefined : filters.property,
      dateRange: { start: filters.startDate, end: filters.endDate },
    });
    
    setIsRunning(false);
    setRunModalOpen(false);
    setResultsModalOpen(true);
    toast({ title: 'Report Generated', description: `${selectedReport.name} is ready` });
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast({ title: 'Exporting...', description: `Downloading report as ${format.toUpperCase()}` });
  };

  const openRunModal = (report: ReportTemplate) => {
    setSelectedReport(report);
    setRunModalOpen(true);
  };

  // Generate mock report data based on report type
  const getMockReportData = () => {
    if (!selectedReport) return [];
    
    switch (selectedReport.id) {
      case 'rpt_pnl':
        return [
          { category: 'Rental Income', amount: 48000 },
          { category: 'Late Fees', amount: 1200 },
          { category: 'Other Income', amount: 800 },
          { category: 'Repairs & Maintenance', amount: -5200 },
          { category: 'Utilities', amount: -3100 },
          { category: 'Insurance', amount: -2100 },
          { category: 'Management Fees', amount: -4800 },
          { category: 'Net Income', amount: 34800, isTotal: true },
        ];
      case 'rpt_delinquency':
        return [
          { tenant: 'Jane Doe', property: 'Greenway Apts - Unit 205', balance: 2800, daysOverdue: 10 },
          { tenant: 'Bob Johnson', property: 'Oak Manor - Unit 301', balance: 3200, daysOverdue: 45 },
          { tenant: 'Tom Brown', property: 'Oak Manor - Unit 210', balance: 2900, daysOverdue: 106 },
        ];
      case 'rpt_rentroll':
        return [
          { unit: 'Unit 101', tenant: 'John Smith', rent: 2500, status: 'Current' },
          { unit: 'Unit 110', tenant: 'Mike Davis', rent: 2400, status: 'Current' },
          { unit: 'Unit 115', tenant: 'Lisa Chen', rent: 2500, status: 'Current' },
          { unit: 'Unit 205', tenant: 'Jane Doe', rent: 2800, status: 'Delinquent' },
        ];
      default:
        return [
          { account: '1000 - Operating Cash', debit: 125000, credit: 0 },
          { account: '1100 - Accounts Receivable', debit: 45000, credit: 0 },
          { account: '2000 - Accounts Payable', debit: 0, credit: 32000 },
          { account: '4000 - Rental Income', debit: 0, credit: 250000 },
        ];
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Generate financial and operational reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTemplates.map((report) => {
              const Icon = iconMap[report.icon] || FileText;
              return (
                <Card 
                  key={report.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => openRunModal(report)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{report.name}</h3>
                          <Badge variant="outline" className="text-xs">{report.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-4">
                      <Play className="h-4 w-4 mr-1" /> Run Report
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Run Report Modal */}
      <Dialog open={runModalOpen} onOpenChange={setRunModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run {selectedReport?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Property</Label>
              <Select value={filters.property} onValueChange={(v) => setFilters({ ...filters, property: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="Greenway Apts">Greenway Apts</SelectItem>
                  <SelectItem value="Oak Manor">Oak Manor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input 
                  type="date" 
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input 
                  type="date" 
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRunModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRunReport} disabled={isRunning}>
              {isRunning ? 'Generating...' : 'Run Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Modal */}
      <Dialog open={resultsModalOpen} onOpenChange={setResultsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedReport?.name}
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {filters.startDate} - {filters.endDate}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedReport?.id === 'rpt_pnl' && (
                    <>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </>
                  )}
                  {selectedReport?.id === 'rpt_delinquency' && (
                    <>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Days Overdue</TableHead>
                    </>
                  )}
                  {selectedReport?.id === 'rpt_rentroll' && (
                    <>
                      <TableHead>Unit</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead className="text-right">Monthly Rent</TableHead>
                      <TableHead>Status</TableHead>
                    </>
                  )}
                  {!['rpt_pnl', 'rpt_delinquency', 'rpt_rentroll'].includes(selectedReport?.id || '') && (
                    <>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {getMockReportData().map((row: any, idx) => (
                  <TableRow key={idx} className={row.isTotal ? 'font-bold bg-muted/50' : ''}>
                    {selectedReport?.id === 'rpt_pnl' && (
                      <>
                        <TableCell>{row.category}</TableCell>
                        <TableCell className={`text-right font-mono ${row.amount < 0 ? 'text-destructive' : row.amount > 0 ? 'text-green-600' : ''}`}>
                          ${Math.abs(row.amount).toLocaleString()}
                        </TableCell>
                      </>
                    )}
                    {selectedReport?.id === 'rpt_delinquency' && (
                      <>
                        <TableCell className="font-medium">{row.tenant}</TableCell>
                        <TableCell>{row.property}</TableCell>
                        <TableCell className="text-right font-mono text-destructive">${row.balance.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={row.daysOverdue > 60 ? 'destructive' : 'secondary'}>
                            {row.daysOverdue} days
                          </Badge>
                        </TableCell>
                      </>
                    )}
                    {selectedReport?.id === 'rpt_rentroll' && (
                      <>
                        <TableCell className="font-medium">{row.unit}</TableCell>
                        <TableCell>{row.tenant}</TableCell>
                        <TableCell className="text-right font-mono">${row.rent.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={row.status === 'Current' ? 'default' : 'destructive'}>
                            {row.status}
                          </Badge>
                        </TableCell>
                      </>
                    )}
                    {!['rpt_pnl', 'rpt_delinquency', 'rpt_rentroll'].includes(selectedReport?.id || '') && (
                      <>
                        <TableCell className="font-medium">{row.account}</TableCell>
                        <TableCell className="text-right font-mono">{row.debit > 0 ? `$${row.debit.toLocaleString()}` : ''}</TableCell>
                        <TableCell className="text-right font-mono">{row.credit > 0 ? `$${row.credit.toLocaleString()}` : ''}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-1" /> PDF
            </Button>
            <Button onClick={() => setResultsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
