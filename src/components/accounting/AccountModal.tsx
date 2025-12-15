import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Account } from '@/data/accountingData';
import { toast } from '@/hooks/use-toast';

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  accounts: Account[];
  onSave: (account: Omit<Account, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Account>) => void;
}

export function AccountModal({
  open,
  onClose,
  account,
  accounts,
  onSave,
  onUpdate,
}: AccountModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Asset' as Account['type'],
    parent: null as string | null,
    normal_balance: 'Debit' as Account['normal_balance'],
    balance: 0,
    status: 'active' as Account['status'],
    system: false,
    description: '',
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        parent: account.parent,
        normal_balance: account.normal_balance,
        balance: account.balance,
        status: account.status,
        system: account.system,
        description: account.description || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'Asset',
        parent: null,
        normal_balance: 'Debit',
        balance: 0,
        status: 'active',
        system: false,
        description: '',
      });
    }
  }, [account, open]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Account name is required', variant: 'destructive' });
      return;
    }

    if (account) {
      if (account.system) {
        toast({ title: 'Error', description: 'System accounts cannot be modified', variant: 'destructive' });
        return;
      }
      onUpdate(account.id, formData);
      toast({ title: 'Success', description: 'Account updated successfully' });
    } else {
      onSave(formData);
      toast({ title: 'Success', description: 'Account created successfully' });
    }
    onClose();
  };

  const parentAccounts = accounts.filter(a => 
    a.type === formData.type && a.id !== account?.id
  );

  const isReadOnly = account?.system;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {account ? (isReadOnly ? 'View Account' : 'Edit Account') : 'New Account'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isReadOnly && (
            <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-sm">
              This is a system account and cannot be modified.
            </div>
          )}

          <div>
            <Label>Account Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Operating Cash"
              disabled={isReadOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Account Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v: Account['type']) => setFormData({ ...formData, type: v })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asset">Asset</SelectItem>
                  <SelectItem value="Liability">Liability</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Normal Balance</Label>
              <Select 
                value={formData.normal_balance} 
                onValueChange={(v: Account['normal_balance']) => setFormData({ ...formData, normal_balance: v })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Debit">Debit</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Parent Account (Optional)</Label>
            <Select 
              value={formData.parent || 'none'} 
              onValueChange={(v) => setFormData({ ...formData, parent: v === 'none' ? null : v })}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {parentAccounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.id} - {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description..."
              rows={2}
              disabled={isReadOnly}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">Account is available for transactions</p>
            </div>
            <Switch
              checked={formData.status === 'active'}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
              disabled={isReadOnly}
            />
          </div>

          {account && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account #:</span>
                <span className="font-mono">{account.id}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Current Balance:</span>
                <span className="font-mono font-medium">${Math.abs(account.balance).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSave}>
              {account ? 'Update Account' : 'Create Account'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
