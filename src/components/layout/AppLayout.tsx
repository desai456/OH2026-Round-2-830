import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Warehouse,
  CreditCard,
  Receipt,
  Users,
  Activity,
  BarChart3,
  Package,
  Sliders,
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ToastContainer, Badge, Button } from '../ui';
import { CommandPalette } from './CommandPalette';
import { UserRole } from '../../types';

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const { currentUser, switchRole, theme, toggleTheme, toasts } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const isCustomerPortalRoute = location.pathname.startsWith('/customer');

  if (isCustomerPortalRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Outlet />
        <ToastContainer />
      </div>
    );
  }

  const workspaceNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Quotations', path: '/quotes', icon: FileText },
    { name: 'Approvals', path: '/approvals', icon: ShieldCheck },
    { name: 'Fulfillment', path: '/fulfillment/q-1042', icon: Warehouse },
    { name: 'Billing', path: '/billing/q-1042', icon: CreditCard },
  ];

  const intelligenceNav = [
    { name: 'Deal Health', path: '/health', icon: Activity },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const adminNav = [
    { name: 'Discount Rules', path: '/admin/rules', icon: Sliders },
    { name: 'Products & SKUs', path: '/admin/products', icon: Package },
  ];

  const demoRoles: UserRole[] = ['Sales Rep', 'Sales Manager', 'Finance', 'Operations', 'Admin', 'Customer'];

  const breadcrumbMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/quotes': 'Quotations',
    '/approvals': 'Approval Workspace',
    '/health': 'Deal Health & Governance',
    '/analytics': 'Revenue Analytics',
    '/admin/rules': 'Discount Governance Rules',
    '/admin/products': 'Product Catalog & Pricing',
  };

  const getBreadcrumb = () => {
    if (location.pathname.startsWith('/quotes/')) {
      const parts = location.pathname.split('/');
      return `Quotations / ${parts[2] || 'Builder'}`;
    }
    if (location.pathname.startsWith('/fulfillment/')) {
      return `Fulfillment Operations`;
    }
    if (location.pathname.startsWith('/billing/')) {
      return `Hybrid Billing & Invoices`;
    }
    return breadcrumbMap[location.pathname] || 'Workspace';
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased">
      {/* Command Palette Modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black tracking-wider text-lg shadow-md shrink-0">
              DF
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  DEALFLOW360
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    CPQ
                  </span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 tracking-wide">Intelligent Sales Operations</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Workspace */}
          <div>
            {!isCollapsed && (
              <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Workspace
              </h3>
            )}
            <nav className="space-y-1">
              {workspaceNav.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs dark:bg-blue-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Intelligence */}
          <div>
            {!isCollapsed && (
              <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Intelligence
              </h3>
            )}
            <nav className="space-y-1">
              {intelligenceNav.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs dark:bg-blue-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Administration */}
          <div>
            {!isCollapsed && (
              <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Administration
              </h3>
            )}
            <nav className="space-y-1">
              {adminNav.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs dark:bg-blue-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Customer Portal Shortcut */}
          {!isCollapsed && (
            <div className="pt-2">
              <button
                onClick={() => navigate('/customer/portal')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800/80 dark:to-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-blue-900 dark:text-blue-200 hover:shadow-xs transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Customer Portal</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">View Client View</span>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 relative">
          <div
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm shrink-0 shadow-xs">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{currentUser.name}</h4>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  {currentUser.role}
                </p>
              </div>
            )}
          </div>

          {/* Role Switcher Menu Popup */}
          {isRoleMenuOpen && (
            <div className="absolute bottom-16 left-3 right-3 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 animate-in fade-in duration-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                Switch Demo Role
              </span>
              <div className="space-y-0.5 mt-1">
                {demoRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      if (role === 'Customer') {
                        navigate('/customer/portal');
                      } else {
                        switchRole(role);
                      }
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      currentUser.role === role
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{role}</span>
                    {currentUser.role === role && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <span className="text-slate-400 font-normal">DealFlow360</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span>{getBreadcrumb()}</span>
            </div>
          </div>

          {/* Right Topbar Actions */}
          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-medium transition-colors border border-slate-200/60 dark:border-slate-700/60"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search or type command...</span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-400 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-40 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</h4>
                    <Badge variant="primary" size="sm">2 New</Badge>
                  </div>
                  <div className="space-y-3 mt-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs">
                      <div className="font-semibold text-amber-900 dark:text-amber-200">Approval Required (Q-1042)</div>
                      <div className="text-amber-700 dark:text-amber-400 mt-0.5">Setup Service discount of 18% exceeds category policy limits.</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs">
                      <div className="font-semibold text-blue-900 dark:text-blue-200">Quote Confirmed (Q-1035)</div>
                      <div className="text-blue-700 dark:text-blue-400 mt-0.5">Beta Industries accepted $452,000 proposal.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Active Role Pill Badge */}
            <Badge variant="primary" className="hidden sm:inline-flex gap-1.5 px-3 py-1 font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{currentUser.role}</span>
            </Badge>
          </div>
        </header>

        {/* Dynamic Page View Outlet */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
