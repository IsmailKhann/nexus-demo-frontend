import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, Building2, Calendar, FileText, User, Home, 
  Download, Undo2, AlertTriangle, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { Payment } from '@/data/accountingData';

interface PaymentDetailPanelProps {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
  onRefund: () => void;
  onVoid: () => void;
  relatedPayments?: Payment[];
}

export const PaymentDetailPanel = ({ 
  open, 
  onClose, 
  payment, 
  onRefund, 
  onVoid,
  relatedPayments = []
}: PaymentDetailPanelProps) => {
  if (!payment) return null;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any; className?: string }> = {
      Cleared: { variant: 'default', icon: CheckCircle },
      Pending: { variant: 'secondary', icon: Clock },
      Failed: { variant: 'destructive', icon: XCircle },
      Refunded: { variant: 'outline', icon: Undo2, className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
      Voided: { variant: 'outline', icon: XCircle, className: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
    };
    const c = config[status] || { variant: 'outline' as const, icon: Clock };
    const Icon = c.icon;
    return <Badge variant={c.variant} className={`gap-1 ${c.className || ''}`}><Icon className="h-3 w-3" />{status}</Badge>;
  };

  const canRefund = payment.status === 'Cleared' && payment.type !== 'Refund';
  const canVoid = (payment.status === 'Pending' || payment.status === 'Cleared') && payment.type !== 'Refund';
  const isRefunded = payment.status === 'Refunded';

  // Find any refunds related to this payment
  const refunds = relatedPayments.filter(p => p.reference === payment.id && p.type === 'Refund');

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Payment Details</SheetTitle>
          <SheetDescription>{payment.id}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status & Amount */}
          <div className="text-center p-6 bg-muted/30 rounded-lg">
            <p className={`text-4xl font-bold ${payment.amount < 0 ? 'text-amber-600' : ''}`}>
              {payment.amount < 0 ? '-' : ''}${Math.abs(payment.amount).toLocaleString()}
            </p>
            <div className="mt-2">{getStatusBadge(payment.status)}</div>
            {payment.type === 'Refund' && (
              <p className="text-sm text-muted-foreground mt-2">Refund for {payment.reference}</p>
            )}
          </div>

          {/* Payment Summary */}
          <div className="space-y-4">
            <h4 className="font-medium">Payment Summary</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{payment.type === 'Tenant' ? 'Tenant' : payment.type === 'Vendor' ? 'Vendor' : 'Party'}</span>
                </div>
                <span className="font-medium">{payment.payer_payee}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Home className="h-4 w-4" />
                  <span>Property</span>
                </div>
                <span>{payment.property}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                </div>
                <span>{payment.date}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {payment.method === 'Card' ? <CreditCard className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                  <span>Method</span>
                </div>
                <Badge variant="secondary">{payment.method}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Reference</span>
                </div>
                <span className="font-mono text-sm">{payment.reference || '-'}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Type</span>
                </div>
                <Badge variant="outline">{payment.type}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Refund Section */}
          {payment.type !== 'Refund' && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Undo2 className="h-4 w-4" />
                Refund
              </h4>

              {isRefunded ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Payment Refunded</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This payment has been fully refunded. No further refunds can be issued.
                  </p>
                </div>
              ) : payment.status === 'Pending' ? (
                <div className="p-4 bg-muted/50 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Pending Payment</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Refunds cannot be issued for pending payments. Wait for the payment to clear or void it instead.
                  </p>
                </div>
              ) : payment.status === 'Failed' || payment.status === 'Voided' ? (
                <div className="p-4 bg-muted/50 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">No Refund Available</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Refunds cannot be issued for {payment.status.toLowerCase()} payments.
                  </p>
                </div>
              ) : (
                <div className="p-4 border rounded-lg space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Issue a full or partial refund to the original payment method.
                  </p>
                  <Button 
                    className="w-full bg-amber-500 hover:bg-amber-600" 
                    onClick={onRefund}
                    disabled={!canRefund}
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    Issue Refund
                  </Button>
                </div>
              )}

              {/* Show related refunds */}
              {refunds.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Related Refunds</h5>
                  {refunds.map(refund => (
                    <div key={refund.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-mono text-sm">{refund.id}</p>
                        <p className="text-xs text-muted-foreground">{refund.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-amber-600">-${Math.abs(refund.amount).toLocaleString()}</p>
                        {getStatusBadge(refund.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => {}}>
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>

            {canVoid && !isRefunded && (
              <Button 
                variant="outline" 
                className="w-full text-destructive hover:text-destructive" 
                onClick={onVoid}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Void Payment
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};