import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Play, Pause, RefreshCw, CheckCircle, XCircle, Clock, CreditCard, Building2, AlertTriangle, Zap
} from 'lucide-react';
import { usePaymentStore } from '@/hooks/usePaymentStore';
import { toast } from '@/hooks/use-toast';

export const RecurringPaymentsTab = () => {
  const {
    recurringPlans,
    pauseRecurringPlan,
    resumeRecurringPlan,
    runRecurringNow,
    runAllDueRecurring,
    clearAllPendingACH,
    isProcessing,
    simulateFailures,
    toggleFailureSimulation,
  } = usePaymentStore();

  const [runningPlanId, setRunningPlanId] = useState<string | null>(null);

  const handleRunNow = async (planId: string) => {
    setRunningPlanId(planId);
    const result = await runRecurringNow(planId);
    setRunningPlanId(null);
    
    if (result.success) {
      toast({ title: 'Payment Processed', description: result.message });
    } else {
      toast({ title: 'Payment Failed', description: result.message, variant: 'destructive' });
    }
  };

  const handleRunAllDue = async () => {
    const results = await runAllDueRecurring();
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    toast({
      title: 'Batch Processing Complete',
      description: `${successful} succeeded, ${failed} failed`,
      variant: failed > 0 ? 'destructive' : 'default',
    });
  };

  const handleClearACH = () => {
    clearAllPendingACH();
    toast({ title: 'ACH Cleared', description: 'All pending ACH payments have been cleared' });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      active: { variant: 'default', icon: CheckCircle },
      paused: { variant: 'secondary', icon: Pause },
      cancelled: { variant: 'destructive', icon: XCircle },
    };
    const c = config[status] || { variant: 'outline', icon: Clock };
    const Icon = c.icon;
    return <Badge variant={c.variant} className="gap-1"><Icon className="h-3 w-3" />{status}</Badge>;
  };

  const getRunStatusBadge = (status?: string) => {
    if (!status) return <span className="text-muted-foreground">-</span>;
    return status === 'success' 
      ? <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>
      : <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
  };

  const activePlans = recurringPlans.filter(p => p.status === 'active');
  const pausedPlans = recurringPlans.filter(p => p.status === 'paused');
  const totalMonthly = activePlans.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Demo Controls */}
      <Card className="border-dashed border-primary/50 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Demo Controls
          </CardTitle>
          <CardDescription>Simulate payment engine behavior for testing</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="simulate-failures"
              checked={simulateFailures}
              onCheckedChange={toggleFailureSimulation}
            />
            <Label htmlFor="simulate-failures" className="text-sm">Simulate Payment Failures</Label>
          </div>
          <Button variant="outline" size="sm" onClick={handleRunAllDue} disabled={isProcessing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isProcessing ? 'animate-spin' : ''}`} />
            Run All Due Payments
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearACH}>
            <CheckCircle className="h-4 w-4 mr-1" />
            Clear Pending ACH
          </Button>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Active Plans</p>
            <p className="text-2xl font-bold">{activePlans.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Paused Plans</p>
            <p className="text-2xl font-bold text-yellow-600">{pausedPlans.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            <p className="text-2xl font-bold text-green-600">${totalMonthly.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Next Run Date</p>
            <p className="text-2xl font-bold">
              {activePlans.length > 0 
                ? new Date(Math.min(...activePlans.map(p => new Date(p.nextRunDate).getTime()))).toLocaleDateString()
                : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recurring Plans Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recurring Rent Plans</CardTitle>
              <CardDescription>Manage automated tenant rent collections</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property / Unit</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurringPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.tenantName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {plan.property} - {plan.unit}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">${plan.amount.toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{plan.frequency}</TableCell>
                    <TableCell>{plan.nextRunDate}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{plan.lastRunDate || '-'}</div>
                        {getRunStatusBadge(plan.lastRunStatus)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(plan.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {plan.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => pauseRecurringPlan(plan.id)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : plan.status === 'paused' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resumeRecurringPlan(plan.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {plan.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRunNow(plan.id)}
                            disabled={isProcessing || runningPlanId === plan.id}
                          >
                            {runningPlanId === plan.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <CreditCard className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Failed Payments Alert */}
      {recurringPlans.some(p => p.lastRunStatus === 'failed') && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Failed Payments Require Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recurringPlans.filter(p => p.lastRunStatus === 'failed').map(plan => (
                <div key={plan.id} className="flex items-center justify-between p-2 bg-background rounded border">
                  <div>
                    <p className="font-medium">{plan.tenantName}</p>
                    <p className="text-sm text-muted-foreground">{plan.property} - ${plan.amount}</p>
                  </div>
                  <Button size="sm" onClick={() => handleRunNow(plan.id)} disabled={isProcessing}>
                    Retry
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
