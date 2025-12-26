import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CreditCard, Building2, CheckCircle, Loader2, Undo2 } from 'lucide-react';
import { Payment } from '@/data/accountingData';

interface RefundModalProps {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
  onRefund: (paymentId: string, amount: number, reason: string, notes: string) => Promise<{ success: boolean; message: string }>;
  isProcessing: boolean;
}

const REFUND_REASONS = [
  { value: 'overpayment', label: 'Overpayment' },
  { value: 'duplicate', label: 'Duplicate Payment' },
  { value: 'lease_cancellation', label: 'Lease Cancellation' },
  { value: 'service_issue', label: 'Service Issue' },
  { value: 'other', label: 'Other' },
];

export const RefundModal = ({ open, onClose, payment, onRefund, isProcessing }: RefundModalProps) => {
  const [step, setStep] = useState<'form' | 'confirm' | 'result'>('form');
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const resetForm = () => {
    setStep('form');
    setRefundType('full');
    setRefundAmount('');
    setReason('');
    setNotes('');
    setResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!payment) return null;

  const effectiveRefundAmount = refundType === 'full' 
    ? payment.amount 
    : parseFloat(refundAmount) || 0;

  const remainingBalance = payment.amount - effectiveRefundAmount;

  const canProceed = () => {
    if (!reason) return false;
    if (refundType === 'partial') {
      const amt = parseFloat(refundAmount);
      if (!amt || amt <= 0 || amt > payment.amount) return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!canProceed()) return;
    setStep('confirm');
  };

  const handleConfirm = async () => {
    const refundResult = await onRefund(
      payment.id,
      effectiveRefundAmount,
      REFUND_REASONS.find(r => r.value === reason)?.label || reason,
      notes
    );
    setResult(refundResult);
    setStep('result');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Undo2 className="h-5 w-5 text-amber-500" />
            {step === 'form' && 'Issue Refund'}
            {step === 'confirm' && 'Confirm Refund'}
            {step === 'result' && (result?.success ? 'Refund Processed' : 'Refund Failed')}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && `Refund payment ${payment.id}`}
            {step === 'confirm' && 'Review and confirm the refund details'}
            {step === 'result' && result?.message}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-4 py-4">
            {/* Payment Summary */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="font-mono">{payment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payer</span>
                <span className="font-medium">{payment.payer_payee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Amount</span>
                <span className="font-mono font-bold">${payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <div className="flex items-center gap-1">
                  {payment.method === 'Card' ? <CreditCard className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                  <span>{payment.method}</span>
                </div>
              </div>
            </div>

            {/* Refund Type */}
            <div className="space-y-3">
              <Label>Refund Type</Label>
              <RadioGroup value={refundType} onValueChange={(v) => setRefundType(v as 'full' | 'partial')}>
                <div 
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${refundType === 'full' ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setRefundType('full')}
                >
                  <RadioGroupItem value="full" id="full" />
                  <div className="flex-1">
                    <Label htmlFor="full" className="font-medium cursor-pointer">Full Refund</Label>
                    <p className="text-sm text-muted-foreground">Refund the entire payment amount</p>
                  </div>
                  <span className="font-mono font-bold">${payment.amount.toLocaleString()}</span>
                </div>
                <div 
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${refundType === 'partial' ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setRefundType('partial')}
                >
                  <RadioGroupItem value="partial" id="partial" />
                  <div className="flex-1">
                    <Label htmlFor="partial" className="font-medium cursor-pointer">Partial Refund</Label>
                    <p className="text-sm text-muted-foreground">Refund a specific amount</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Partial Amount */}
            {refundType === 'partial' && (
              <div className="space-y-2">
                <Label htmlFor="amount">Refund Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-7"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    max={payment.amount}
                  />
                </div>
                {parseFloat(refundAmount) > payment.amount && (
                  <p className="text-sm text-destructive">Amount cannot exceed original payment</p>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select refund reason" />
                </SelectTrigger>
                <SelectContent>
                  {REFUND_REASONS.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details about this refund..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-700">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-sm">
                Refunds will be processed to the original payment method. This action cannot be undone.
              </p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4 py-4">
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Payment</span>
                <span className="font-mono">${payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-medium">Refund Amount</span>
                <span className="font-mono font-bold text-amber-600">-${effectiveRefundAmount.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-mono">${remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason</span>
                <span>{REFUND_REASONS.find(r => r.value === reason)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination</span>
                <div className="flex items-center gap-1">
                  {payment.method === 'Card' ? <CreditCard className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                  <span>Original {payment.method}</span>
                </div>
              </div>
              {notes && (
                <div>
                  <span className="text-muted-foreground">Notes:</span>
                  <p className="text-sm mt-1">{notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-sm">
                This will issue a {refundType === 'full' ? 'full' : 'partial'} refund of ${effectiveRefundAmount.toLocaleString()} to {payment.payer_payee}. 
                The tenant will be notified automatically.
              </p>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="py-8 text-center">
            {result?.success ? (
              <div className="space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">-${effectiveRefundAmount.toLocaleString()}</p>
                  <p className="text-muted-foreground">Refund processed successfully</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p>The tenant has been notified and the refund will appear in their billing history.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-muted-foreground">{result?.message}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'form' && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleContinue} disabled={!canProceed()} className="bg-amber-500 hover:bg-amber-600">
                Continue
              </Button>
            </>
          )}
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setStep('form')}>Back</Button>
              <Button onClick={handleConfirm} disabled={isProcessing} className="bg-amber-500 hover:bg-amber-600">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Confirm Refund $${effectiveRefundAmount.toLocaleString()}`
                )}
              </Button>
            </>
          )}
          {step === 'result' && (
            <Button onClick={handleClose} className="w-full">
              {result?.success ? 'Done' : 'Close'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};