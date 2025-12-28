import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Link2,
  UserPlus,
  Users,
  ArrowRight,
  ArrowLeft,
  Copy,
  Mail,
  Check,
  Building2,
  DoorOpen,
  Search,
  Phone,
  DollarSign,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import propertiesData from '@/data/properties.json';
import leadsData from '@/data/leads.json';
import { mockUnits } from '@/data/unitsData';

type CreationMethod = 'invite' | 'manual' | 'convert';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  leadScore: number;
}

interface NewApplicationData {
  method: CreationMethod;
  applicantName: string;
  email: string;
  phone: string;
  propertyId: string;
  unitId: string;
  monthlyRent: number;
  note: string;
  leadId: string | null;
}

interface NewApplicationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateApplication: (data: NewApplicationData) => void;
}

export function NewApplicationDrawer({
  open,
  onOpenChange,
  onCreateApplication,
}: NewApplicationDrawerProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<CreationMethod | null>(null);
  const [leadSearch, setLeadSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    propertyId: '',
    unitId: '',
    monthlyRent: 0,
    note: '',
  });

  const properties = propertiesData as Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  }>;

  const leads = leadsData as Lead[];

  const filteredLeads = leads.filter(
    (lead) =>
      lead.status !== 'applied' &&
      (lead.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
        lead.email.toLowerCase().includes(leadSearch.toLowerCase()))
  );

  const availableUnits = formData.propertyId
    ? mockUnits.filter(
        (u) =>
          u.property_id === formData.propertyId.replace('prop-', 'PROP_00') ||
          u.property_id === formData.propertyId.toUpperCase().replace('PROP-', 'PROP_00') ||
          // Try matching by property index
          properties.findIndex((p) => p.id === formData.propertyId) ===
            parseInt(u.property_id.replace('PROP_00', '')) - 1
      )
    : [];

  // Also get vacant units from actual property IDs
  const getUnitsForProperty = (propId: string) => {
    const propIndex = properties.findIndex((p) => p.id === propId);
    if (propIndex === -1) return [];
    const mockPropId = `PROP_00${propIndex + 1}`;
    return mockUnits.filter(
      (u) => u.property_id === mockPropId && (u.status === 'vacant' || u.status === 'notice' || u.status === 'reserved')
    );
  };

  const unitsForProperty = formData.propertyId ? getUnitsForProperty(formData.propertyId) : [];

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);
  const selectedUnit = unitsForProperty.find((u) => u.id === formData.unitId);

  const handleMethodSelect = (selectedMethod: CreationMethod) => {
    setMethod(selectedMethod);
    setFormData({
      applicantName: '',
      email: '',
      phone: '',
      propertyId: '',
      unitId: '',
      monthlyRent: 0,
      note: '',
    });
    setSelectedLead(null);
  };

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      ...formData,
      applicantName: lead.name,
      email: lead.email,
      phone: lead.phone,
    });
  };

  const handlePropertyChange = (propertyId: string) => {
    setFormData({
      ...formData,
      propertyId,
      unitId: '',
      monthlyRent: 0,
    });
  };

  const handleUnitChange = (unitId: string) => {
    const unit = unitsForProperty.find((u) => u.id === unitId);
    setFormData({
      ...formData,
      unitId,
      monthlyRent: unit?.market_rent || 0,
    });
  };

  const generateApplicationLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/apply/${formData.propertyId}/${formData.unitId}?ref=invite`;
  };

  const copyLink = async () => {
    const link = generateApplicationLink();
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast({
      title: 'Link copied',
      description: 'Application link copied to clipboard',
    });
  };

  const sendEmailInvite = () => {
    toast({
      title: 'Invitation sent',
      description: `Application invitation sent to ${formData.email}`,
    });
  };

  const canProceedToStep2 = () => {
    if (!method) return false;
    if (method === 'invite') {
      return formData.propertyId && formData.unitId;
    }
    if (method === 'manual') {
      return (
        formData.applicantName &&
        formData.email &&
        formData.propertyId &&
        formData.unitId
      );
    }
    if (method === 'convert') {
      return selectedLead && formData.propertyId && formData.unitId;
    }
    return false;
  };

  const handleCreate = () => {
    if (!method) return;
    onCreateApplication({
      method,
      applicantName: formData.applicantName,
      email: formData.email,
      phone: formData.phone,
      propertyId: formData.propertyId,
      unitId: formData.unitId,
      monthlyRent: formData.monthlyRent || selectedUnit?.market_rent || 0,
      note: formData.note,
      leadId: selectedLead?.id || null,
    });
    handleReset();
  };

  const handleReset = () => {
    setStep(1);
    setMethod(null);
    setFormData({
      applicantName: '',
      email: '',
      phone: '',
      propertyId: '',
      unitId: '',
      monthlyRent: 0,
      note: '',
    });
    setSelectedLead(null);
    setLeadSearch('');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full">
        <SheetHeader>
          <SheetTitle>Create New Application</SheetTitle>
          <SheetDescription>
            {step === 1
              ? 'Choose how you want to create this application'
              : 'Review and confirm application details'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          {step === 1 && (
            <div className="space-y-6">
              {/* Method Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Application Type</Label>
                <div className="grid gap-3">
                  {/* Invite Tenant */}
                  <Card
                    className={`cursor-pointer transition-all hover:border-primary ${
                      method === 'invite' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleMethodSelect('invite')}
                  >
                    <CardContent className="p-4 flex items-start gap-4">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          method === 'invite'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <Link2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Invite Tenant to Apply</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Generate a shareable application link. Tenant completes the
                          application themselves.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Manual Entry */}
                  <Card
                    className={`cursor-pointer transition-all hover:border-primary ${
                      method === 'manual' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleMethodSelect('manual')}
                  >
                    <CardContent className="p-4 flex items-start gap-4">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          method === 'manual'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Create Application Manually</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Enter applicant details directly. Admin manages progress
                          manually.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Convert Lead */}
                  <Card
                    className={`cursor-pointer transition-all hover:border-primary ${
                      method === 'convert' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleMethodSelect('convert')}
                  >
                    <CardContent className="p-4 flex items-start gap-4">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          method === 'convert'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Convert Existing Lead</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Select a lead from CRM and convert to application.
                          Auto-fills contact info.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Method-specific forms */}
              {method && (
                <div className="space-y-4 pt-4 border-t">
                  {/* Convert Lead - Lead Selection */}
                  {method === 'convert' && (
                    <div className="space-y-3">
                      <Label>Select Lead</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search leads by name or email..."
                          value={leadSearch}
                          onChange={(e) => setLeadSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <ScrollArea className="h-[200px] border rounded-lg">
                        <div className="p-2 space-y-2">
                          {filteredLeads.map((lead) => (
                            <div
                              key={lead.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedLead?.id === lead.id
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:bg-accent'
                              }`}
                              onClick={() => handleLeadSelect(lead)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{lead.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {lead.email}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    Score: {lead.leadScore}
                                  </Badge>
                                  {selectedLead?.id === lead.id && (
                                    <Check className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {filteredLeads.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-4">
                              No leads found
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Manual Entry - Applicant Details */}
                  {method === 'manual' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Applicant Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter full name"
                          value={formData.applicantName}
                          onChange={(e) =>
                            setFormData({ ...formData, applicantName: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Property & Unit Selection (all methods) */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Property *
                      </Label>
                      <Select
                        value={formData.propertyId}
                        onValueChange={handlePropertyChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((prop) => (
                            <SelectItem key={prop.id} value={prop.id}>
                              {prop.name} - {prop.city}, {prop.state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.propertyId && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <DoorOpen className="h-4 w-4" />
                          Unit *
                        </Label>
                        <Select
                          value={formData.unitId}
                          onValueChange={handleUnitChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {unitsForProperty.length > 0 ? (
                              unitsForProperty.map((unit) => (
                                <SelectItem key={unit.id} value={unit.id}>
                                  Unit {unit.unit_number} - {unit.bedrooms}BR/{unit.bathrooms}BA -
                                  ${unit.market_rent.toLocaleString()}/mo
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="new" disabled>
                                No available units
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.unitId && selectedUnit && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Monthly Rent
                        </Label>
                        <Input
                          type="number"
                          value={formData.monthlyRent || selectedUnit.market_rent}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              monthlyRent: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Invite Method - Link Generation */}
                  {method === 'invite' && formData.propertyId && formData.unitId && (
                    <div className="space-y-3 pt-2">
                      <Label>Application Link</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={generateApplicationLink()}
                          className="font-mono text-xs"
                        />
                        <Button variant="outline" size="icon" onClick={copyLink}>
                          {linkCopied ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="Enter tenant email to send invite"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={sendEmailInvite}
                          disabled={!formData.email}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Note Field */}
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="note">Note (optional)</Label>
                    <Textarea
                      id="note"
                      placeholder="Add any notes about this application..."
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Application Type
                    </span>
                    <Badge>
                      {method === 'invite'
                        ? 'Invite to Apply'
                        : method === 'manual'
                        ? 'Manual Entry'
                        : 'Lead Conversion'}
                    </Badge>
                  </div>

                  {(method === 'manual' || method === 'convert') && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Applicant
                        </span>
                        <span className="font-medium">{formData.applicantName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="font-medium">{formData.email}</span>
                      </div>
                      {formData.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Phone</span>
                          <span className="font-medium">{formData.phone}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Property</span>
                    <span className="font-medium">{selectedProperty?.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Unit</span>
                    <span className="font-medium">
                      Unit {selectedUnit?.unit_number}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Monthly Rent
                    </span>
                    <span className="font-medium">
                      $
                      {(
                        formData.monthlyRent || selectedUnit?.market_rent || 0
                      ).toLocaleString()}
                      /mo
                    </span>
                  </div>

                  {selectedLead && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Linked Lead
                      </span>
                      <Badge variant="outline">{selectedLead.name}</Badge>
                    </div>
                  )}

                  {formData.note && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Note</span>
                      <p className="text-sm mt-1">{formData.note}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">What happens next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Application will be created in "Pending Review" status</li>
                  {method === 'invite' && (
                    <li>• Tenant will complete checklist via the shared link</li>
                  )}
                  {method === 'manual' && (
                    <li>• Admin will manage document collection manually</li>
                  )}
                  {method === 'convert' && (
                    <li>• Lead will be linked to the application for tracking</li>
                  )}
                  <li>• Application will appear in the Applications list</li>
                </ul>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t mt-4">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2()}
              >
                Review
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleCreate}>Create Application</Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
