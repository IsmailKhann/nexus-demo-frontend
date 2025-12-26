import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Building2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { TenantInvoice } from '@/lib/paymentEngine';
import { toast } from '@/hooks/use-toast';

interface InvoiceDetailPanelProps {
  open: boolean;
  onClose: () => void;
  invoice: TenantInvoice | null;
  onPayNow: () => void;
}

export const InvoiceDetailPanel = ({ open, onClose, invoice, onPayNow }: InvoiceDetailPanelProps) => {
  if (!invoice) return null;

  const getStatusConfig = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any; color: string }> = {
      open: { variant: 'secondary', icon: Clock, color: 'text-blue-600' },
      overdue: { variant: 'destructive', icon: AlertCircle, color: 'text-red-600' },
      paid: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      partial: { variant: 'outline', icon: Clock, color: 'text-yellow-600' },
    };
    return config[status] || config.open;
  };

  const statusConfig = getStatusConfig(invoice.status);
  const StatusIcon = statusConfig.icon;

  const handleDownload = () => {
    toast({ title: 'Download Started', description: 'Your receipt is being generated...' });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <SheetTitle>Invoice Details</SheetTitle>
          </div>
          <SheetDescription>{invoice.id}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg ${
            invoice.status === 'paid' ? 'bg-green-500/10' :
            invoice.status === 'overdue' ? 'bg-red-500/10' : 'bg-muted'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                <span className="font-medium capitalize">{invoice.status}</span>
              </div>
              <Badge variant={statusConfig.variant}>{invoice.status}</Badge>
            </div>
          </div>

          {/* Property Info */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Building2 className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">{invoice.property}</p>
              <p className="text-sm text-muted-foreground">{invoice.unit}</p>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="space-y-3">
            <h4 className="font-medium">Invoice Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Date</span>
                <span>{invoice.createdAt.split('T')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className={invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                  {invoice.dueDate}
                </span>
              </div>
              {invoice.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Date</span>
                  <span className="text-green-600">{invoice.paidAt.split('T')[0]}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div className="space-y-3">
            <h4 className="font-medium">Charges</h4>
            <div className="space-y-2">
              {invoice.lineItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.description}</span>
                  <span className="font-mono">${item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">${invoice.amount.toLocaleString()}</span>
            </div>
            {invoice.status === 'partial' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-mono text-green-600">
                  -${(invoice.amount - invoice.balance).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between font-medium text-lg">
              <span>Balance Due</span>
              <span className={`font-mono ${invoice.balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                ${invoice.balance.toLocaleString()}
              </span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {invoice.balance > 0 && (
              <Button className="w-full" onClick={onPayNow}>
                Pay ${invoice.balance.toLocaleString()} Now
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download {invoice.status === 'paid' ? 'Receipt' : 'Invoice'}
            </Button>
          </div>

          {/* Dispute Notice */}
          {invoice.balance > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Questions about this invoice?</strong><br />
                Contact the management office or submit a maintenance request to discuss any discrepancies.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
