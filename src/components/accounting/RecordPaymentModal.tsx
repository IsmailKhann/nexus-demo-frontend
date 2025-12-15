import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Payment } from '@/data/accountingData';
import { toast } from '@/hooks/use-toast';
import { DollarSign } from 'lucide-react';

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onRecord: (payment: Omit<Payment, 'id' | 'linked_entries'>) => void;
}

export function RecordPaymentModal({
  open,
  onClose,
  onRecord,
}: RecordPaymentModalProps) {
  const [formData, setFormData] = useState({
    type: 'Tenant' as Payment['type'],
    payer_payee: '',
    property: '',
    amount: '',
    method: 'ACH' as Payment['method'],
    reference: '',
    notes: '',
  });

  const handleRecord = () => {
    if (!formData.payer_payee || !formData.amount || !formData.property) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    onRecord({
      date: new Date().toISOString().split('T')[0],
      type: formData.type,
      payer_payee: formData.payer_payee,
      property: formData.property,
      amount,
      method: formData.method,
      status: 'Pending',
      reference: formData.reference || `MAN-${Date.now()}`,
    });

    setFormData({
      type: 'Tenant',
      payer_payee: '',
      property: '',
      amount: '',
      method: 'ACH',
      reference: '',
      notes: '',
    });
    onClose();
    toast({ title: 'Success', description: 'Payment recorded successfully' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Manual Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Type */}
          <div>
            <Label>Payment Type *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(v) => setFormData({ ...formData, type: v as Payment['type'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tenant">Tenant Payment</SelectItem>
                <SelectItem value="Vendor">Vendor Payment</SelectItem>
                <SelectItem value="Owner Payout">Owner Payout</SelectItem>
                <SelectItem value="Deposit Movement">Deposit Movement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payer/Payee */}
          <div>
            <Label>{formData.type === 'Tenant' ? 'Tenant Name' : formData.type === 'Vendor' ? 'Vendor Name' : 'Payee'} *</Label>
            <Input
              value={formData.payer_payee}
              onChange={(e) => setFormData({ ...formData, payer_payee: e.target.value })}
              placeholder={formData.type === 'Tenant' ? 'e.g., John Smith' : 'e.g., ABC Services'}
            />
          </div>

          {/* Property */}
          <div>
            <Label>Property *</Label>
            <Select 
              value={formData.property} 
              onValueChange={(v) => setFormData({ ...formData, property: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Greenway Apts">Greenway Apts</SelectItem>
                <SelectItem value="Oak Manor">Oak Manor</SelectItem>
                <SelectItem value="All Properties">All Properties</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div>
            <Label>Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="pl-8"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label>Payment Method</Label>
            <Select 
              value={formData.method} 
              onValueChange={(v) => setFormData({ ...formData, method: v as Payment['method'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACH">ACH Transfer</SelectItem>
                <SelectItem value="Check">Check</SelectItem>
                <SelectItem value="Card">Credit/Debit Card</SelectItem>
                <SelectItem value="Wire">Wire Transfer</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          <div>
            <Label>Reference # (Optional)</Label>
            <Input
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="e.g., Check #1234"
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleRecord}>Record Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
