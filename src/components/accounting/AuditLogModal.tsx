import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuditLog } from '@/data/accountingData';
import { format } from 'date-fns';
import { Shield, User, Clock, FileText } from 'lucide-react';

interface AuditLogModalProps {
  open: boolean;
  onClose: () => void;
  auditLogs: AuditLog[];
}

export function AuditLogModal({
  open,
  onClose,
  auditLogs,
}: AuditLogModalProps) {
  const formatTimestamp = (ts: string) => {
    try {
      return format(new Date(ts), 'MMM d, yyyy h:mm a');
    } catch {
      return ts;
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
    switch (role) {
      case 'Admin': return 'default';
      case 'Accountant': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Log
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Timestamp</TableHead>
                <TableHead className="w-32">User</TableHead>
                <TableHead className="w-24">Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="w-28">Entity</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {log.user}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(log.user_role)} className="text-xs">
                      {log.user_role}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{log.entity_type}</span>
                      <span className="font-mono">{log.entity_id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.old_value && log.new_value ? (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground line-through">{log.old_value}</div>
                        <div className="text-xs text-green-600">{log.new_value}</div>
                      </div>
                    ) : log.new_value ? (
                      <span className="text-xs">{log.new_value}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
