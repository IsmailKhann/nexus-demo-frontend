import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApplicationsStore, type Application, type ApplicationPayment } from '@/hooks/useApplicationsStore';
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
  Undo2,
  AlertTriangle,
  Loader2,
  Building2,
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

const getPaymentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    application_fee: 'Application Fee',
    holding_deposit: 'Holding Deposit',
    security_deposit: 'Security Deposit',
  };
  return labels[type] || type;
};

const REFUND_REASONS = [
  { value: 'application_rejected', label: 'Application Rejected' },
  { value: 'duplicate_payment', label: 'Duplicate Payment' },
  { value: 'applicant_withdrew', label: 'Applicant Withdrew' },
  { value: 'processing_error', label: 'Processing Error' },
  { value: 'other', label: 'Other' },
];

export const ApplicationDetailPanel = ({ application, open, onOpenChange }: ApplicationDetailPanelProps) => {
  const { toast } = useToast();
  const { updateApplicationStatus, getChecklistStats, refundPayment } = useApplicationsStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [leaseModalOpen, setLeaseModalOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  // Refund state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ApplicationPayment | null>(null);
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [refundStep, setRefundStep] = useState<'form' | 'confirm' | 'result'>('form');
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundResult, setRefundResult] = useState<{ success: boolean; message: string } | null>(null);
  
  if (!application) return null;
  
  const checklistStats = getChecklistStats(application.id);
  const refundablePayments = application.payments.filter(p => p.status === 'paid' || p.status === 'partially_refunded');
  const hasRefundablePayments = refundablePayments.length > 0;
  
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
  
  const openRefundModal = (payment: ApplicationPayment) => {
    setSelectedPayment(payment);
    setRefundType('full');
    setRefundAmount('');
    setRefundReason(application.status === 'rejected' ? 'application_rejected' : '');
    setRefundNotes('');
    setRefundStep('form');
    setRefundResult(null);
    setRefundModalOpen(true);
  };
  
  const closeRefundModal = () => {
    setRefundModalOpen(false);
    setSelectedPayment(null);
  };
  
  const getEffectiveRefundAmount = () => {
    if (!selectedPayment) return 0;
    const availableAmount = selectedPayment.amount - selectedPayment.refundedAmount;
    return refundType === 'full' ? availableAmount : (parseFloat(refundAmount) || 0);
  };
  
  const canProceedRefund = () => {
    if (!refundReason) return false;
    if (refundType === 'partial') {
      const amt = parseFloat(refundAmount);
      const available = selectedPayment ? selectedPayment.amount - selectedPayment.refundedAmount : 0;
      if (!amt || amt <= 0 || amt > available) return false;
    }
    return true;
  };
  
  const handleRefundConfirm = async () => {
    if (!selectedPayment) return;
    setIsRefunding(true);
    const result = await refundPayment(
      application.id,
      selectedPayment.id,
      getEffectiveRefundAmount(),
      REFUND_REASONS.find(r => r.value === refundReason)?.label || refundReason
    );
    setRefundResult(result);
    setRefundStep('result');
    setIsRefunding(false);
    
    if (result.success) {
      toast({ title: 'Refund Processed', description: `$${getEffectiveRefundAmount().toLocaleString()} refunded successfully.` });
    }
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
              <TabsTrigger value="payments" className="gap-2">
                <CreditCard className="h-4 w-4" />Payments
                {application.payments.length > 0 && (
                  <Badge variant="outline" className="ml-1 text-xs">{application.payments.length}</Badge>
                )}
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
                
                {/* Progress Checklist - Admin-controlled */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Progress Checklist</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Application Details Completed */}
                    <div className="flex items-center gap-3">
                      {application.applicant.email && application.applicant.name ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={`text-sm ${application.applicant.email ? '' : 'text-muted-foreground'}`}>
                        Application Details Completed
                      </span>
                    </div>
                    
                    {/* Documents Uploaded */}
                    <div className="flex items-center gap-3">
                      {checklistStats.uploaded > 0 ? (
                        checklistStats.uploaded === checklistStats.total ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <Clock className="h-4 w-4 text-warning" />
                        )
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={`text-sm ${checklistStats.uploaded > 0 ? '' : 'text-muted-foreground'}`}>
                        Documents Uploaded ({checklistStats.uploaded}/{checklistStats.total})
                      </span>
                    </div>
                    
                    {/* Screening Done (Manual) */}
                    <div className="flex items-center gap-3">
                      {application.screeningPassed ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : checklistStats.verified > 0 ? (
                        <Clock className="h-4 w-4 text-warning" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={`text-sm ${application.screeningPassed ? '' : checklistStats.verified > 0 ? '' : 'text-muted-foreground'}`}>
                        Screening Done (Manual)
                      </span>
                    </div>
                    
                    {/* Approved for Lease */}
                    <div className="flex items-center gap-3">
                      {application.status === 'approved' || application.status === 'ready_to_sign' || application.status === 'sent_for_signature' || application.status === 'signed' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : application.screeningPassed ? (
                        <Clock className="h-4 w-4 text-warning" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={`text-sm ${application.approvedAt ? '' : 'text-muted-foreground'}`}>
                        Approved for Lease
                      </span>
                    </div>
                    
                    {/* Lease Sent for Signature */}
                    <div className="flex items-center gap-3">
                      {application.esign.status === 'sent' || application.esign.status === 'signed' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : application.lease ? (
                        <Clock className="h-4 w-4 text-warning" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={`text-sm ${application.esign.status !== 'not_sent' ? '' : 'text-muted-foreground'}`}>
                        Lease Sent for Signature
                      </span>
                    </div>
                    
                    {/* Lease Signed */}
                    <div className="flex items-center gap-3">
                      {application.status === 'signed' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : application.esign.status === 'sent' ? (
                        <Clock className="h-4 w-4 text-warning" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={`text-sm ${application.status === 'signed' ? '' : 'text-muted-foreground'}`}>
                        Lease Signed
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
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
                    {application.rejectedAt && (
                      <div className="flex items-center gap-3">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm">Rejected: {new Date(application.rejectedAt).toLocaleDateString()}</span>
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
              
              {/* Payments Tab */}
              <TabsContent value="payments" className="mt-0 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Payment History</CardTitle>
                      {application.status === 'rejected' && hasRefundablePayments && (
                        <Badge className="bg-warning/10 text-warning">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Refunds Available
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {application.payments.length === 0 ? (
                      <div className="text-center py-6">
                        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No payments recorded</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {application.payments.map((payment) => {
                          const availableForRefund = payment.amount - payment.refundedAmount;
                          const canRefund = (payment.status === 'paid' || payment.status === 'partially_refunded') && availableForRefund > 0;
                          
                          return (
                            <div key={payment.id} className="p-4 rounded-lg border">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                    payment.status === 'refunded' ? 'bg-amber-500/10' :
                                    payment.status === 'partially_refunded' ? 'bg-warning/10' :
                                    'bg-success/10'
                                  }`}>
                                    {payment.method === 'Card' ? (
                                      <CreditCard className={`h-5 w-5 ${
                                        payment.status === 'refunded' ? 'text-amber-500' :
                                        payment.status === 'partially_refunded' ? 'text-warning' :
                                        'text-success'
                                      }`} />
                                    ) : (
                                      <Building2 className={`h-5 w-5 ${
                                        payment.status === 'refunded' ? 'text-amber-500' :
                                        payment.status === 'partially_refunded' ? 'text-warning' :
                                        'text-success'
                                      }`} />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{getPaymentTypeLabel(payment.type)}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {payment.method} • {new Date(payment.paidAt).toLocaleDateString()}
                                    </p>
                                    {payment.status === 'refunded' && payment.refundedAt && (
                                      <p className="text-xs text-amber-600 mt-1">
                                        Refunded on {new Date(payment.refundedAt).toLocaleDateString()}
                                        {payment.refundReason && ` - ${payment.refundReason}`}
                                      </p>
                                    )}
                                    {payment.status === 'partially_refunded' && (
                                      <p className="text-xs text-warning mt-1">
                                        ${payment.refundedAmount.toLocaleString()} refunded • ${availableForRefund.toLocaleString()} remaining
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`font-mono font-bold ${
                                    payment.status === 'refunded' ? 'line-through text-muted-foreground' : ''
                                  }`}>
                                    ${payment.amount.toLocaleString()}
                                  </p>
                                  <Badge 
                                    variant="outline" 
                                    className={`mt-1 ${
                                      payment.status === 'refunded' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                      payment.status === 'partially_refunded' ? 'bg-warning/10 text-warning border-warning/20' :
                                      'bg-success/10 text-success border-success/20'
                                    }`}
                                  >
                                    {payment.status === 'paid' ? 'Paid' :
                                     payment.status === 'refunded' ? 'Refunded' :
                                     'Partial Refund'}
                                  </Badge>
                                </div>
                              </div>
                              
                              {canRefund && (
                                <div className="mt-3 pt-3 border-t">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                                    onClick={() => openRefundModal(payment)}
                                  >
                                    <Undo2 className="h-4 w-4 mr-1" />
                                    Issue Refund
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Payment Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Collected</span>
                        <span className="font-mono">${application.payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Refunded</span>
                        <span className="font-mono text-amber-600">-${application.payments.reduce((sum, p) => sum + p.refundedAmount, 0).toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Net Amount</span>
                        <span className="font-mono">
                          ${(application.payments.reduce((sum, p) => sum + p.amount - p.refundedAmount, 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
      
      {/* Refund Modal */}
      <Dialog open={refundModalOpen} onOpenChange={closeRefundModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Undo2 className="h-5 w-5 text-amber-500" />
              {refundStep === 'form' && 'Issue Refund'}
              {refundStep === 'confirm' && 'Confirm Refund'}
              {refundStep === 'result' && (refundResult?.success ? 'Refund Processed' : 'Refund Failed')}
            </DialogTitle>
            <DialogDescription>
              {refundStep === 'form' && `Refund ${getPaymentTypeLabel(selectedPayment?.type || '')}`}
              {refundStep === 'confirm' && 'Review and confirm the refund details'}
              {refundStep === 'result' && refundResult?.message}
            </DialogDescription>
          </DialogHeader>
          
          {refundStep === 'form' && selectedPayment && (
            <div className="space-y-4 py-4">
              {/* Payment Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Type</span>
                  <span className="font-medium">{getPaymentTypeLabel(selectedPayment.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Amount</span>
                  <span className="font-mono font-bold">${selectedPayment.amount.toLocaleString()}</span>
                </div>
                {selectedPayment.refundedAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Already Refunded</span>
                    <span className="font-mono text-amber-600">-${selectedPayment.refundedAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available for Refund</span>
                  <span className="font-mono font-bold">${(selectedPayment.amount - selectedPayment.refundedAmount).toLocaleString()}</span>
                </div>
              </div>
              
              {/* Refund Type */}
              <div className="space-y-3">
                <Label>Refund Type</Label>
                <RadioGroup value={refundType} onValueChange={(v) => setRefundType(v as 'full' | 'partial')}>
                  <div 
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${refundType === 'full' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setRefundType('full')}
                  >
                    <RadioGroupItem value="full" id="full" />
                    <div className="flex-1">
                      <Label htmlFor="full" className="font-medium cursor-pointer">Full Refund</Label>
                      <p className="text-sm text-muted-foreground">Refund the entire available amount</p>
                    </div>
                    <span className="font-mono font-bold">${(selectedPayment.amount - selectedPayment.refundedAmount).toLocaleString()}</span>
                  </div>
                  <div 
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${refundType === 'partial' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setRefundType('partial')}
                  >
                    <RadioGroupItem value="partial" id="partial" />
                    <div className="flex-1">
                      <Label htmlFor="partial" className="font-medium cursor-pointer">Partial Refund</Label>
                      <p className="text-sm text-muted-foreground">Refund a specific amount</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Partial Amount */}
              {refundType === 'partial' && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Refund Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-7"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      max={selectedPayment.amount - selectedPayment.refundedAmount}
                    />
                  </div>
                  {parseFloat(refundAmount) > (selectedPayment.amount - selectedPayment.refundedAmount) && (
                    <p className="text-sm text-destructive">Amount cannot exceed available balance</p>
                  )}
                </div>
              )}
              
              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select refund reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFUND_REASONS.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional details..."
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  rows={2}
                />
              </div>
              
              {/* Warning */}
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-700">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                <p className="text-sm">
                  Refunds will be processed to the original payment method. The applicant will be notified.
                </p>
              </div>
            </div>
          )}
          
          {refundStep === 'confirm' && selectedPayment && (
            <div className="space-y-4 py-4">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span>{getPaymentTypeLabel(selectedPayment.type)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Refund Amount</span>
                  <span className="font-mono font-bold text-amber-600">-${getEffectiveRefundAmount().toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason</span>
                  <span>{REFUND_REASONS.find(r => r.value === refundReason)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination</span>
                  <div className="flex items-center gap-1">
                    {selectedPayment.method === 'Card' ? <CreditCard className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                    <span>Original {selectedPayment.method}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                <p className="text-sm">
                  This will issue a refund of ${getEffectiveRefundAmount().toLocaleString()} to {application.applicant.name}. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          )}
          
          {refundStep === 'result' && (
            <div className="py-8 text-center">
              {refundResult?.success ? (
                <div className="space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">-${getEffectiveRefundAmount().toLocaleString()}</p>
                    <p className="text-muted-foreground">Refund processed successfully</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    <p>The applicant has been notified and the refund will appear in their billing history.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-muted-foreground">{refundResult?.message}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {refundStep === 'form' && (
              <>
                <Button variant="outline" onClick={closeRefundModal}>Cancel</Button>
                <Button onClick={() => setRefundStep('confirm')} disabled={!canProceedRefund()} className="bg-amber-500 hover:bg-amber-600">
                  Continue
                </Button>
              </>
            )}
            {refundStep === 'confirm' && (
              <>
                <Button variant="outline" onClick={() => setRefundStep('form')}>Back</Button>
                <Button onClick={handleRefundConfirm} disabled={isRefunding} className="bg-amber-500 hover:bg-amber-600">
                  {isRefunding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Confirm Refund $${getEffectiveRefundAmount().toLocaleString()}`
                  )}
                </Button>
              </>
            )}
            {refundStep === 'result' && (
              <Button onClick={closeRefundModal} className="w-full">
                {refundResult?.success ? 'Done' : 'Close'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
