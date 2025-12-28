import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useApplicationsStore, type Application } from '@/hooks/useApplicationsStore';
import { FileText, Calendar } from 'lucide-react';

interface LeaseGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application;
}

const LEASE_TEMPLATES = [
  { id: 'standard', name: 'Standard Residential Lease', duration: 12 },
  { id: 'short-term', name: 'Short-Term Lease', duration: 6 },
  { id: 'month-to-month', name: 'Month-to-Month Agreement', duration: 1 },
];

const CLAUSE_OPTIONS = [
  { id: 'pets', name: 'Pet Policy', description: 'Terms for pet ownership' },
  { id: 'parking', name: 'Parking Rules', description: 'Assigned parking and rules' },
  { id: 'utilities', name: 'Utilities Responsibility', description: 'Who pays for utilities' },
  { id: 'maintenance', name: 'Maintenance Terms', description: 'Tenant maintenance responsibilities' },
  { id: 'sublease', name: 'Sublease Prohibition', description: 'No subletting allowed' },
  { id: 'renewal', name: 'Renewal Terms', description: 'Auto-renewal conditions' },
];

export const LeaseGenerationModal = ({ open, onOpenChange, application }: LeaseGenerationModalProps) => {
  const { toast } = useToast();
  const { generateLease } = useApplicationsStore();
  
  const [templateId, setTemplateId] = useState('standard');
  const [rent, setRent] = useState(application.rent.toString());
  const [securityDeposit, setSecurityDeposit] = useState(application.rent.toString());
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [duration, setDuration] = useState('12');
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  
  const selectedTemplate = LEASE_TEMPLATES.find(t => t.id === templateId);
  
  const calculateEndDate = () => {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + parseInt(duration));
    start.setDate(start.getDate() - 1);
    return start.toISOString().split('T')[0];
  };
  
  const toggleClause = (clauseId: string) => {
    setSelectedClauses(prev => 
      prev.includes(clauseId) ? prev.filter(c => c !== clauseId) : [...prev, clauseId]
    );
  };
  
  const handleGenerate = () => {
    if (!startDate || !rent || !securityDeposit) {
      toast({ title: 'Missing Information', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    
    generateLease(application.id, {
      templateId,
      templateName: selectedTemplate?.name || 'Standard Lease',
      rent: parseFloat(rent),
      securityDeposit: parseFloat(securityDeposit),
      startDate,
      endDate: calculateEndDate(),
      duration: parseInt(duration),
      clauses: selectedClauses,
    });
    
    toast({ 
      title: 'Lease Generated', 
      description: 'The lease document has been created. You can now send it for signature.' 
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Lease Agreement
          </DialogTitle>
          <DialogDescription>
            Create a lease document for {application.applicant.name} at {application.property}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Lease Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEASE_TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.duration} months)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Tenant & Property Info (Auto-filled) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tenant Name</Label>
              <Input value={application.applicant.name} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Property / Unit</Label>
              <Input value={`${application.property} - ${application.unit}`} disabled className="bg-muted" />
            </div>
          </div>
          
          {/* Financial Terms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monthly Rent ($)</Label>
              <Input 
                type="number" 
                value={rent} 
                onChange={(e) => setRent(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Security Deposit ($)</Label>
              <Input 
                type="number" 
                value={securityDeposit} 
                onChange={(e) => setSecurityDeposit(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* Lease Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (Months)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 month</SelectItem>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="18">18 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={calculateEndDate()} disabled className="bg-muted" />
            </div>
          </div>
          
          <Separator />
          
          {/* Additional Clauses */}
          <div className="space-y-3">
            <Label>Additional Clauses</Label>
            <div className="grid grid-cols-2 gap-3">
              {CLAUSE_OPTIONS.map(clause => (
                <div 
                  key={clause.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedClauses.includes(clause.id) ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                  }`}
                  onClick={() => toggleClause(clause.id)}
                >
                  <Checkbox 
                    checked={selectedClauses.includes(clause.id)} 
                    onCheckedChange={() => toggleClause(clause.id)}
                  />
                  <div>
                    <p className="font-medium text-sm">{clause.name}</p>
                    <p className="text-xs text-muted-foreground">{clause.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleGenerate}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Lease
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
