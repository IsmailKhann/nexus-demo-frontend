import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SecurityDeposit } from '@/data/accountingData';
import { toast } from '@/hooks/use-toast';
import { Plus, X, DollarSign } from 'lucide-react';

interface ReleaseDepositModalProps {
  open: boolean;
  onClose: () => void;
  deposit: SecurityDeposit | null;
  onRelease: (depositId: string, refundAmount: number, deductions: { description: string; amount: number }[]) => void;
}

export function ReleaseDepositModal({
  open,
  onClose,
  deposit,
  onRelease,
}: ReleaseDepositModalProps) {
  const [deductions, setDeductions] = useState<{ description: string; amount: string }[]>([]);
  const [notes, setNotes] = useState('');

  if (!deposit) return null;

  const totalDeductions = deductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const refundAmount = Math.max(0, deposit.amount - totalDeductions);

  const handleAddDeduction = () => {
    setDeductions([...deductions, { description: '', amount: '' }]);
  };

  const handleRemoveDeduction = (index: number) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  const handleRelease = () => {
    if (totalDeductions > deposit.amount) {
      toast({ title: 'Error', description: 'Deductions cannot exceed deposit amount', variant: 'destructive' });
      return;
    }

    onRelease(
      deposit.id,
      refundAmount,
      deductions.map(d => ({ description: d.description, amount: parseFloat(d.amount) || 0 })).filter(d => d.amount > 0)
    );
    setDeductions([]);
    setNotes('');
    onClose();
    toast({ 
      title: 'Deposit Released', 
      description: `Refund of $${refundAmount.toLocaleString()} scheduled for ${deposit.tenant}` 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Release Security Deposit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Deposit Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tenant:</span>
              <span className="font-medium">{deposit.tenant}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property:</span>
              <span>{deposit.property} - {deposit.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Move-in Date:</span>
              <span>{deposit.move_in_date}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Deposit Amount:</span>
              <span className="font-mono font-bold text-lg">${deposit.amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Deductions (Optional)</Label>
              <Button variant="outline" size="sm" onClick={handleAddDeduction}>
                <Plus className="h-4 w-4 mr-1" /> Add Deduction
              </Button>
            </div>

            {deductions.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3 border rounded-lg border-dashed text-center">
                No deductions. Full deposit will be refunded.
              </p>
            ) : (
              <div className="space-y-2">
                {deductions.map((deduction, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder="Description (e.g., Cleaning)"
                      value={deduction.description}
                      onChange={(e) => {
                        const newDeductions = [...deductions];
                        newDeductions[idx].description = e.target.value;
                        setDeductions(newDeductions);
                      }}
                      className="flex-1"
                    />
                    <div className="relative w-32">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={deduction.amount}
                        onChange={(e) => {
                          const newDeductions = [...deductions];
                          newDeductions[idx].amount = e.target.value;
                          setDeductions(newDeductions);
                        }}
                        className="pl-8"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveDeduction(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Original Deposit:</span>
              <span className="font-mono">${deposit.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Deductions:</span>
              <span className="font-mono text-destructive">-${totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Refund Amount:</span>
              <span className="font-mono font-bold text-lg text-green-600">${refundAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about the deposit release..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleRelease}>
            Release Deposit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
