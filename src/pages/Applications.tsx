import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  PenTool,
  FileSignature,
  Search,
  Filter,
  Plus,
  Eye,
  Mail,
  Phone,
  DollarSign,
  Shield,
  ClipboardList,
  History,
} from 'lucide-react';
import { useApplicationsStore, type Application } from '@/hooks/useApplicationsStore';
import { ApplicationDetailPanel } from '@/components/applications/ApplicationDetailPanel';
import { NewApplicationDrawer } from '@/components/applications/NewApplicationDrawer';
import { toast } from '@/hooks/use-toast';

const Applications = () => {
  const { applications, auditLogs, getChecklistStats, createApplication } = useApplicationsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('applications');
  const [newAppDrawerOpen, setNewAppDrawerOpen] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      pending_review: 'bg-warning/10 text-warning',
      in_screening: 'bg-info/10 text-info',
      manual_review: 'bg-warning/10 text-warning',
      approved: 'bg-success/10 text-success',
      ready_to_sign: 'bg-primary/10 text-primary',
      sent_for_signature: 'bg-info/10 text-info',
      signed: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending_review: 'Pending Review',
      in_screening: 'In Screening',
      manual_review: 'Manual Review',
      ready_to_sign: 'Ready to Sign',
      sent_for_signature: 'Awaiting Signature',
      signed: 'Lease Signed',
    };
    return labels[status] || status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getScreeningStatusIcon = (app: Application) => {
    const stats = getChecklistStats(app.id);
    if (stats.verified === stats.total) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    } else if (stats.uploaded > 0) {
      return <Clock className="h-4 w-4 text-info" />;
    }
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDetail = (app: Application) => {
    setSelectedApp(app);
    setDetailPanelOpen(true);
  };

  const handleCreateApplication = (data: Parameters<typeof createApplication>[0]) => {
    const newAppId = createApplication(data);
    toast({
      title: 'Application created',
      description: `Application ${newAppId} created successfully`,
    });
    setNewAppDrawerOpen(false);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Online Leasing</h1>
          <p className="text-muted-foreground mt-1">
            Manage applications, screening, eSignatures, and lease generation
          </p>
        </div>
        <Button className="gap-2" onClick={() => setNewAppDrawerOpen(true)}>
          <Plus className="h-4 w-4" />
          New Application
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Applications</CardDescription>
            <CardTitle className="text-3xl">{applications.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-warning">
              {applications.filter(a => a.status === 'pending_review').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Screening</CardDescription>
            <CardTitle className="text-3xl text-info">
              {applications.filter(a => a.status === 'in_screening' || a.status === 'manual_review').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ready to Sign</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {applications.filter(a => a.status === 'ready_to_sign' || a.status === 'sent_for_signature').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Signed</CardDescription>
            <CardTitle className="text-3xl text-success">
              {applications.filter(a => a.status === 'signed').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications" className="gap-2">
            <FileText className="h-4 w-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="esignature" className="gap-2">
            <PenTool className="h-4 w-4" />
            eSignature Queue
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applicants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="in_screening">In Screening</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="ready_to_sign">Ready to Sign</SelectItem>
                      <SelectItem value="signed">Lease Signed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredApplications.map((app) => {
                  const checklistStats = getChecklistStats(app.id);
                  return (
                    <Card 
                      key={app.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleOpenDetail(app)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{app.applicant.name}</h3>
                              <Badge className={getStatusColor(app.status)}>
                                {getStatusLabel(app.status)}
                              </Badge>
                              {getScreeningStatusIcon(app)}
                              <Badge variant="outline" className="text-xs">
                                <ClipboardList className="h-3 w-3 mr-1" />
                                {checklistStats.verified}/{checklistStats.total} docs
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {app.applicant.email}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                {app.applicant.phone}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                ${app.monthlyIncome.toLocaleString()}/mo
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Shield className="h-4 w-4" />
                                Credit: {app.creditScore || 'Pending'}
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              Property: {app.property} • {app.unit}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(app);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {(app.status === 'ready_to_sign' || app.status === 'sent_for_signature') && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetail(app);
                                }}
                              >
                                <PenTool className="h-4 w-4 mr-1" />
                                E-Sign
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredApplications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No applications found matching your criteria
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* eSignature Tab */}
        <TabsContent value="esignature" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents Awaiting Signature</CardTitle>
              <CardDescription>Leases ready for tenant signature</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applications
                  .filter(app => app.status === 'ready_to_sign' || app.status === 'sent_for_signature')
                  .map((app) => (
                    <Card key={app.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileSignature className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{app.applicant.name} - Lease Agreement</h4>
                            <p className="text-sm text-muted-foreground">
                              {app.property} - {app.unit}
                            </p>
                            {app.esign.status === 'sent' && (
                              <p className="text-xs text-info mt-1">
                                Sent {app.esign.sentTimestamp && new Date(app.esign.sentTimestamp).toLocaleDateString()}
                                {app.esign.expiryDate && ` • Expires ${new Date(app.esign.expiryDate).toLocaleDateString()}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={app.esign.status === 'sent' ? 'bg-info/10 text-info' : 'bg-muted text-muted-foreground'}>
                            {app.esign.status === 'sent' ? 'Awaiting Signature' : 'Not Sent'}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => handleOpenDetail(app)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {app.esign.status === 'not_sent' && (
                            <Button size="sm" onClick={() => handleOpenDetail(app)}>
                              <PenTool className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {applications.filter(app => app.status === 'ready_to_sign' || app.status === 'sent_for_signature').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No documents awaiting signature
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Signed Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Signed Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applications
                  .filter(app => app.status === 'signed')
                  .map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <div>
                          <h4 className="font-medium text-sm">{app.applicant.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Signed on {app.esign.signedTimestamp && new Date(app.esign.signedTimestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                {applications.filter(app => app.status === 'signed').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No signed documents yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Complete history of all screening and leasing actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {log.action.includes('Verified') && <CheckCircle className="h-4 w-4 text-success" />}
                        {log.action.includes('Rejected') && <AlertCircle className="h-4 w-4 text-destructive" />}
                        {log.action.includes('Uploaded') && <Upload className="h-4 w-4 text-info" />}
                        {log.action.includes('Signed') && <PenTool className="h-4 w-4 text-primary" />}
                        {log.action.includes('Generated') && <FileText className="h-4 w-4 text-primary" />}
                        {log.action.includes('Sent') && <Mail className="h-4 w-4 text-info" />}
                        {!['Verified', 'Rejected', 'Uploaded', 'Signed', 'Generated', 'Sent'].some(a => log.action.includes(a)) && (
                          <History className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{log.action}</p>
                          <Badge variant="outline" className="text-xs">{log.target}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          by {log.actor} ({log.actorRole})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No audit log entries yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Detail Panel */}
      <ApplicationDetailPanel 
        application={selectedApp}
        open={detailPanelOpen}
        onOpenChange={setDetailPanelOpen}
      />

      {/* New Application Drawer */}
      <NewApplicationDrawer
        open={newAppDrawerOpen}
        onOpenChange={setNewAppDrawerOpen}
        onCreateApplication={handleCreateApplication}
      />
    </div>
  );
};

export default Applications;
