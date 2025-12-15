import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Download, 
  FileText, 
  Plus, 
  Calendar,
  Filter,
  MessageSquare,
  X
} from 'lucide-react';
import { Account, Transaction } from '@/data/accountingData';
import { toast } from '@/hooks/use-toast';

interface LedgerDrilldownPanelProps {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  transactions: Transaction[];
  onPostJournalEntry: (entries: { accountId: string; debit: number; credit: number; description: string }[], property: string) => void;
  accounts: Account[];
}

export function LedgerDrilldownPanel({
  open,
  onClose,
  account,
  transactions,
  onPostJournalEntry,
  accounts,
}: LedgerDrilldownPanelProps) {
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<{ accountId: string; debit: string; credit: string; description: string }[]>([
    { accountId: account?.id || '', debit: '', credit: '', description: '' },
    { accountId: '', debit: '', credit: '', description: '' },
  ]);
  const [journalProperty, setJournalProperty] = useState('');
  const [note, setNote] = useState('');

  if (!account) return null;

  const accountTransactions = transactions.filter(t => t.account_id === account.id);
  
  const filteredTransactions = accountTransactions.filter(t => {
    if (propertyFilter !== 'all' && t.property !== propertyFilter) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (dateFilter.start && t.date < dateFilter.start) return false;
    if (dateFilter.end && t.date > dateFilter.end) return false;
    return true;
  });

  // Calculate running balance
  let runningBalance = account.balance;
  const transactionsWithBalance = [...filteredTransactions].reverse().map(t => {
    const balanceChange = account.normal_balance === 'Debit' 
      ? t.debit - t.credit 
      : t.credit - t.debit;
    runningBalance -= balanceChange;
    return { ...t, runningBalance: runningBalance + balanceChange };
  }).reverse();

  const properties = [...new Set(accountTransactions.map(t => t.property))];
  const types = [...new Set(accountTransactions.map(t => t.type))];

  const handleExportCSV = () => {
    toast({ title: 'Export Started', description: 'Downloading ledger as CSV...' });
  };

  const handleExportPDF = () => {
    toast({ title: 'Export Started', description: 'Generating PDF report...' });
  };

  const handlePostJournal = () => {
    const validEntries = journalEntries.filter(e => e.accountId && (e.debit || e.credit));
    if (validEntries.length < 2) {
      toast({ title: 'Error', description: 'Journal entry must have at least 2 lines', variant: 'destructive' });
      return;
    }

    const totalDebits = validEntries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
    const totalCredits = validEntries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      toast({ title: 'Error', description: 'Debits must equal credits', variant: 'destructive' });
      return;
    }

    onPostJournalEntry(
      validEntries.map(e => ({
        accountId: e.accountId,
        debit: parseFloat(e.debit) || 0,
        credit: parseFloat(e.credit) || 0,
        description: e.description || 'Journal entry',
      })),
      journalProperty || 'All Properties'
    );

    setJournalModalOpen(false);
    setJournalEntries([
      { accountId: account.id, debit: '', credit: '', description: '' },
      { accountId: '', debit: '', credit: '', description: '' },
    ]);
    toast({ title: 'Success', description: 'Journal entry posted successfully' });
  };

  const handleAddNote = () => {
    toast({ title: 'Note Added', description: 'Note attached to this account' });
    setNoteModalOpen(false);
    setNote('');
  };

  const addJournalLine = () => {
    setJournalEntries([...journalEntries, { accountId: '', debit: '', credit: '', description: '' }]);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className="font-mono text-primary">{account.id}</span>
              <span>{account.name}</span>
              <Badge variant="outline">{account.type}</Badge>
            </SheetTitle>
            <SheetDescription>
              Ledger transactions • Normal Balance: {account.normal_balance} • Current Balance: ${Math.abs(account.balance).toLocaleString()}
            </SheetDescription>
          </SheetHeader>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => setJournalModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Journal Entry
            </Button>
            <Button variant="outline" size="sm" onClick={() => setNoteModalOpen(true)}>
              <MessageSquare className="h-4 w-4 mr-1" /> Add Note
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 p-3 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input 
                type="date" 
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">End Date</Label>
              <Input 
                type="date" 
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Property</Label>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="mt-4 border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead className="w-24">Ref #</TableHead>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24 text-right">Debit</TableHead>
                  <TableHead className="w-24 text-right">Credit</TableHead>
                  <TableHead className="w-28 text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsWithBalance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No transactions found for this period
                    </TableCell>
                  </TableRow>
                ) : (
                  transactionsWithBalance.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs">{txn.date}</TableCell>
                      <TableCell className="font-mono text-xs">{txn.ref}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{txn.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{txn.description}</TableCell>
                      <TableCell className="text-right font-mono">
                        {txn.debit > 0 ? `$${txn.debit.toLocaleString()}` : ''}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {txn.credit > 0 ? `$${txn.credit.toLocaleString()}` : ''}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        ${txn.runningBalance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Transactions:</span>
              <span className="font-medium">{filteredTransactions.length}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Total Debits:</span>
              <span className="font-mono">${filteredTransactions.reduce((s, t) => s + t.debit, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Total Credits:</span>
              <span className="font-mono">${filteredTransactions.reduce((s, t) => s + t.credit, 0).toLocaleString()}</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Journal Entry Modal */}
      <Dialog open={journalModalOpen} onOpenChange={setJournalModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Manual Journal Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Property</Label>
              <Select value={journalProperty} onValueChange={setJournalProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="Greenway Apts">Greenway Apts</SelectItem>
                  <SelectItem value="Oak Manor">Oak Manor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                <div className="col-span-4">Account</div>
                <div className="col-span-2">Debit</div>
                <div className="col-span-2">Credit</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-1"></div>
              </div>
              {journalEntries.map((entry, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2">
                  <div className="col-span-4">
                    <Select 
                      value={entry.accountId} 
                      onValueChange={(v) => {
                        const newEntries = [...journalEntries];
                        newEntries[idx].accountId = v;
                        setJournalEntries(newEntries);
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.id} - {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      value={entry.debit}
                      onChange={(e) => {
                        const newEntries = [...journalEntries];
                        newEntries[idx].debit = e.target.value;
                        setJournalEntries(newEntries);
                      }}
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      value={entry.credit}
                      onChange={(e) => {
                        const newEntries = [...journalEntries];
                        newEntries[idx].credit = e.target.value;
                        setJournalEntries(newEntries);
                      }}
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input 
                      placeholder="Memo"
                      value={entry.description}
                      onChange={(e) => {
                        const newEntries = [...journalEntries];
                        newEntries[idx].description = e.target.value;
                        setJournalEntries(newEntries);
                      }}
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-1">
                    {idx > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setJournalEntries(journalEntries.filter((_, i) => i !== idx))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={addJournalLine}>
              <Plus className="h-4 w-4 mr-1" /> Add Line
            </Button>

            <div className="flex justify-between p-3 bg-muted/50 rounded-lg text-sm">
              <div>
                <span className="text-muted-foreground">Total Debits: </span>
                <span className="font-mono font-medium">
                  ${journalEntries.reduce((s, e) => s + (parseFloat(e.debit) || 0), 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Credits: </span>
                <span className="font-mono font-medium">
                  ${journalEntries.reduce((s, e) => s + (parseFloat(e.credit) || 0), 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Difference: </span>
                <span className={`font-mono font-medium ${
                  Math.abs(journalEntries.reduce((s, e) => s + (parseFloat(e.debit) || 0), 0) - 
                  journalEntries.reduce((s, e) => s + (parseFloat(e.credit) || 0), 0)) > 0.01 
                    ? 'text-destructive' : 'text-green-600'
                }`}>
                  ${Math.abs(
                    journalEntries.reduce((s, e) => s + (parseFloat(e.debit) || 0), 0) - 
                    journalEntries.reduce((s, e) => s + (parseFloat(e.credit) || 0), 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJournalModalOpen(false)}>Cancel</Button>
            <Button onClick={handlePostJournal}>Post Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Modal */}
      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note to {account.name}</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Note</Label>
            <Textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter your note..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
