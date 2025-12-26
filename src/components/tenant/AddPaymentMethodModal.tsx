import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Building2 } from 'lucide-react';
import { PaymentMethod } from '@/lib/paymentEngine';
import { toast } from '@/hooks/use-toast';

interface AddPaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (method: Omit<PaymentMethod, 'id'>) => PaymentMethod;
}

export const AddPaymentMethodModal = ({ open, onClose, onAdd }: AddPaymentMethodModalProps) => {
  const [type, setType] = useState<'card' | 'ach'>('card');
  const [isDefault, setIsDefault] = useState(false);
  
  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardNickname, setCardNickname] = useState('');

  // ACH fields
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [achNickname, setAchNickname] = useState('');

  const resetForm = () => {
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardNickname('');
    setRoutingNumber('');
    setAccountNumber('');
    setBankName('');
    setAchNickname('');
    setIsDefault(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const detectCardBrand = (number: string): string => {
    const clean = number.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('3')) return 'Amex';
    if (clean.startsWith('6')) return 'Discover';
    return 'Card';
  };

  const handleAddCard = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.length < 15) {
      toast({ title: 'Invalid Card Number', variant: 'destructive' });
      return;
    }
    
    const [month, year] = cardExpiry.split('/');
    if (!month || !year) {
      toast({ title: 'Invalid Expiry Date', variant: 'destructive' });
      return;
    }

    const method: Omit<PaymentMethod, 'id'> = {
      type: 'card',
      last4: clean.slice(-4),
      brand: detectCardBrand(clean),
      isDefault,
      expiryMonth: parseInt(month),
      expiryYear: 2000 + parseInt(year),
      nickname: cardNickname || `${detectCardBrand(clean)} •••• ${clean.slice(-4)}`,
    };

    onAdd(method);
    toast({ title: 'Card Added', description: 'Payment method added successfully' });
    handleClose();
  };

  const handleAddACH = () => {
    if (routingNumber.length !== 9) {
      toast({ title: 'Invalid Routing Number', description: 'Must be 9 digits', variant: 'destructive' });
      return;
    }
    if (accountNumber.length < 4) {
      toast({ title: 'Invalid Account Number', variant: 'destructive' });
      return;
    }

    const method: Omit<PaymentMethod, 'id'> = {
      type: 'ach',
      last4: accountNumber.slice(-4),
      bankName: bankName || 'Bank Account',
      isDefault,
      nickname: achNickname || `${bankName || 'Bank'} •••• ${accountNumber.slice(-4)}`,
    };

    onAdd(method);
    toast({ title: 'Bank Account Added', description: 'Payment method added successfully' });
    handleClose();
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>Add a new card or bank account</DialogDescription>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as 'card' | 'ach')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="ach" className="gap-2">
              <Building2 className="h-4 w-4" />
              Bank Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNickname">Nickname (Optional)</Label>
              <Input
                id="cardNickname"
                placeholder="e.g., Personal Visa"
                value={cardNickname}
                onChange={(e) => setCardNickname(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="ach" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="e.g., Chase Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routing">Routing Number</Label>
              <Input
                id="routing"
                placeholder="123456789"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                maxLength={9}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Account Number</Label>
              <Input
                id="account"
                placeholder="••••••••1234"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="achNickname">Nickname (Optional)</Label>
              <Input
                id="achNickname"
                placeholder="e.g., Checking Account"
                value={achNickname}
                onChange={(e) => setAchNickname(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="default"
            checked={isDefault}
            onCheckedChange={(checked) => setIsDefault(checked === true)}
          />
          <Label htmlFor="default" className="text-sm">Set as default payment method</Label>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={type === 'card' ? handleAddCard : handleAddACH}>
            Add {type === 'card' ? 'Card' : 'Bank Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
