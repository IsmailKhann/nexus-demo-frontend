import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PaymentMethod, TenantInvoice } from '@/lib/paymentEngine';
import { toast } from '@/hooks/use-toast';

interface PayNowModalProps {
  open: boolean;
  onClose: () => void;
  invoice: TenantInvoice | null;
  paymentMethods: PaymentMethod[];
  onPay: (invoiceId: string, amount: number, paymentMethodId: string) => Promise<{ success: boolean; message: string }>;
  isProcessing: boolean;
}

export const PayNowModal = ({ open, onClose, invoice, paymentMethods, onPay, isProcessing }: PayNowModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>(
    paymentMethods.find(m => m.isDefault)?.id || paymentMethods[0]?.id || ''
  );
  const [amount, setAmount] = useState<string>('');
  const [step, setStep] = useState<'select' | 'confirm' | 'result'>('select');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleClose = () => {
    setStep('select');
    setResult(null);
    setAmount('');
    onClose();
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      toast({ title: 'Select Payment Method', variant: 'destructive' });
      return;
    }
    const payAmount = parseFloat(amount) || invoice?.balance || 0;
    if (payAmount <= 0) {
      toast({ title: 'Enter Valid Amount', variant: 'destructive' });
      return;
    }
    setStep('confirm');
  };

  const handlePay = async () => {
    if (!invoice) return;
    
    const payAmount = parseFloat(amount) || invoice.balance;
    const paymentResult = await onPay(invoice.id, payAmount, selectedMethod);
    setResult(paymentResult);
    setStep('result');
    
    if (paymentResult.success) {
      toast({ title: 'Payment Successful', description: paymentResult.message });
    } else {
      toast({ title: 'Payment Failed', description: paymentResult.message, variant: 'destructive' });
    }
  };

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
  const payAmount = parseFloat(amount) || invoice?.balance || 0;

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' && 'Pay Invoice'}
            {step === 'confirm' && 'Confirm Payment'}
            {step === 'result' && (result?.success ? 'Payment Successful' : 'Payment Failed')}
          </DialogTitle>
          <DialogDescription>
            {step === 'select' && invoice.description}
            {step === 'confirm' && 'Review your payment details'}
            {step === 'result' && result?.message}
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-4 py-4">
            {/* Invoice Summary */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice</span>
                <span className="font-mono">{invoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Due</span>
                <span className="font-mono font-bold">${invoice.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span>{invoice.dueDate}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={invoice.balance.toString()}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={() => setAmount(invoice.balance.toString())}
                >
                  Full
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to pay full balance
              </p>
            </div>

            {/* Payment Methods */}
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
                    <RadioGroupItem value={method.id} id={method.id} />
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
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4 py-4">
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-xl font-bold">${payAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span>Greenway Apts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">From</span>
                <span className="flex items-center gap-2">
                  {selectedPaymentMethod?.type === 'card' ? <CreditCard className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                  •••• {selectedPaymentMethod?.last4}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {selectedPaymentMethod?.type === 'card' 
                ? 'Your card will be charged immediately.'
                : 'ACH payments typically take 2-3 business days to clear.'}
            </p>
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
                  <p className="text-2xl font-bold">${payAmount.toLocaleString()}</p>
                  <p className="text-muted-foreground">Payment processed successfully</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-muted-foreground">{result?.message}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'select' && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleContinue}>Continue</Button>
            </>
          )}
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
              <Button onClick={handlePay} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${payAmount.toLocaleString()}`
                )}
              </Button>
            </>
          )}
          {step === 'result' && (
            <Button onClick={handleClose} className="w-full">
              {result?.success ? 'Done' : 'Try Again'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
