import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, Clock, DollarSign, AlertTriangle, Settings, 
  CheckCircle, Info, Percent, Save
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface LateFeeConfig {
  rentDueDay: number;
  gracePeriodDays: number;
  lateFeeEnabled: boolean;
  lateFeePercentage: number;
  applyOnce: boolean;
}

interface LateFeeConfigPanelProps {
  config: LateFeeConfig;
  onConfigChange: (config: LateFeeConfig) => void;
  onApplyLateFees: () => void;
  pendingLateFees: { invoiceId: string; tenant: string; amount: number; feeAmount: number }[];
}

export function LateFeeConfigPanel({
  config,
  onConfigChange,
  onApplyLateFees,
  pendingLateFees,
}: LateFeeConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (updates: Partial<LateFeeConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    setHasChanges(false);
    toast({
      title: 'Settings Saved',
      description: 'Rent payment rules have been updated',
    });
  };

  const dueDays = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Rent Due Date Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rent Payment Settings
          </CardTitle>
          <CardDescription>Configure when rent is due and grace period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rentDueDay">Rent Due Date</Label>
              <Select 
                value={String(localConfig.rentDueDay)} 
                onValueChange={(v) => handleChange({ rentDueDay: parseInt(v) })}
              >
                <SelectTrigger id="rentDueDay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dueDays.map(day => (
                    <SelectItem key={day} value={String(day)}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Day of month when rent invoices are generated</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gracePeriod">Grace Period (Days)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="gracePeriod"
                  type="number"
                  min={0}
                  max={15}
                  value={localConfig.gracePeriodDays}
                  onChange={(e) => handleChange({ gracePeriodDays: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">days after due date</span>
              </div>
              <p className="text-xs text-muted-foreground">No late fee applies during grace period</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Current Configuration</p>
              <p className="text-muted-foreground">
                Rent is due on the <strong>{localConfig.rentDueDay}{localConfig.rentDueDay === 1 ? 'st' : localConfig.rentDueDay === 2 ? 'nd' : localConfig.rentDueDay === 3 ? 'rd' : 'th'}</strong> of each month. 
                Late fees apply after <strong>{localConfig.gracePeriodDays} days</strong> grace period 
                (effective date: {localConfig.rentDueDay + localConfig.gracePeriodDays > 28 ? 'next month' : `the ${localConfig.rentDueDay + localConfig.gracePeriodDays}${(localConfig.rentDueDay + localConfig.gracePeriodDays) === 1 ? 'st' : (localConfig.rentDueDay + localConfig.gracePeriodDays) === 2 ? 'nd' : (localConfig.rentDueDay + localConfig.gracePeriodDays) === 3 ? 'rd' : 'th'}`}).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Late Fee Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Late Fee Settings
          </CardTitle>
          <CardDescription>Configure automatic late fee application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Late Fees</Label>
              <p className="text-sm text-muted-foreground">Automatically apply late fees after grace period</p>
            </div>
            <Switch
              checked={localConfig.lateFeeEnabled}
              onCheckedChange={(checked) => handleChange({ lateFeeEnabled: checked })}
            />
          </div>

          <Separator />

          <div className={`space-y-6 ${!localConfig.lateFeeEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lateFeePercentage">Late Fee Percentage</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="lateFeePercentage"
                    type="number"
                    min={0}
                    max={25}
                    step={0.5}
                    value={localConfig.lateFeePercentage}
                    onChange={(e) => handleChange({ lateFeePercentage: parseFloat(e.target.value) || 0 })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">% of rent amount</span>
                </div>
                <p className="text-xs text-muted-foreground">Example: 5% of $2,000 = $100 late fee</p>
              </div>

              <div className="space-y-2">
                <Label>Application Frequency</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={localConfig.applyOnce}
                    onCheckedChange={(checked) => handleChange({ applyOnce: checked })}
                  />
                  <span className="text-sm">
                    {localConfig.applyOnce ? 'Once per billing cycle' : 'Repeated application'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {localConfig.applyOnce 
                    ? 'Late fee applied once per overdue invoice' 
                    : 'Warning: This may compound fees'
                  }
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-600">Late Fee Calculation</p>
                <p className="text-muted-foreground">
                  Late Fee = Rent Amount × ({localConfig.lateFeePercentage}% / 100) = <strong>{localConfig.lateFeePercentage}%</strong> of unpaid rent
                </p>
                <p className="text-muted-foreground mt-1">
                  Late fees are added as a separate line item labeled "Late Fee ({localConfig.lateFeePercentage}%)" on the invoice.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Late Fees */}
      {pendingLateFees.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Clock className="h-5 w-5" />
                  Pending Late Fees
                </CardTitle>
                <CardDescription>Invoices past grace period awaiting late fee application</CardDescription>
              </div>
              <Button onClick={onApplyLateFees} className="bg-amber-600 hover:bg-amber-700">
                <DollarSign className="h-4 w-4 mr-1" />
                Apply All Late Fees
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingLateFees.map((item) => (
                <div key={item.invoiceId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{item.tenant}</p>
                    <p className="text-sm text-muted-foreground">{item.invoiceId} - Rent: ${item.amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                      +${item.feeAmount.toLocaleString()} fee
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      )}
    </div>
  );
}
