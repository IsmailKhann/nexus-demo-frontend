import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  UserCheck, 
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
  Edit
} from 'lucide-react';
import applicationsData from '@/data/applications.json';
import propertiesData from '@/data/properties.json';

interface Application {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  propertyId: string;
  unitId: string;
  status: string;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  leaseSigned?: string;
  monthlyIncome: number;
  creditScore: number | null;
  employmentStatus: string;
  pets: boolean;
  coApplicants: any[];
  documents: any[];
  screeningStatus: string;
  screeningNotes?: string;
  leaseStatus: string;
}

const Applications = () => {
  const [applications] = useState<Application[]>(applicationsData as Application[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState('applications');
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [showDocGenDialog, setShowDocGenDialog] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      pending_review: 'bg-warning/10 text-warning',
      screening: 'bg-info/10 text-info',
      manual_review: 'bg-warning/10 text-warning',
      approved: 'bg-success/10 text-success',
      lease_signed: 'bg-primary/10 text-primary',
      rejected: 'bg-destructive/10 text-destructive'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getScreeningStatusIcon = (status: string) => {
    switch (status) {
      case 'clear':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'manual_review':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-info" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const leaseTemplates = [
    { id: 'standard', name: 'Standard Residential Lease', duration: '12 months' },
    { id: 'short-term', name: 'Short-Term Lease', duration: '6 months' },
    { id: 'month-to-month', name: 'Month-to-Month Agreement', duration: 'Monthly' }
  ];

  const clauseLibrary = [
    { id: 'pets', name: 'Pet Policy', category: 'Pets' },
    { id: 'parking', name: 'Parking Rules', category: 'Parking' },
    { id: 'utilities', name: 'Utilities Responsibility', category: 'Utilities' },
    { id: 'maintenance', name: 'Maintenance Terms', category: 'Maintenance' },
    { id: 'sublease', name: 'Sublease Prohibition', category: 'Legal' },
    { id: 'renewal', name: 'Renewal Terms', category: 'Legal' }
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Online Leasing</h1>
          <p className="text-muted-foreground mt-1">
            Manage applications, eSignatures, and automated document generation
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Application
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl">
              {applications.filter(a => a.status === 'pending_review').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Screening</CardDescription>
            <CardTitle className="text-3xl">
              {applications.filter(a => a.status === 'screening' || a.status === 'manual_review').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ready to Sign</CardDescription>
            <CardTitle className="text-3xl">
              {applications.filter(a => a.leaseStatus === 'ready_to_sign').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Signed This Month</CardDescription>
            <CardTitle className="text-3xl">
              {applications.filter(a => a.status === 'lease_signed').length}
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
          <TabsTrigger value="templates" className="gap-2">
            <FileSignature className="h-4 w-4" />
            Templates & Clauses
          </TabsTrigger>
          <TabsTrigger value="esignature" className="gap-2">
            <PenTool className="h-4 w-4" />
            eSignature
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
                      <SelectItem value="screening">Screening</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="lease_signed">Lease Signed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredApplications.map((app) => {
                  const property = propertiesData.find(p => p.id === app.propertyId);
                  return (
                    <Card key={app.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{app.applicantName}</h3>
                              <Badge className={getStatusColor(app.status)}>
                                {getStatusLabel(app.status)}
                              </Badge>
                              {getScreeningStatusIcon(app.screeningStatus)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {app.email}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                {app.phone}
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
                              Property: {property?.name} • Unit: {app.unitId}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApp(app)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {app.leaseStatus === 'ready_to_sign' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setShowSignatureDialog(true);
                                }}
                              >
                                <PenTool className="h-4 w-4 mr-1" />
                                Sign Lease
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates & Clauses Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lease Templates</CardTitle>
                <CardDescription>Pre-built lease agreements ready for use</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaseTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.duration}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowDocGenDialog(true)}
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clause Library</CardTitle>
                <CardDescription>Standard clauses for lease customization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clauseLibrary.map((clause) => (
                    <div
                      key={clause.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-sm">{clause.name}</h4>
                        <p className="text-xs text-muted-foreground">{clause.category}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
                  .filter(app => app.leaseStatus === 'ready_to_sign')
                  .map((app) => (
                    <Card key={app.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileSignature className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{app.applicantName} - Lease Agreement</h4>
                            <p className="text-sm text-muted-foreground">
                              Property: {propertiesData.find(p => p.id === app.propertyId)?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setShowSignatureDialog(true);
                            }}
                          >
                            <PenTool className="h-4 w-4 mr-1" />
                            Request Signature
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {applications.filter(app => app.leaseStatus === 'ready_to_sign').length === 0 && (
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
                  .filter(app => app.status === 'lease_signed')
                  .map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <div>
                          <h4 className="font-medium text-sm">{app.applicantName}</h4>
                          <p className="text-xs text-muted-foreground">
                            Signed on {new Date(app.leaseSigned!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Generation Dialog */}
      <Dialog open={showDocGenDialog} onOpenChange={setShowDocGenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Lease Document</DialogTitle>
            <DialogDescription>
              Auto-fill lease agreement from application data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tenant Name</Label>
                <Input placeholder="Auto-filled from application" />
              </div>
              <div className="space-y-2">
                <Label>Property</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertiesData.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Rent</Label>
                <Input type="number" placeholder="$0.00" />
              </div>
              <div className="space-y-2">
                <Label>Security Deposit</Label>
                <Input type="number" placeholder="$0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lease Start Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Lease Duration</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Additional Clauses</Label>
              <div className="grid grid-cols-2 gap-2">
                {clauseLibrary.slice(0, 4).map(clause => (
                  <div key={clause.id} className="flex items-center space-x-2">
                    <input type="checkbox" id={clause.id} className="rounded" />
                    <label htmlFor={clause.id} className="text-sm cursor-pointer">
                      {clause.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setShowDocGenDialog(false)}>
                Cancel
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* eSignature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>eSignature - Lease Agreement</DialogTitle>
            <DialogDescription>
              Request signature from {selectedApp?.applicantName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Document Preview */}
            <div className="border rounded-lg p-6 bg-muted/30 min-h-[400px]">
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
                  <p><strong>Tenant:</strong> {selectedApp?.applicantName}</p>
                  <p><strong>Property:</strong> {propertiesData.find(p => p.id === selectedApp?.propertyId)?.address}</p>
                  <p><strong>Monthly Rent:</strong> $2,500.00</p>
                  <p><strong>Lease Term:</strong> 12 months</p>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>TERMS AND CONDITIONS</p>
                  <p>1. The tenant agrees to pay rent on the first day of each month...</p>
                  <p>2. Security deposit of one month's rent is required...</p>
                  <p>3. Tenant is responsible for utilities...</p>
                  <p className="italic">[Additional clauses and terms would appear here]</p>
                </div>
                
                {/* Signature Areas */}
                <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t">
                  <div className="space-y-2">
                    <Label>Landlord Signature</Label>
                    <div className="border-2 border-dashed rounded-lg h-24 flex items-center justify-center bg-background">
                      <PenTool className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Tenant Signature</Label>
                    <div className="border-2 border-primary border-dashed rounded-lg h-24 flex items-center justify-center bg-primary/5">
                      <div className="text-center">
                        <PenTool className="h-6 w-6 text-primary mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Click to sign</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Date: _____________</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSignatureDialog(false)}>
                Cancel
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Send for Signature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
