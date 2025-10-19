import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users as UsersIcon,
  Search,
  UserPlus,
  Shield,
  Settings,
  Mail,
  Phone,
  Calendar,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  Lock,
  Unlock,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Users = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock users data
  const users = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@nexus.com',
      phone: '+1 (555) 123-4567',
      role: 'admin',
      status: 'active',
      lastActive: '5 minutes ago',
      joinDate: '2024-01-15',
      properties: 5,
      leadsManaged: 127
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike.c@nexus.com',
      phone: '+1 (555) 234-5678',
      role: 'property_manager',
      status: 'active',
      lastActive: '2 hours ago',
      joinDate: '2024-02-20',
      properties: 3,
      leadsManaged: 89
    },
    {
      id: 3,
      name: 'Jessica Lee',
      email: 'jessica.l@nexus.com',
      phone: '+1 (555) 345-6789',
      role: 'leasing_agent',
      status: 'active',
      lastActive: '1 hour ago',
      joinDate: '2024-03-10',
      properties: 0,
      leadsManaged: 156
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.k@nexus.com',
      phone: '+1 (555) 456-7890',
      role: 'leasing_agent',
      status: 'active',
      lastActive: '30 minutes ago',
      joinDate: '2024-03-15',
      properties: 0,
      leadsManaged: 134
    },
    {
      id: 5,
      name: 'Robert Martinez',
      email: 'robert.m@nexus.com',
      phone: '+1 (555) 567-8901',
      role: 'maintenance_staff',
      status: 'active',
      lastActive: '3 hours ago',
      joinDate: '2024-04-01',
      properties: 0,
      leadsManaged: 0
    },
    {
      id: 6,
      name: 'Emily Davis',
      email: 'emily.d@nexus.com',
      phone: '+1 (555) 678-9012',
      role: 'viewer',
      status: 'inactive',
      lastActive: '2 days ago',
      joinDate: '2024-05-10',
      properties: 0,
      leadsManaged: 0
    }
  ];

  // Roles configuration
  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full access to all features and settings',
      color: 'bg-red-500',
      users: 1,
      permissions: [
        'Manage all properties',
        'Manage all users',
        'Access financial data',
        'Configure system settings',
        'View all reports'
      ]
    },
    {
      id: 'property_manager',
      name: 'Property Manager',
      description: 'Manage assigned properties and operations',
      color: 'bg-blue-500',
      users: 1,
      permissions: [
        'Manage assigned properties',
        'Approve applications',
        'View financial reports',
        'Manage maintenance',
        'Communicate with tenants'
      ]
    },
    {
      id: 'leasing_agent',
      name: 'Leasing Agent',
      description: 'Handle leads and leasing activities',
      color: 'bg-purple-500',
      users: 2,
      permissions: [
        'Manage leads',
        'Schedule tours',
        'Process applications',
        'Generate quotes',
        'View property listings'
      ]
    },
    {
      id: 'maintenance_staff',
      name: 'Maintenance Staff',
      description: 'Handle work orders and maintenance tasks',
      color: 'bg-orange-500',
      users: 1,
      permissions: [
        'View work orders',
        'Update work status',
        'Add maintenance notes',
        'View property details',
        'Upload photos'
      ]
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to basic information',
      color: 'bg-gray-500',
      users: 1,
      permissions: [
        'View properties',
        'View reports',
        'View dashboard'
      ]
    }
  ];

  // Activity log
  const activityLog = [
    {
      id: 1,
      user: 'Sarah Johnson',
      action: 'Updated user permissions',
      target: 'Mike Chen',
      timestamp: '5 minutes ago',
      type: 'permission_change'
    },
    {
      id: 2,
      user: 'Mike Chen',
      action: 'Created new user',
      target: 'Robert Martinez',
      timestamp: '2 hours ago',
      type: 'user_created'
    },
    {
      id: 3,
      user: 'Sarah Johnson',
      action: 'Changed role',
      target: 'Jessica Lee',
      timestamp: '1 day ago',
      type: 'role_change'
    },
    {
      id: 4,
      user: 'System',
      action: 'Deactivated user',
      target: 'Emily Davis',
      timestamp: '2 days ago',
      type: 'user_deactivated'
    }
  ];

  const getRoleBadgeColor = (role: string) => {
    const roleConfig = roles.find(r => r.id === role);
    return roleConfig?.color || 'bg-gray-500';
  };

  const getRoleDisplayName = (role: string) => {
    const roleConfig = roles.find(r => r.id === role);
    return roleConfig?.name || role;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInviteUser = () => {
    toast({
      title: "Invite User",
      description: "User invitation feature will be implemented with backend integration.",
    });
  };

  const handleEditUser = (userName: string) => {
    toast({
      title: "Edit User",
      description: `Editing ${userName}. This will be implemented with backend integration.`,
    });
  };

  const handleDeleteUser = (userName: string) => {
    toast({
      title: "Delete User",
      description: `Deleting ${userName}. This will be implemented with backend integration.`,
      variant: "destructive",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UsersIcon className="h-8 w-8 text-blue-500" />
            Users & Permissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and access control
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleInviteUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +2 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {users.filter(u => u.status === 'inactive').length} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Custom roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Last Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground mt-1">Across all users</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">
            <UsersIcon className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team and their access levels</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className={getRoleBadgeColor(user.role)}>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined {user.joinDate}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {user.email}
                          </div>
                          <div className="text-sm flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {user.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" />Active</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" />Inactive</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {user.lastActive}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {user.properties > 0 && (
                            <div>{user.properties} properties</div>
                          )}
                          {user.leadsManaged > 0 && (
                            <div className="text-muted-foreground">
                              {user.leadsManaged} leads
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user.name)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <Card key={role.id} className="hover-scale">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-lg ${role.color} flex items-center justify-center`}>
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>{role.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {role.users} user{role.users !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="mt-2">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Permissions
                    </h4>
                    <div className="space-y-2">
                      {role.permissions.map((permission, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{permission}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Permissions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permission Categories</CardTitle>
              <CardDescription>
                Fine-grained control over feature access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Property Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>View properties</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Create properties</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Edit properties</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Delete properties</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      CRM & Leads
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>View leads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Manage leads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Schedule tours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Process applications</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Financial Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>View reports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>View GL accounts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Manage payments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Export financial data</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Log</CardTitle>
              <CardDescription>
                Track all user management and permission changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      activity.type === 'permission_change' ? 'bg-blue-500/10' :
                      activity.type === 'user_created' ? 'bg-green-500/10' :
                      activity.type === 'role_change' ? 'bg-purple-500/10' :
                      'bg-red-500/10'
                    }`}>
                      {activity.type === 'permission_change' ? (
                        <Key className="h-5 w-5 text-blue-500" />
                      ) : activity.type === 'user_created' ? (
                        <UserPlus className="h-5 w-5 text-green-500" />
                      ) : activity.type === 'role_change' ? (
                        <Shield className="h-5 w-5 text-purple-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{activity.user}</span>
                        <span className="text-muted-foreground">{activity.action}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Target: <span className="font-medium">{activity.target}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        {activity.timestamp}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Users;
