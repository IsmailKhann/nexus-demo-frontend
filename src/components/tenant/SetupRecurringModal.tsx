import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building2, RefreshCw, Calendar } from 'lucide-react';
import { PaymentMethod, RecurringPlan } from '@/lib/paymentEngine';
import { toast } from '@/hooks/use-toast';

interface SetupRecurringModalProps {
  open: boolean;
  onClose: () => void;
  paymentMethods: PaymentMethod[];
  onSetup: (
    amount: number,
    frequency: RecurringPlan['frequency'],
    startDate: string,
    paymentMethodId: string,
    property: string,
    unit: string
  ) => RecurringPlan;
}

export const SetupRecurringModal = ({ open, onClose, paymentMethods, onSetup }: SetupRecurringModalProps) => {
  const [amount, setAmount] = useState('2500');
  const [frequency, setFrequency] = useState<RecurringPlan['frequency']>('monthly');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [selectedMethod, setSelectedMethod] = useState<string>(
    paymentMethods.find(m => m.isDefault)?.id || paymentMethods[0]?.id || ''
  );

  const handleSetup = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: 'Invalid Amount', variant: 'destructive' });
      return;
    }
    if (!selectedMethod) {
      toast({ title: 'Select Payment Method', variant: 'destructive' });
      return;
    }
    if (!startDate) {
      toast({ title: 'Select Start Date', variant: 'destructive' });
      return;
    }

    onSetup(amt, frequency, startDate, selectedMethod, 'Greenway Apts', 'Unit 101');
    toast({ title: 'Auto-Pay Set Up', description: 'Your recurring payment has been scheduled' });
    onClose();
  };

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Set Up Auto-Pay
          </DialogTitle>
          <DialogDescription>
            Schedule automatic rent payments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your monthly rent is $2,500
            </p>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringPlan['frequency'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">First Payment Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                    selectedMethod === method.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <RadioGroupItem value={method.id} id={`recurring-${method.id}`} />
                  <div className="flex items-center gap-3 flex-1">
                    {method.type === 'card' ? (
                      <CreditCard className="h-5 w-5" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                    <div>
                      <p className="font-medium">
                        {method.type === 'card' ? method.brand : method.bankName} •••• {method.last4}
                      </p>
                      <p className="text-xs text-muted-foreground">{method.nickname}</p>
                    </div>
                  </div>
                  {method.isDefault && <Badge variant="secondary">Default</Badge>}
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium">Summary</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono">${parseFloat(amount || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency</span>
                <span className="capitalize">{frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">First Payment</span>
                <span>{new Date(startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span>•••• {selectedPaymentMethod?.last4}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSetup}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Enable Auto-Pay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
