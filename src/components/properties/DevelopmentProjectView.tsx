import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Landmark, Coins, Banknote, FileText, ClipboardCheck,
  TrendingUp, BarChart3, Users, Award, KeyRound, Repeat, Wallet,
  Receipt, Truck, FolderOpen,
  Construction, Plus
} from 'lucide-react';

export interface DevelopmentProject {
  entity_llc?: string;
  phase?: 'Preconstruction' | 'Construction' | 'Closeout';
  current_stage_index?: number; // 0..12
  start_date?: string;
  target_co_date?: string;
  total_budget?: number;
  total_committed?: number;
  total_actual?: number;
  total_paid?: number;
  equity_raised?: number;
  loan_amount?: number;
  loan_drawn?: number;
  general_contractor?: string;
  architect?: string;
  lender?: string;
}

const LIFECYCLE_STAGES = [
  { label: 'Land Purchase', icon: Landmark },
  { label: 'Equity Raise', icon: Coins },
  { label: 'Construction Loan', icon: Banknote },
  { label: 'Monthly Draw Requests', icon: FileText },
  { label: 'Bank Inspections', icon: ClipboardCheck },
  { label: 'Loan Advances', icon: Wallet },
  { label: 'Cost Tracking', icon: Receipt },
  { label: 'Budget vs Actual', icon: BarChart3 },
  { label: 'Investor Reporting', icon: TrendingUp },
  { label: 'Certificate of Occupancy', icon: Award },
  { label: 'Lease-Up / Sales', icon: KeyRound },
  { label: 'Refinance or Sale', icon: Repeat },
  { label: 'Investor Distribution', icon: Users },
];

interface Props {
  project: DevelopmentProject;
  propertyName: string;
  onConvertToOperating?: () => void;
}

