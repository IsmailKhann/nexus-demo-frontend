import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  useApplicationsStore,
  CHECKLIST_LABELS,
  type Application,
  type ChecklistItemStatus,
} from '@/hooks/useApplicationsStore';
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  PenTool,
  Download,
  Eye,
  Home,
  Calendar,
  DollarSign,
  Bell,
} from 'lucide-react';

interface TenantApplicationViewProps {
  applicationId: string;
}

const getStatusBadge = (status: ChecklistItemStatus) => {
  switch (status) {
    case 'verified':
      return <Badge className="bg-success/10 text-success"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
    case 'uploaded':
      return <Badge className="bg-info/10 text-info"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
    case 'rejected':
      return <Badge className="bg-destructive/10 text-destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge variant="outline"><Upload className="h-3 w-3 mr-1" />Required</Badge>;
  }
};

const getAppStatusBadge = (status: string) => {
  const configs: Record<string, { className: string; label: string }> = {
    draft: { className: 'bg-muted text-muted-foreground', label: 'Draft' },
    pending_review: { className: 'bg-warning/10 text-warning', label: 'Pending Review' },
    in_screening: { className: 'bg-info/10 text-info', label: 'In Screening' },
    approved: { className: 'bg-success/10 text-success', label: 'Approved' },
    ready_to_sign: { className: 'bg-primary/10 text-primary', label: 'Ready to Sign' },
    sent_for_signature: { className: 'bg-primary/10 text-primary', label: 'Sign Your Lease' },
    signed: { className: 'bg-success/10 text-success', label: 'Lease Signed' },
    rejected: { className: 'bg-destructive/10 text-destructive', label: 'Rejected' },
  };
  const config = configs[status] || configs.draft;
  return <Badge className={config.className}>{config.label}</Badge>;
};

