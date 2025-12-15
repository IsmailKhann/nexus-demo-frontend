import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OwnerStatement } from '@/data/accountingData';
import { toast } from '@/hooks/use-toast';
import { Download, Send, FileText, Printer } from 'lucide-react';

interface OwnerStatementModalProps {
  open: boolean;
  onClose: () => void;
  statement: OwnerStatement | null;
  onGenerate: (statementId: string) => void;
  onSend: (statementId: string) => void;
}

export function OwnerStatementModal({
  open,
  onClose,
  statement,
  onGenerate,
  onSend,
}: OwnerStatementModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!statement) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    onGenerate(statement.id);
    setIsGenerating(false);
    toast({ title: 'Statement Generated', description: 'PDF is ready for download' });
  };

  const handleDownload = () => {
    toast({ title: 'Downloading...', description: 'Statement PDF downloading' });
  };

  const handleSend = () => {
    onSend(statement.id);
    toast({ title: 'Statement Sent', description: `Statement emailed to ${statement.owner}` });
  };

  const handlePrint = () => {
    toast({ title: 'Printing...', description: 'Statement sent to printer' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Owner Statement - {statement.id}
            <Badge variant={
              statement.status === 'Sent' ? 'default' : 
              statement.status === 'Generated' ? 'secondary' : 'outline'
            }>
              {statement.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Statement Header */}
          <div className="p-4 bg-muted/50 rounded-lg grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="font-medium">{statement.owner}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Property</p>
              <p className="font-medium">{statement.property}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statement Period</p>
              <p className="font-medium">{statement.period_start} to {statement.period_end}</p>
            </div>
            {statement.payout_date && (
              <div>
                <p className="text-sm text-muted-foreground">Payout Date</p>
                <p className="font-medium">{statement.payout_date}</p>
              </div>
            )}
          </div>

          {/* Statement Preview */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-primary/5 p-4 border-b">
              <h3 className="font-semibold">Statement Preview</h3>
            </div>
            <div className="p-4 space-y-4">
              {/* Income Section */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">INCOME</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Rental Income</span>
                    <span className="font-mono">${(statement.gross_income * 0.95).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="pl-4 text-muted-foreground">Late Fees</span>
                    <span className="font-mono">${(statement.gross_income * 0.03).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="pl-4 text-muted-foreground">Other Income</span>
                    <span className="font-mono">${(statement.gross_income * 0.02).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Income</span>
                    <span className="font-mono text-green-600">${statement.gross_income.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">EXPENSES</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="pl-4 text-muted-foreground">Repairs & Maintenance</span>
                    <span className="font-mono">${(statement.expenses * 0.4).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="pl-4 text-muted-foreground">Utilities</span>
                    <span className="font-mono">${(statement.expenses * 0.25).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="pl-4 text-muted-foreground">Insurance</span>
                    <span className="font-mono">${(statement.expenses * 0.2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="pl-4 text-muted-foreground">Other Expenses</span>
                    <span className="font-mono">${(statement.expenses * 0.15).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Expenses</span>
                    <span className="font-mono text-destructive">-${statement.expenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Management Fee */}
              <div className="flex justify-between pt-2 border-t">
                <span>Management Fee (10%)</span>
                <span className="font-mono text-destructive">-${statement.management_fee.toLocaleString()}</span>
              </div>

              {/* Net to Owner */}
              <div className="flex justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="font-semibold">Net to Owner</span>
                <span className="font-mono font-bold text-lg text-green-600">${statement.net_to_owner.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <div className="flex gap-2 flex-1">
            {statement.status === 'Draft' && (
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate PDF'}
              </Button>
            )}
            {statement.status !== 'Draft' && (
              <>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
              </>
            )}
          </div>
          {statement.status === 'Generated' && (
            <Button onClick={handleSend}>
              <Send className="h-4 w-4 mr-1" /> Send to Owner
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
