import { useState } from 'react';
import { Phone, Mail, MessageSquare, Search, Star, Archive, Trash2, Clock, User, Building2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type MessageType = 'call' | 'email' | 'sms' | 'inquiry';
type MessageStatus = 'unread' | 'read' | 'starred' | 'archived';

interface Message {
  id: string;
  type: MessageType;
  from: string;
  property?: string;
  subject: string;
  preview: string;
  timestamp: Date;
  status: MessageStatus;
  priority?: 'high' | 'medium' | 'low';
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'email',
    from: 'John Smith',
    property: 'Sunset Apartments',
    subject: 'Question about lease renewal',
    preview: 'Hi, I wanted to ask about the lease renewal process for my unit...',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'unread',
    priority: 'high',
  },
  {
    id: '2',
    type: 'call',
    from: 'Sarah Johnson',
    property: 'Downtown Lofts',
    subject: 'Missed Call',
    preview: 'Attempted to reach you regarding maintenance request',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'unread',
  },
  {
    id: '3',
    type: 'sms',
    from: 'Mike Davis',
    subject: 'Rent payment confirmation',
    preview: 'Just sent the rent payment. Can you confirm receipt?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: 'read',
  },
  {
    id: '4',
    type: 'inquiry',
    from: 'Emily Brown',
    property: 'Parkview Tower',
    subject: 'Tour Request',
    preview: 'I am interested in scheduling a tour for the 2-bedroom unit',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'read',
  },
  {
    id: '5',
    type: 'email',
    from: 'Robert Wilson',
    property: 'Riverside Complex',
    subject: 'Maintenance Issue - Unit 304',
    preview: 'The heating system in my unit is not working properly...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    status: 'starred',
    priority: 'high',
  },
];

const Inbox = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const getIcon = (type: MessageType) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'inquiry':
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: MessageType) => {
    switch (type) {
      case 'call':
        return 'bg-blue-500/10 text-blue-500';
      case 'email':
        return 'bg-purple-500/10 text-purple-500';
      case 'sms':
        return 'bg-green-500/10 text-green-500';
      case 'inquiry':
        return 'bg-orange-500/10 text-orange-500';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || msg.type === selectedType;
    return matchesSearch && matchesType;
  });

  const toggleStar = (id: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id
          ? { ...msg, status: msg.status === 'starred' ? 'read' : 'starred' }
          : msg
      )
    );
  };

  const markAsRead = (id: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id && msg.status === 'unread' ? { ...msg, status: 'read' } : msg
      )
    );
  };

  return (
    <div className="flex h-full">
      {/* Messages List */}
      <div className="w-96 border-r border-border flex flex-col">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Inbox</h1>
            <Badge variant="secondary">
              {messages.filter((m) => m.status === 'unread').length} new
            </Badge>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="email">Emails</SelectItem>
              <SelectItem value="call">Calls</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="inquiry">Inquiries</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`p-4 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                message.status === 'unread' ? 'bg-accent/20' : ''
              } ${selectedMessage?.id === message.id ? 'bg-accent' : ''}`}
              onClick={() => {
                setSelectedMessage(message);
                markAsRead(message.id);
              }}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {message.from
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-semibold ${
                        message.status === 'unread' ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {message.from}
                    </span>
                    <div className={`p-1 rounded ${getTypeColor(message.type)}`}>
                      {getIcon(message.type)}
                    </div>
                  </div>

                  {message.property && (
                    <p className="text-xs text-muted-foreground mb-1">{message.property}</p>
                  )}

                  <p
                    className={`text-sm mb-1 ${
                      message.status === 'unread' ? 'font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {message.subject}
                  </p>

                  <p className="text-xs text-muted-foreground truncate">{message.preview}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">
                        High Priority
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(message.id);
                  }}
                >
                  <Star
                    className={`h-4 w-4 ${
                      message.status === 'starred' ? 'fill-yellow-500 text-yellow-500' : ''
                    }`}
                  />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Detail */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <>
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {selectedMessage.from
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold mb-1">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{selectedMessage.from}</span>
                      {selectedMessage.property && (
                        <>
                          <span>•</span>
                          <Building2 className="h-4 w-4" />
                          <span>{selectedMessage.property}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className={`flex items-center gap-2 px-3 py-1 rounded ${getTypeColor(selectedMessage.type)}`}>
                  {getIcon(selectedMessage.type)}
                  <span className="capitalize">{selectedMessage.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedMessage.timestamp.toLocaleString()}</span>
                </div>
                {selectedMessage.priority && (
                  <Badge variant={selectedMessage.priority === 'high' ? 'destructive' : 'secondary'}>
                    {selectedMessage.priority} priority
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <Card className="p-6">
                <p className="text-foreground leading-relaxed">{selectedMessage.preview}</p>
              </Card>

              <div className="mt-6">
                <Button className="mr-2">Reply</Button>
                <Button variant="outline">Forward</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No message selected</h3>
              <p className="text-muted-foreground">Select a message to view its contents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
