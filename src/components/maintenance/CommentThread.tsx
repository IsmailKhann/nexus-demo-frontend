import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import {
  MessageCircle,
  Send,
  Paperclip,
  Eye,
  EyeOff,
  User,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import type { WorkOrderComment, CommentAttachment } from '@/types/maintenance';

interface CommentThreadProps {
  comments: WorkOrderComment[];
  currentUser: string;
  currentUserRole: 'admin' | 'vendor' | 'tenant' | 'system';
  onAddComment: (content: string, isTenantVisible: boolean, attachments?: CommentAttachment[]) => void;
  onToggleVisibility?: (commentId: string, isTenantVisible: boolean) => void;
}

const roleColors: Record<string, string> = {
  admin: 'bg-primary text-primary-foreground',
  vendor: 'bg-orange-500 text-white',
  tenant: 'bg-blue-500 text-white',
  system: 'bg-gray-500 text-white',
};

export function CommentThread({
  comments,
  currentUser,
  currentUserRole,
  onAddComment,
  onToggleVisibility,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [isTenantVisible, setIsTenantVisible] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<CommentAttachment[]>([]);

  const sortedComments = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Filter comments based on role
  const visibleComments = currentUserRole === 'tenant'
    ? sortedComments.filter((c) => c.isTenantVisible)
    : sortedComments;

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim(), isTenantVisible, pendingAttachments.length > 0 ? pendingAttachments : undefined);
    setNewComment('');
    setPendingAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: CommentAttachment[] = Array.from(files).map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      url: URL.createObjectURL(file),
    }));

    setPendingAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Comments
        </h3>
        <Badge variant="secondary" className="text-xs">
          {visibleComments.length} messages
        </Badge>
      </div>

      {/* Comments List */}
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {visibleComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No comments yet
            </p>
          ) : (
            visibleComments.map((comment) => (
              <Card
                key={comment.id}
                className={`${
                  comment.createdBy === currentUser
                    ? 'ml-8 border-l-4 border-l-primary'
                    : 'mr-8'
                }`}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium">{comment.createdBy}</span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${roleColors[comment.createdByRole]}`}
                      >
                        {comment.createdByRole}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentUserRole === 'admin' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => onToggleVisibility?.(comment.id, !comment.isTenantVisible)}
                          title={comment.isTenantVisible ? 'Hide from tenant' : 'Show to tenant'}
                        >
                          {comment.isTenantVisible ? (
                            <Eye className="h-3 w-3 text-green-500" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                      <Badge
                        variant={comment.isTenantVisible ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {comment.isTenantVisible ? 'Visible' : 'Internal'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

                  {/* Attachments */}
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {comment.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
                        >
                          {att.type === 'image' ? (
                            <ImageIcon className="h-3 w-3" />
                          ) : (
                            <FileText className="h-3 w-3" />
                          )}
                          {att.name}
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    {formatTimestamp(comment.createdAt)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add Comment Form */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="resize-none"
          />

          {/* Pending Attachments */}
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pendingAttachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs"
                >
                  {att.type === 'image' ? (
                    <ImageIcon className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  <span className="max-w-[100px] truncate">{att.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 p-0"
                    onClick={() => removeAttachment(att.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                />
                <div className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <Paperclip className="h-4 w-4" />
                  Attach
                </div>
              </label>

              {currentUserRole !== 'tenant' && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="tenant-visible"
                    checked={isTenantVisible}
                    onCheckedChange={setIsTenantVisible}
                  />
                  <Label htmlFor="tenant-visible" className="text-xs flex items-center gap-1">
                    {isTenantVisible ? (
                      <>
                        <Eye className="h-3 w-3 text-green-500" />
                        Tenant visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Internal only
                      </>
                    )}
                  </Label>
                </div>
              )}
            </div>

            <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4 mr-1" /> Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
