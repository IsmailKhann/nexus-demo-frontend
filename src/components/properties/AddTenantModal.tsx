import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Unit } from '@/data/unitsData';
import { useToast } from '@/hooks/use-toast';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
  onSave: (unitId: string, tenant: Unit['current_tenant']) => void;
}

const AddTenantModal = ({ isOpen, onClose, unit, onSave }: AddTenantModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    lease_start: '',
    lease_end: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit) return;

    const tenant = {
      id: `TEN_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      lease_start: formData.lease_start,
      lease_end: formData.lease_end
    };

    onSave(unit.id, tenant);
    toast({
      title: 'Tenant Added',
      description: `${formData.name} has been assigned to Unit ${unit.unit_number}`
    });
    setFormData({ name: '', email: '', phone: '', lease_start: '', lease_end: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Tenant</DialogTitle>
          <DialogDescription>
            Assign a tenant to Unit {unit?.unit_number}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="bg-muted border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="bg-muted border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="bg-muted border-border"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lease_start">Lease Start</Label>
              <Input
                id="lease_start"
                type="date"
                value={formData.lease_start}
                onChange={(e) => setFormData({ ...formData, lease_start: e.target.value })}
                className="bg-muted border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lease_end">Lease End</Label>
              <Input
                id="lease_end"
                type="date"
                value={formData.lease_end}
                onChange={(e) => setFormData({ ...formData, lease_end: e.target.value })}
                className="bg-muted border-border"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-border">
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Add Tenant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTenantModal;