export const TenantApplicationView = ({ applicationId }: TenantApplicationViewProps) => {
  const { toast } = useToast();
  const { getApplication, uploadDocument, signLease, notifications, markNotificationRead } = useApplicationsStore();
  const application = getApplication(applicationId);
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadChecklistKey, setUploadChecklistKey] = useState('');
  const [certifyChecked, setCertifyChecked] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!application) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Application Found</h3>
          <p className="text-muted-foreground mt-1">Start a new rental application to proceed.</p>
        </CardContent>
      </Card>
    );
  }
  
  const checklistEntries = Object.entries(application.checklist) as [string, typeof application.checklist.id_front][];
  const completedCount = checklistEntries.filter(([, item]) => item.status === 'uploaded' || item.status === 'verified').length;
  const progress = (completedCount / checklistEntries.length) * 100;
  
  const tenantNotifications = notifications.filter(n => n.applicationId === applicationId && n.toRole === 'tenant' && !n.read);
  
  const handleOpenUpload = (checklistKey: string) => {
    setUploadChecklistKey(checklistKey);
    setCertifyChecked(false);
    setUploadModalOpen(true);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!certifyChecked) {
      toast({ title: 'Certification Required', description: 'Please certify that this document belongs to you.', variant: 'destructive' });
      return;
    }
    
    uploadDocument(application.id, uploadChecklistKey, {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    
    toast({ title: 'Document Uploaded', description: 'Your document has been submitted for review.' });
    setUploadModalOpen(false);
  };
  
  const handleSign = () => {
    if (!signatureName.trim()) {
      toast({ title: 'Signature Required', description: 'Please type your full legal name to sign.', variant: 'destructive' });
      return;
    }
    
    signLease(application.id, application.applicant.email);
    toast({ title: 'Lease Signed', description: 'Congratulations! Your lease has been signed successfully.' });
    setSignModalOpen(false);
    setSignatureName('');
  };
  
  return (
    <div className="space-y-6">
      {/* Notifications Banner */}
      {tenantNotifications.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-warning mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-warning">Action Required</p>
                {tenantNotifications.slice(0, 2).map(n => (
                  <p key={n.id} className="text-sm text-muted-foreground mt-1">{n.message}</p>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => tenantNotifications.forEach(n => markNotificationRead(n.id))}
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* E-Sign Banner */}
      {application.esign.status === 'sent' && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <PenTool className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Your Lease is Ready to Sign!</h3>
                  <p className="text-sm text-muted-foreground">Review and sign your lease agreement to secure your new home.</p>
                </div>
              </div>
              <Button onClick={() => setSignModalOpen(true)}>
                <PenTool className="h-4 w-4 mr-2" />Review & Sign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Application Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">My Application</CardTitle>
              <CardDescription>{application.property} - {application.unit}</CardDescription>
            </div>
            {getAppStatusBadge(application.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{application.property}</p>
                <p className="text-sm text-muted-foreground">{application.unit}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">${application.rent.toLocaleString()}/mo</p>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">Applied</p>
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Document Completion</span>
              <span className="font-medium">{completedCount}/{checklistEntries.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      {/* Document Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>Upload the following documents to complete your application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklistEntries.map(([key, item]) => (
            <div 
              key={key} 
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                item.status === 'rejected' ? 'border-destructive/50 bg-destructive/5' :
                item.status === 'verified' ? 'border-success/50 bg-success/5' :
                item.status === 'uploaded' ? 'border-info/50 bg-info/5' :
                'hover:bg-accent/50'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  item.status === 'verified' ? 'bg-success/10' :
                  item.status === 'rejected' ? 'bg-destructive/10' :
                  item.status === 'uploaded' ? 'bg-info/10' :
                  'bg-muted'
                }`}>
                  {item.status === 'verified' ? <CheckCircle className="h-5 w-5 text-success" /> :
                   item.status === 'rejected' ? <XCircle className="h-5 w-5 text-destructive" /> :
                   item.status === 'uploaded' ? <Clock className="h-5 w-5 text-info" /> :
                   <FileText className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{CHECKLIST_LABELS[key]}</p>
                  {item.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      Uploaded {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  )}
                  {item.status === 'rejected' && item.rejectionReason && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {item.rejectionReason}
                    </p>
                  )}
                </div>
                {getStatusBadge(item.status)}
              </div>
              
              <div className="ml-4">
                {(item.status === 'missing' || item.status === 'rejected') && (
                  <Button onClick={() => handleOpenUpload(key)}>
                    <Upload className="h-4 w-4 mr-2" />Upload
                  </Button>
                )}
                {(item.status === 'uploaded' || item.status === 'verified') && (
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />View
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Signed Lease Download */}
      {application.esign.status === 'signed' && (
        <Card className="border-success bg-success/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-success">Lease Signed Successfully!</h3>
                  <p className="text-sm text-muted-foreground">
                    Signed on {new Date(application.esign.signedTimestamp!).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />Download Lease
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {CHECKLIST_LABELS[uploadChecklistKey]}</DialogTitle>
            <DialogDescription>
              Accepted formats: PDF, JPG, PNG (max 10MB)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => certifyChecked && fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground mt-1">PDF, JPG, or PNG up to 10MB</p>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Checkbox 
                id="certify" 
                checked={certifyChecked} 
                onCheckedChange={(checked) => setCertifyChecked(checked === true)}
              />
              <Label htmlFor="certify" className="text-sm cursor-pointer leading-relaxed">
                I certify that this document is genuine, belongs to me, and accurately represents my information. 
                I understand that providing false information may result in application denial.
              </Label>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={!certifyChecked}
            >
              <Upload className="h-4 w-4 mr-2" />Select File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sign Lease Modal */}
      <Dialog open={signModalOpen} onOpenChange={setSignModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Sign Lease Agreement
            </DialogTitle>
            <DialogDescription>
              Review the lease agreement and sign below
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 max-h-[400px] border rounded-lg p-6 bg-muted/30">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold">RESIDENTIAL LEASE AGREEMENT</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This agreement is entered into on {new Date().toLocaleDateString()}
                </p>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <p><strong>Landlord:</strong> Property Management Company</p>
                <p><strong>Tenant:</strong> {application.applicant.name}</p>
                <p><strong>Property:</strong> {application.property} - {application.unit}</p>
                <p><strong>Monthly Rent:</strong> ${application.lease?.rent.toLocaleString()}</p>
                <p><strong>Security Deposit:</strong> ${application.lease?.securityDeposit.toLocaleString()}</p>
                <p><strong>Lease Term:</strong> {application.lease?.startDate} to {application.lease?.endDate}</p>
              </div>
              <Separator />
              <div className="text-sm space-y-2">
                <p className="font-medium">TERMS AND CONDITIONS</p>
                <p>1. The tenant agrees to pay rent on the first day of each month. Rent is due without demand.</p>
                <p>2. A security deposit equal to one month's rent is required and will be returned upon lease termination, subject to deductions for damages.</p>
                <p>3. Tenant is responsible for all utility charges unless otherwise specified.</p>
                <p>4. Tenant shall not make alterations to the property without written consent from the landlord.</p>
                <p>5. Tenant agrees to maintain the property in good condition and report any maintenance issues promptly.</p>
                <p className="italic text-muted-foreground">[Additional terms and conditions apply]</p>
              </div>
            </div>
          </ScrollArea>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Type your full legal name to sign</Label>
              <Input 
                placeholder={application.applicant.name}
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                By typing your name, you agree to sign this document electronically. 
                This signature is legally binding.
              </p>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSignModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSign} disabled={!signatureName.trim()}>
              <PenTool className="h-4 w-4 mr-2" />Sign Lease
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
