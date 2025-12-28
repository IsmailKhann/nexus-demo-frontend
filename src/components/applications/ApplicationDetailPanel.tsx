import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useApplicationsStore, type Application } from '@/hooks/useApplicationsStore';
import { ScreeningTab } from './ScreeningTab';
import { LeaseGenerationModal } from './LeaseGenerationModal';
import { SendForSignatureModal } from './SendForSignatureModal';
import {
  User,
  Mail,
  Phone,
  DollarSign,
  Home,
  FileText,
  ShieldCheck,
  PenTool,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Download,
  CreditCard,
} from 'lucide-react';

interface ApplicationDetailPanelProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusBadge = (status: string) => {
  const configs: Record<string, { className: string; label: string }> = {
    draft: { className: 'bg-muted text-muted-foreground', label: 'Draft' },
    pending_review: { className: 'bg-warning/10 text-warning', label: 'Pending Review' },
    in_screening: { className: 'bg-info/10 text-info', label: 'In Screening' },
    manual_review: { className: 'bg-warning/10 text-warning', label: 'Manual Review' },
    approved: { className: 'bg-success/10 text-success', label: 'Approved' },
    ready_to_sign: { className: 'bg-primary/10 text-primary', label: 'Ready to Sign' },
    sent_for_signature: { className: 'bg-info/10 text-info', label: 'Awaiting Signature' },
    signed: { className: 'bg-success/10 text-success', label: 'Lease Signed' },
    rejected: { className: 'bg-destructive/10 text-destructive', label: 'Rejected' },
  };
  const config = configs[status] || configs.draft;
  return <Badge className={config.className}>{config.label}</Badge>;
};

