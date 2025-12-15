import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Invoice, Payment } from '@/data/accountingData';
import { toast } from '@/hooks/use-toast';
import { DollarSign } from 'lucide-react';

interface ApplyPaymentModalProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onApply: (invoiceId: string, amount: number, method: Payment['method']) => void;
}

export function ApplyPaymentModal({
  open,
  onClose,
  invoice,
  onApply,
}: ApplyPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<Payment['method']>('ACH');

  if (!invoice) return null;

  const handleApply = () => {
    const paymentAmount = parseFloat(amount);
    
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    if (paymentAmount > invoice.balance) {
      toast({ title: 'Error', description: 'Payment cannot exceed balance', variant: 'destructive' });
      return;
    }

    onApply(invoice.id, paymentAmount, method);
    setAmount('');
    setMethod('ACH');
    onClose();
    toast({ title: 'Success', description: `Payment of $${paymentAmount.toLocaleString()} applied to ${invoice.id}` });
  };

  const applyFullBalance = () => {
    setAmount(invoice.balance.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice:</span>
              <span className="font-mono font-medium">{invoice.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tenant:</span>
              <span>{invoice.tenant}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property:</span>
              <span>{invoice.property}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-mono">${invoice.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Outstanding Balance:</span>
              <span className="font-mono font-bold text-primary">${invoice.balance.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <div className="flex items-center justify-between">
              <Label>Payment Amount *</Label>
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-xs"
                onClick={applyFullBalance}
              >
                Apply Full Balance
              </Button>
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8"
                step="0.01"
                min="0"
                max={invoice.balance}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label>Payment Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as Payment['method'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACH">ACH Transfer</SelectItem>
                <SelectItem value="Card">Credit/Debit Card</SelectItem>
                <SelectItem value="Check">Check</SelectItem>
                <SelectItem value="Wire">Wire Transfer</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
              <div className="flex justify-between">
                <span>New Balance After Payment:</span>
                <span className="font-mono font-bold">
                  ${Math.max(0, invoice.balance - parseFloat(amount)).toLocaleString()}
                </span>
              </div>
              {parseFloat(amount) >= invoice.balance && (
                <Badge className="mt-2 bg-green-600">Will mark as PAID</Badge>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApply}>Apply Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
