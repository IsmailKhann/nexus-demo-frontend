import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useApplicationsStore, type Application } from '@/hooks/useApplicationsStore';
import { PenTool, Mail, Plus, X, Calendar, User } from 'lucide-react';

interface SendForSignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application;
}

export const SendForSignatureModal = ({ open, onOpenChange, application }: SendForSignatureModalProps) => {
  const { toast } = useToast();
  const { sendForSignature } = useApplicationsStore();
  
  const [signers, setSigners] = useState([
    { name: application.applicant.name, email: application.applicant.email, role: 'Primary Tenant' },
  ]);
  const [newSigner, setNewSigner] = useState({ name: '', email: '', role: 'Co-signer' });
  const [message, setMessage] = useState(
    `Dear ${application.applicant.name},\n\nPlease review and sign the attached lease agreement for ${application.property} - ${application.unit}.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nProperty Management`
  );
  const [expiryDays, setExpiryDays] = useState('7');
  
  const addSigner = () => {
    if (!newSigner.name || !newSigner.email) {
      toast({ title: 'Missing Information', description: 'Please enter name and email for the signer.', variant: 'destructive' });
      return;
    }
    setSigners([...signers, { ...newSigner }]);
    setNewSigner({ name: '', email: '', role: 'Co-signer' });
  };
  
  const removeSigner = (index: number) => {
    if (index === 0) return; // Can't remove primary tenant
    setSigners(signers.filter((_, i) => i !== index));
  };
  
  const handleSend = () => {
    sendForSignature(application.id, signers, message, parseInt(expiryDays));
    toast({ 
      title: 'Signature Request Sent', 
      description: `Lease sent to ${signers.length} signer(s) for signature.` 
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Send Lease for Signature
          </DialogTitle>
          <DialogDescription>
            Request electronic signatures for the lease agreement
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Lease Summary */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <h4 className="font-medium">Lease Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><span className="text-muted-foreground">Property:</span> {application.property}</p>
              <p><span className="text-muted-foreground">Unit:</span> {application.unit}</p>
              <p><span className="text-muted-foreground">Monthly Rent:</span> ${application.lease?.rent.toLocaleString()}</p>
              <p><span className="text-muted-foreground">Term:</span> {application.lease?.duration} months</p>
              <p><span className="text-muted-foreground">Start Date:</span> {application.lease?.startDate}</p>
              <p><span className="text-muted-foreground">End Date:</span> {application.lease?.endDate}</p>
            </div>
          </div>
          
          {/* Signers */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Signers
            </Label>
            
            {signers.map((signer, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <p className="font-medium text-sm">{signer.name}</p>
                    <p className="text-xs text-muted-foreground">{signer.email}</p>
                  </div>
                  <Badge variant="outline">{signer.role}</Badge>
                </div>
                {index !== 0 && (
                  <Button variant="ghost" size="sm" onClick={() => removeSigner(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {/* Add Signer */}
            <div className="grid grid-cols-4 gap-2 p-3 rounded-lg border border-dashed">
              <Input 
                placeholder="Name"
                value={newSigner.name}
                onChange={(e) => setNewSigner({ ...newSigner, name: e.target.value })}
              />
              <Input 
                placeholder="Email"
                type="email"
                value={newSigner.email}
                onChange={(e) => setNewSigner({ ...newSigner, email: e.target.value })}
              />
              <Select value={newSigner.role} onValueChange={(v) => setNewSigner({ ...newSigner, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Co-signer">Co-signer</SelectItem>
                  <SelectItem value="Guarantor">Guarantor</SelectItem>
                  <SelectItem value="Co-Tenant">Co-Tenant</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={addSigner}>
                <Plus className="h-4 w-4 mr-1" />Add
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Message */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Message to Signers
            </Label>
            <Textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Enter a message to include with the signature request..."
            />
          </div>
          
          {/* Expiry */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Signature Deadline
            </Label>
            <Select value={expiryDays} onValueChange={setExpiryDays}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Signers will have until {new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000).toLocaleDateString()} to sign.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend}>
            <Mail className="h-4 w-4 mr-2" />
            Send for Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