export default function DevelopmentProjectView({ project, propertyName, onConvertToOperating }: Props) {
  const currentIdx = project.current_stage_index ?? 0;
  const pctComplete = Math.round(((currentIdx + 1) / LIFECYCLE_STAGES.length) * 100);
  const budget = project.total_budget ?? 0;
  const actual = project.total_actual ?? 0;
  const variance = budget - actual;
  const variancePct = budget > 0 ? Math.round((variance / budget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Phase + KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-muted border-border">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Phase</p>
            <p className="text-sm font-semibold text-foreground mt-1">{project.phase ?? '—'}</p>
            <Badge variant="secondary" className="mt-1 text-[10px]">{pctComplete}% complete</Badge>
          </CardContent>
        </Card>
        <Card className="bg-muted border-border">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Total Budget</p>
            <p className="text-sm font-semibold text-foreground mt-1">${budget.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Actual ${actual.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted border-border">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Variance</p>
            <p className={`text-sm font-semibold mt-1 ${variance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              ${Math.abs(variance).toLocaleString()} {variance >= 0 ? 'under' : 'over'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">{variancePct}% of budget</p>
          </CardContent>
        </Card>
        <Card className="bg-muted border-border">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Loan Drawn</p>
            <p className="text-sm font-semibold text-foreground mt-1">
              ${(project.loan_drawn ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              of ${(project.loan_amount ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lifecycle Stepper */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Construction className="h-4 w-4 text-primary" /> Development Lifecycle
            </h4>
            <Badge variant="outline" className="text-xs">
              Stage {currentIdx + 1} of {LIFECYCLE_STAGES.length}
            </Badge>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="flex items-start gap-1 min-w-max">
              {LIFECYCLE_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const completed = idx < currentIdx;
                const active = idx === currentIdx;
                return (
                  <div key={stage.label} className="flex items-start">
                    <div className="flex flex-col items-center w-24">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          active
                            ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30'
                            : completed
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500'
                            : 'bg-muted border-border text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <p
                        className={`text-[10px] text-center mt-1.5 leading-tight ${
                          active ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {stage.label}
                      </p>
                    </div>
                    {idx < LIFECYCLE_STAGES.length - 1 && (
                      <div
                        className={`h-0.5 w-4 mt-5 ${
                          idx < currentIdx ? 'bg-emerald-500' : 'bg-border'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Tabs (skeleton) */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-6 bg-muted">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Project</TabsTrigger>
          <TabsTrigger value="budget" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Budget</TabsTrigger>
          <TabsTrigger value="draws" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Draws</TabsTrigger>
          <TabsTrigger value="vendors" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Vendors</TabsTrigger>
          <TabsTrigger value="investors" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Investors</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Docs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-3">
          <Card className="bg-muted border-border">
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Project Name" value={propertyName} />
                <Field label="Entity / LLC" value={project.entity_llc} />
                <Field label="General Contractor" value={project.general_contractor} />
                <Field label="Architect" value={project.architect} />
                <Field label="Lender" value={project.lender} />
                <Field label="Phase" value={project.phase} />
                <Field label="Start Date" value={project.start_date} />
                <Field label="Target CO Date" value={project.target_co_date} />
              </div>
            </CardContent>
          </Card>
          {currentIdx >= 9 && onConvertToOperating && (
            <Button onClick={onConvertToOperating} className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
              <KeyRound className="h-4 w-4 mr-2" /> Convert to Operating Property
            </Button>
          )}
        </TabsContent>

        <TabsContent value="budget" className="mt-4">
          <SkeletonPanel
            icon={BarChart3}
            title="Cost Code Budget"
            desc="Hierarchical budget tracking across 12 cost categories (A–L): Pre-Development, Soft Costs, Hard Costs (CSI divisions), Labor, Equipment, Insurance, Overhead, Financing, Change Orders, Closeout, Operations, Misc."
            chips={['Soft vs Hard', 'CapEx vs OpEx', 'Budget vs Actual', 'Retainage', 'Committed Cost', 'Funding Source']}
            cta="Build Cost Code Tree"
          />
        </TabsContent>

        <TabsContent value="draws" className="mt-4">
          <SkeletonPanel
            icon={Banknote}
            title="Monthly Draw Requests"
            desc="Create and submit construction loan draw packages. Tracks bank inspections, advance dates, retainage, and per-line-item draw eligibility."
            chips={['Draw #', 'Requested', 'Approved', 'Inspector', 'Advance Date', 'Lien Waivers']}
            cta="Create First Draw Request"
          />
        </TabsContent>

        <TabsContent value="vendors" className="mt-4">
          <SkeletonPanel
            icon={Truck}
            title="Vendors, POs & Subcontracts"
            desc="Manage commitments, purchase orders, subcontracts, change orders, and retainage release per vendor."
            chips={['Subcontract', 'PO', 'Change Order', 'Retainage Held', 'Compliance (W9, COI)']}
            cta="Add Vendor / Commitment"
          />
        </TabsContent>

        <TabsContent value="investors" className="mt-4">
          <SkeletonPanel
            icon={Users}
            title="Equity & Investor Reporting"
            desc="Track capital raised, capital calls, preferred returns, distributions waterfall, and per-investor statements."
            chips={['Equity Raise', 'Capital Call', 'Pref Return', 'Distribution', 'Waterfall']}
            cta="Add Investor"
          />
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <SkeletonPanel
            icon={FolderOpen}
            title="Project Documents"
            desc="Centralized storage for plans, permits, contracts, inspection reports, lien waivers, CO certificates, and as-builts."
            chips={['Plans', 'Permits', 'Contracts', 'Inspections', 'CO Certificate', 'As-Builts']}
            cta="Upload Document"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className="text-sm text-foreground font-medium mt-0.5">{value ?? '—'}</p>
    </div>
  );
}

function SkeletonPanel({
  icon: Icon,
  title,
  desc,
  chips,
  cta,
}: {
  icon: any;
  title: string;
  desc: string;
  chips: string[];
  cta: string;
}) {
  return (
    <Card className="bg-muted border-border border-dashed">
      <CardContent className="p-6 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">{desc}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {chips.map((c) => (
            <Badge key={c} variant="secondary" className="text-[10px]">
              {c}
            </Badge>
          ))}
        </div>
        <Badge variant="outline" className="text-[10px]">Under Construction · Coming Next</Badge>
        <div>
          <Button variant="outline" size="sm" disabled className="border-border">
            <Plus className="h-3 w-3 mr-1" /> {cta}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