export const ApplicationDetailPanel = ({ application, open, onOpenChange }: ApplicationDetailPanelProps) => {
  const { toast } = useToast();
  const { updateApplicationStatus, getChecklistStats } = useApplicationsStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [leaseModalOpen, setLeaseModalOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  if (!application) return null;
  
  const checklistStats = getChecklistStats(application.id);
  
  const handleApprove = () => {
    updateApplicationStatus(application.id, 'approved');
    toast({ title: 'Application Approved', description: 'The application has been approved.' });
  };
  
  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast({ title: 'Reason Required', description: 'Please provide a rejection reason.', variant: 'destructive' });
      return;
    }
    updateApplicationStatus(application.id, 'rejected', rejectReason);
    toast({ title: 'Application Rejected', description: 'The applicant has been notified.' });
    setRejectDialogOpen(false);
    setRejectReason('');
  };
  
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col p-0">
          <SheetHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SheetTitle className="text-xl">{application.applicant.name}</SheetTitle>
                {getStatusBadge(application.status)}
              </div>
              <span className="text-sm text-muted-foreground">{application.id}</span>
            </div>
            <SheetDescription>
              {application.property} - {application.unit}
            </SheetDescription>
          </SheetHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="overview" className="gap-2">
                <User className="h-4 w-4" />Overview
              </TabsTrigger>
              <TabsTrigger value="screening" className="gap-2">
                <ShieldCheck className="h-4 w-4" />Screening
                <Badge variant="outline" className="ml-1 text-xs">{checklistStats.verified}/{checklistStats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="lease" className="gap-2">
                <FileText className="h-4 w-4" />Lease
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-auto p-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Applicant Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Applicant Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{application.applicant.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{application.applicant.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{application.property} - {application.unit}</span>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Financial Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">${application.monthlyIncome.toLocaleString()}/mo</p>
                          <p className="text-xs text-muted-foreground">Monthly Income</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{application.creditScore || 'Pending'}</p>
                          <p className="text-xs text-muted-foreground">Credit Score</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{application.employmentStatus.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">Employment</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{application.pets ? 'Yes' : 'No'}</p>
                        <p className="text-xs text-muted-foreground">Pets</p>
                      </div>
                    </div>
                    
                    {application.coApplicants.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Co-Applicants</p>
                        {application.coApplicants.map((co, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{co.name} ({co.relationship})</span>
                            <span className="text-muted-foreground">${co.income.toLocaleString()}/mo</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <Card>
                    <CardContent className="pt-4 pb-3 text-center">
                      <p className="text-2xl font-bold">{checklistStats.uploaded}</p>
                      <p className="text-xs text-muted-foreground">Docs Uploaded</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-3 text-center">
                      <p className="text-2xl font-bold text-success">{checklistStats.verified}</p>
                      <p className="text-xs text-muted-foreground">Verified</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-3 text-center">
                      <p className="text-2xl font-bold">${application.rent.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Monthly Rent</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Timeline */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Application Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Created: {new Date(application.createdAt).toLocaleDateString()}</span>
                    </div>
                    {application.submittedAt && (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm">Submitted: {new Date(application.submittedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {application.approvedAt && (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm">Approved: {new Date(application.approvedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {application.esign.signedTimestamp && (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm">Lease Signed: {new Date(application.esign.signedTimestamp).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="screening" className="mt-0">
                <ScreeningTab 
                  application={application} 
                  onGenerateLease={() => setLeaseModalOpen(true)} 
                />
              </TabsContent>
              
              <TabsContent value="lease" className="mt-0 space-y-6">
                {/* Lease Status */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Lease Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!application.lease ? (
                      <div className="text-center py-6">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No lease generated yet</p>
                        {application.screeningPassed && (
                          <Button className="mt-4" onClick={() => setLeaseModalOpen(true)}>
                            <FileText className="h-4 w-4 mr-2" />Generate Lease
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{application.lease.templateName}</p>
                            <p className="text-sm text-muted-foreground">Generated {new Date(application.lease.generatedAt).toLocaleDateString()}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />Preview
                          </Button>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Monthly Rent</p>
                            <p className="font-medium">${application.lease.rent.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Security Deposit</p>
                            <p className="font-medium">${application.lease.securityDeposit.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium">{application.lease.startDate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">End Date</p>
                            <p className="font-medium">{application.lease.endDate}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* E-Sign Status */}
                {application.lease && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">E-Signature Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {application.esign.status === 'not_sent' && <Clock className="h-5 w-5 text-muted-foreground" />}
                          {application.esign.status === 'sent' && <Send className="h-5 w-5 text-info" />}
                          {application.esign.status === 'signed' && <CheckCircle className="h-5 w-5 text-success" />}
                          <span className="font-medium capitalize">{application.esign.status.replace('_', ' ')}</span>
                        </div>
                        
                        {application.esign.status === 'not_sent' && (
                          <Button onClick={() => setSignatureModalOpen(true)}>
                            <PenTool className="h-4 w-4 mr-2" />Send for Signature
                          </Button>
                        )}
                        
                        {application.esign.status === 'signed' && (
                          <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />Download Signed
                          </Button>
                        )}
                      </div>
                      
                      {application.esign.signers.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Signers</p>
                          {application.esign.signers.map((signer, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded border text-sm">
                              <div>
                                <p className="font-medium">{signer.name}</p>
                                <p className="text-xs text-muted-foreground">{signer.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{signer.role}</Badge>
                                {signer.signed ? (
                                  <Badge className="bg-success/10 text-success">
                                    <CheckCircle className="h-3 w-3 mr-1" />Signed
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    <Clock className="h-3 w-3 mr-1" />Pending
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {application.esign.sentTimestamp && (
                        <p className="text-xs text-muted-foreground mt-3">
                          Sent on {new Date(application.esign.sentTimestamp).toLocaleString()}
                          {application.esign.expiryDate && ` • Expires ${new Date(application.esign.expiryDate).toLocaleDateString()}`}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
            
            {/* Action Footer */}
            <div className="p-6 pt-0 border-t mt-auto">
              <div className="flex gap-3">
                {application.status !== 'approved' && application.status !== 'rejected' && application.status !== 'signed' && (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => setRejectDialogOpen(true)}>
                      <XCircle className="h-4 w-4 mr-2" />Reject
                    </Button>
                    {application.screeningPassed && application.status !== 'ready_to_sign' && application.status !== 'sent_for_signature' && (
                      <Button className="flex-1" onClick={handleApprove}>
                        <CheckCircle className="h-4 w-4 mr-2" />Approve
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>
      
      {/* Modals */}
      <LeaseGenerationModal 
        open={leaseModalOpen} 
        onOpenChange={setLeaseModalOpen} 
        application={application} 
      />
      
      <SendForSignatureModal 
        open={signatureModalOpen} 
        onOpenChange={setSignatureModalOpen} 
        application={application} 
      />
      
      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {application.applicant.name}'s application.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
