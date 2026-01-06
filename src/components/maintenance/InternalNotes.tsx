import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Lock, Send, Edit2, Trash2, AlertTriangle, EyeOff } from 'lucide-react';
import type { WorkOrderNote } from '@/types/maintenance';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface InternalNotesProps {
  notes: WorkOrderNote[];
  currentUser: string;
  currentUserRole: 'admin' | 'vendor' | 'tenant' | 'system';
  onAddNote: (content: string) => void;
  onEditNote?: (noteId: string, content: string) => void;
  onDeleteNote?: (noteId: string) => void;
}

export function InternalNotes({
  notes,
  currentUser,
  currentUserRole,
  onAddNote,
  onEditNote,
  onDeleteNote,
}: InternalNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  const internalNotes = notes.filter((n) => n.isInternal);
  const sortedNotes = [...internalNotes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onAddNote(newNote.trim());
    setNewNote('');
  };

  const handleEditNote = (noteId: string) => {
    if (!editContent.trim() || !onEditNote) return;
    onEditNote(noteId, editContent.trim());
    setEditingNoteId(null);
    setEditContent('');
  };

  const handleDeleteNote = () => {
    if (deleteNoteId && onDeleteNote) {
      onDeleteNote(deleteNoteId);
      setDeleteNoteId(null);
    }
  };

  const startEdit = (note: WorkOrderNote) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const canEditNote = (note: WorkOrderNote) => {
    return currentUserRole === 'admin' || note.createdBy === currentUser;
  };

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Internal Notes
        </h3>
        <Badge variant="secondary" className="text-xs">
          {internalNotes.length} notes
        </Badge>
      </div>

      <Alert className="border-amber-500/50 bg-amber-500/10">
        <EyeOff className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-xs text-amber-700 dark:text-amber-400">
          These notes are <strong>not visible to tenants or external vendors</strong>. Use for
          internal discussion, cost decisions, or escalation notes.
        </AlertDescription>
      </Alert>

      {/* Add Note Form */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add an internal note..."
            rows={3}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Internal Only
            </span>
            <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
              <Send className="h-4 w-4 mr-1" /> Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {sortedNotes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No internal notes yet
            </p>
          ) : (
            sortedNotes.map((note) => (
              <Card key={note.id} className="border-l-4 border-l-amber-500">
                <CardContent className="py-3 px-4">
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingNoteId(null)}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleEditNote(note.id)}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{note.createdBy}</span>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {note.createdByRole}
                          </Badge>
                        </div>
                        {canEditNote(note) && (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => startEdit(note)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive"
                              onClick={() => setDeleteNoteId(note.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{formatTimestamp(note.createdAt)}</span>
                        {note.isEdited && (
                          <span className="italic">(edited)</span>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Internal Note
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this internal note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
