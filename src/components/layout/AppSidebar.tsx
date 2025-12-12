import { NavLink, useLocation } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Users,
  Mail,
  Calendar,
  Wrench,
  DollarSign,
  BarChart3,
  Plug,
  Settings,
  Brain,
  UserCog,
  Inbox,
  Home,
  ClipboardList,
  Bell,
  Star,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { getCurrentUser } from '@/lib/mockApi';

// Manager/Admin navigation
const managerNavigation = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Inbox', url: '/inbox', icon: Inbox },
    ],
  },
  {
    title: 'Property Management',
    items: [
      { title: 'Properties', url: '/properties', icon: Home },
    ],
  },
  {
    title: 'Leasing',
    items: [
      { title: 'CRM & Leads', url: '/crm', icon: Users },
      { title: 'Marketing', url: '/marketing', icon: Mail },
      { title: 'Applications', url: '/applications', icon: Calendar },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Maintenance', url: '/maintenance', icon: Wrench },
      { title: 'Accounting', url: '/accounting', icon: DollarSign },
    ],
  },
  {
    title: 'Insights',
    items: [
      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
      { title: 'AI Center', url: '/ai-center', icon: Brain },
    ],
  },
  {
    title: 'Platform',
    items: [
      { title: 'Integrations', url: '/integrations', icon: Plug },
      { title: 'Users & Roles', url: '/users', icon: UserCog },
      { title: 'Settings', url: '/settings', icon: Settings },
    ],
  },
];

// Tenant navigation
const tenantNavigation = [
  {
    title: 'Home',
    items: [
      { title: 'My Portal', url: '/tenant-portal', icon: Home },
    ],
  },
  {
    title: 'Maintenance',
    items: [
      { title: 'My Requests', url: '/tenant-portal', icon: ClipboardList },
    ],
  },
  {
    title: 'Account',
    items: [
      { title: 'Settings', url: '/settings', icon: Settings },
    ],
  },
];

// Technician navigation
const technicianNavigation = [
  {
    title: 'Home',
    items: [
      { title: 'My Portal', url: '/technician-portal', icon: Home },
    ],
  },
  {
    title: 'Work',
    items: [
      { title: 'Work Orders', url: '/technician-portal', icon: Wrench },
    ],
  },
  {
    title: 'Account',
    items: [
      { title: 'My Profile', url: '/technician-portal', icon: Star },
      { title: 'Settings', url: '/settings', icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentUser = getCurrentUser();

  const isTenant = currentUser?.role === 'tenant';
  const isTechnician = currentUser?.role === 'technician';
  const navigation = isTenant ? tenantNavigation : isTechnician ? technicianNavigation : managerNavigation;

  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="w-8 h-8 rounded-lg nexus-gradient-primary flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-lg">Nexus</h2>
              <p className="text-xs text-sidebar-foreground/70">
                {isTenant ? 'Tenant Portal' : isTechnician ? 'Technician Portal' : 'CRM + PMS'}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            {!isCollapsed && <SidebarGroupLabel>{section.title}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
