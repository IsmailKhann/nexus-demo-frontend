import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  useApplicationsStore,
  CHECKLIST_LABELS,
  MANUAL_CHECKS,
  type Application,
  type ChecklistItemStatus,
} from '@/hooks/useApplicationsStore';
import {
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Eye,
  MoreHorizontal,
  FileText,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Download,
} from 'lucide-react';

interface ScreeningTabProps {
  application: Application;
  onGenerateLease: () => void;
}

const getStatusBadge = (status: ChecklistItemStatus) => {
  switch (status) {
    case 'verified':
      return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
    case 'uploaded':
      return <Badge className="bg-info/10 text-info border-info/20"><Clock className="h-3 w-3 mr-1" />Uploaded</Badge>;
    case 'rejected':
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge variant="outline" className="text-muted-foreground"><Upload className="h-3 w-3 mr-1" />Missing</Badge>;
  }
};

export const ScreeningTab = ({ application, onGenerateLease }: ScreeningTabProps) => {
  const { toast } = useToast();
  const { verifyDocument, rejectDocument, requestMoreInfo, toggleManualCheck, markScreeningPassed, addNote } = useApplicationsStore();
  
  const [rejectModal, setRejectModal] = useState<{ open: boolean; checklistKey: string }>({ open: false, checklistKey: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [requestInfoModal, setRequestInfoModal] = useState<{ open: boolean; checklistKey: string }>({ open: false, checklistKey: '' });
  const [requestMessage, setRequestMessage] = useState('');
  const [manualCheckNote, setManualCheckNote] = useState('');
  const [noteText, setNoteText] = useState('');
  const [previewDoc, setPreviewDoc] = useState<{ open: boolean; doc: any }>({ open: false, doc: null });
  
  const checklistEntries = Object.entries(application.checklist) as [string, typeof application.checklist.id_front][];
  const uploadedCount = checklistEntries.filter(([, item]) => item.status === 'uploaded' || item.status === 'verified').length;
  const verifiedCount = checklistEntries.filter(([, item]) => item.status === 'verified').length;
  
  const manualChecksComplete = MANUAL_CHECKS.every(check => application.manualChecks[check.key]?.completed);
  const allDocsVerified = verifiedCount === checklistEntries.length;
  const canPassScreening = allDocsVerified && manualChecksComplete;
  
  const handleVerify = (checklistKey: string) => {
    verifyDocument(application.id, checklistKey, 'Admin User');
    toast({ title: 'Document Verified', description: `${CHECKLIST_LABELS[checklistKey]} has been verified.` });
  };
  
  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast({ title: 'Reason Required', description: 'Please provide a rejection reason.', variant: 'destructive' });
      return;
    }
    rejectDocument(application.id, rejectModal.checklistKey, rejectReason, 'Admin User');
    toast({ title: 'Document Rejected', description: 'The tenant has been notified.' });
    setRejectModal({ open: false, checklistKey: '' });
    setRejectReason('');
  };
  
  const handleRequestInfo = () => {
    if (!requestMessage.trim()) {
      toast({ title: 'Message Required', description: 'Please provide a message.', variant: 'destructive' });
      return;
    }
    requestMoreInfo(application.id, requestInfoModal.checklistKey, requestMessage);
    toast({ title: 'Request Sent', description: 'The tenant has been notified to provide more information.' });
    setRequestInfoModal({ open: false, checklistKey: '' });
    setRequestMessage('');
  };
  
  const handleManualCheck = (checkKey: string) => {
    toggleManualCheck(application.id, checkKey, manualCheckNote);
    setManualCheckNote('');
  };
  
  const handlePassScreening = () => {
    markScreeningPassed(application.id);
    toast({ title: 'Screening Passed', description: 'Application has been approved. You can now generate the lease.' });
  };
  
  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addNote(application.id, noteText);
    setNoteText('');
    toast({ title: 'Note Added', description: 'Your note has been saved.' });
  };
  
  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-6 pr-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold">{uploadedCount}/{checklistEntries.length}</p>
              <p className="text-xs text-muted-foreground">Docs Uploaded</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-success">{verifiedCount}/{checklistEntries.length}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold">{MANUAL_CHECKS.filter(c => application.manualChecks[c.key]?.completed).length}/{MANUAL_CHECKS.length}</p>
              <p className="text-xs text-muted-foreground">Manual Checks</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Document Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Document Checklist</CardTitle>
            <CardDescription>Review and verify uploaded documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {checklistEntries.map(([key, item]) => {
              const docs = application.documents.filter(d => d.checklistKey === key);
              return (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{CHECKLIST_LABELS[key]}</p>
                      {item.timestamp && (
                        <p className="text-xs text-muted-foreground">
                          {item.uploadedBy === 'tenant' ? 'Tenant' : 'Admin'} • {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      )}
                      {item.status === 'rejected' && item.rejectionReason && (
                        <p className="text-xs text-destructive mt-1">Reason: {item.rejectionReason}</p>
                      )}
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  
                  {item.status !== 'missing' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {docs.length > 0 && (
                          <DropdownMenuItem onClick={() => setPreviewDoc({ open: true, doc: docs[0] })}>
                            <Eye className="h-4 w-4 mr-2" />View Document
                          </DropdownMenuItem>
                        )}
                        {item.status === 'uploaded' && (
                          <>
                            <DropdownMenuItem onClick={() => handleVerify(key)} className="text-success">
                              <CheckCircle className="h-4 w-4 mr-2" />Mark Verified
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRejectModal({ open: true, checklistKey: key })} className="text-destructive">
                              <XCircle className="h-4 w-4 mr-2" />Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => setRequestInfoModal({ open: true, checklistKey: key })}>
                          <MessageSquare className="h-4 w-4 mr-2" />Request More Info
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
        
        {/* Manual Screening Checks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Manual Verification Checks</CardTitle>
            <CardDescription>Complete these checks before approving</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MANUAL_CHECKS.map(check => {
              const checkData = application.manualChecks[check.key];
              return (
                <div key={check.key} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Checkbox
                    id={check.key}
                    checked={checkData?.completed || false}
                    onCheckedChange={() => handleManualCheck(check.key)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={check.key} className="font-medium cursor-pointer">{check.label}</Label>
                    {checkData?.completed && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed by {checkData.completedBy} on {new Date(checkData.timestamp!).toLocaleDateString()}
                        {checkData.note && ` - ${checkData.note}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        
        {/* Documents Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Documents</CardTitle>
            <CardDescription>{application.documents.length} document(s) uploaded</CardDescription>
          </CardHeader>
          <CardContent>
            {application.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {application.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 rounded border text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{doc.name}</span>
                      <Badge variant="outline" className="text-xs">{doc.previewType.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{(doc.size / 1024).toFixed(1)} KB</span>
                      <Button variant="ghost" size="sm" onClick={() => setPreviewDoc({ open: true, doc })}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Notes Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Screening Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.notes.map(note => (
              <div key={note.id} className="p-3 rounded-lg bg-muted/50 text-sm">
                <p>{note.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{note.user} • {new Date(note.timestamp).toLocaleString()}</p>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Add a note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <Button variant="outline" onClick={handleAddNote}>Add</Button>
            </div>
          </CardContent>
        </Card>
        
        <Separator />
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          {!application.screeningPassed && canPassScreening && (
            <Button onClick={handlePassScreening} className="flex-1 bg-success hover:bg-success/90">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Mark Screening Passed
            </Button>
          )}
          {application.screeningPassed && !application.lease && (
            <Button onClick={onGenerateLease} className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Generate Lease
            </Button>
          )}
          {!canPassScreening && !application.screeningPassed && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Complete all verifications and manual checks to proceed
            </div>
          )}
        </div>
      </div>
      
      {/* Reject Modal */}
      <Dialog open={rejectModal.open} onOpenChange={(open) => setRejectModal({ ...rejectModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {CHECKLIST_LABELS[rejectModal.checklistKey]}. The tenant will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Reason for rejection (e.g., 'Document is blurry, please re-upload a clearer copy')"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModal({ open: false, checklistKey: '' })}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Request Info Modal */}
      <Dialog open={requestInfoModal.open} onOpenChange={(open) => setRequestInfoModal({ ...requestInfoModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request More Information</DialogTitle>
            <DialogDescription>
              Send a message to the tenant about {CHECKLIST_LABELS[requestInfoModal.checklistKey]}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Your message to the tenant..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestInfoModal({ open: false, checklistKey: '' })}>Cancel</Button>
            <Button onClick={handleRequestInfo}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Document Preview Modal */}
      <Dialog open={previewDoc.open} onOpenChange={(open) => setPreviewDoc({ ...previewDoc, open })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewDoc.doc?.name}</DialogTitle>
          </DialogHeader>
          <div className="min-h-[400px] flex items-center justify-center bg-muted rounded-lg">
            {previewDoc.doc?.previewType === 'image' ? (
              <img src={previewDoc.doc.url} alt={previewDoc.doc.name} className="max-w-full max-h-[400px] object-contain" />
            ) : (
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">PDF Preview</p>
                <Button variant="outline" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />Download PDF
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
};
