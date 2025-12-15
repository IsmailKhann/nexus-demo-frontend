import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Bill, Payment } from '@/data/accountingData';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

interface PayBillModalProps {
  open: boolean;
  onClose: () => void;
  bill: Bill | null;
  onPay: (billId: string, method: Payment['method']) => void;
}

export function PayBillModal({
  open,
  onClose,
  bill,
  onPay,
}: PayBillModalProps) {
  const [method, setMethod] = useState<Payment['method']>('Check');
  const [confirmed, setConfirmed] = useState(false);

  if (!bill) return null;

  const handlePay = () => {
    if (!confirmed) {
      toast({ title: 'Error', description: 'Please confirm the payment', variant: 'destructive' });
      return;
    }

    onPay(bill.id, method);
    setConfirmed(false);
    setMethod('Check');
    onClose();
    toast({ title: 'Success', description: `Payment of $${bill.total.toLocaleString()} scheduled for ${bill.vendor}` });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Bill</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bill Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bill:</span>
              <span className="font-mono font-medium">{bill.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendor:</span>
              <span>{bill.vendor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property:</span>
              <span>{bill.property}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span>{bill.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date:</span>
              <span>{bill.due_date}</span>
            </div>
            {bill.is_1099 && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600">1099 Reportable Vendor</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Amount Due:</span>
              <span className="font-mono font-bold text-primary text-lg">${bill.total.toLocaleString()}</span>
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
                <SelectItem value="Check">Check</SelectItem>
                <SelectItem value="ACH">ACH Transfer</SelectItem>
                <SelectItem value="Wire">Wire Transfer</SelectItem>
                <SelectItem value="Card">Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <p className="font-medium">Description:</p>
            <p className="text-muted-foreground">{bill.description}</p>
          </div>

          {/* Confirmation */}
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <Checkbox 
              id="confirm"
              checked={confirmed}
              onCheckedChange={(c) => setConfirmed(c as boolean)}
            />
            <div>
              <label htmlFor="confirm" className="text-sm font-medium cursor-pointer">
                Confirm Payment
              </label>
              <p className="text-xs text-muted-foreground">
                I authorize payment of ${bill.total.toLocaleString()} to {bill.vendor}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePay} disabled={!confirmed}>
            Pay ${bill.total.toLocaleString()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
