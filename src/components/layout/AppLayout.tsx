import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Warehouse,
  CreditCard,
  Receipt,
  Activity,
  BarChart3,
  Package,
  Sliders,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  UserCheck,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ToastContainer } from '../ui';
import { CommandPalette } from './CommandPalette';
import { UserRole } from '../../types';

export function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const { currentUser, switchRole, theme, toggleTheme } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const isCustomerPortalRoute = location.pathname.startsWith('/customer');

  if (isCustomerPortalRoute) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Outlet />
        <ToastContainer />
      </div>
    );
  }

  // 9 Top Navigation Bar Tab Links (Exact Excalidraw Wireframe Spec)
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Quotations', path: '/quotes', icon: FileText },
    { name: 'Approvals', path: '/approvals', icon: ShieldCheck },
    { name: 'Fulfillment', path: '/fulfillment', icon: Warehouse },
    { name: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Deal Health', path: '/health', icon: Activity },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Product', path: '/products', icon: Package },
  ];

  const demoRoles: UserRole[] = ['Sales Rep', 'Sales Manager', 'Finance', 'Operations', 'Admin', 'Customer'];

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      {/* Command Palette Modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* TOP NAVIGATION CHROME (<AppShell> Bar per Wireframe Spec) */}
      <header className="h-14 px-4 sm:px-6 bg-[#0F172A] text-white border-b border-[#1E293B] flex items-center justify-between sticky top-0 z-40 shadow-sm">
        {/* Brand Logo & Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#172033]"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white font-black tracking-wider text-sm flex items-center justify-center shadow-md">
              DF
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white hidden sm:flex items-center gap-1.5">
              DEALFLOW360
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                CPQ
              </span>
            </span>
          </div>
        </div>

        {/* Center-Left 9 Nav Links (Single-Row Dense Pill/Tab Style) */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 mx-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-[#4F46E5] text-white shadow-2xs font-bold ring-1 ring-indigo-400/30'
                    : 'text-[#CBD5E1] hover:bg-[#172033] hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Far-Right: Search + Role Switcher + Notifications + Theme */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Global Search Button */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 bg-[#172033] hover:bg-slate-800 text-[#CBD5E1] rounded-lg text-xs font-medium border border-[#1E293B] transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.2 bg-[#0F172A] rounded border border-[#1E293B] text-[9px] font-mono text-[#94A3B8]">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#172033] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#4F46E5] ring-2 ring-[#0F172A]" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl shadow-xl p-4 z-50 animate-in fade-in duration-150 text-slate-900 dark:text-slate-100">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">2 New</span>
                </div>
                <div className="space-y-2.5 mt-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200">
                    <div className="font-bold">Approval Required (Q-1042)</div>
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Setup Service discount of 18% exceeds category limit.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#172033] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#CBD5E1]" />}
          </button>

          {/* Role Switcher Pill Badge */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF2FF] dark:bg-indigo-950/80 text-[#4338CA] dark:text-indigo-300 border border-[#C7D2FE] dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{currentUser.role}</span>
              <ChevronDown className="w-3 h-3 text-[#4338CA]" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-xl p-2 z-50 animate-in fade-in duration-150">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider px-2 py-1 block">
                  Switch Persona
                </span>
                <div className="space-y-0.5 mt-1">
                  {demoRoles.map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        if (role === 'Customer') navigate('/customer/portal');
                        else switchRole(role);
                        setIsRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        currentUser.role === role
                          ? 'bg-[#4F46E5] text-white font-bold'
                          : 'text-[#CBD5E1] hover:bg-[#172033]'
                      }`}
                    >
                      <span>{role}</span>
                      {currentUser.role === role && <UserCheck className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileOpen && (
        <div className="lg:hidden bg-[#0F172A] border-b border-[#1E293B] p-4 space-y-2 text-white">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-[#CBD5E1] hover:bg-[#172033] hover:text-white"
                >
                  <Icon className="w-4 h-4 text-[#94A3B8]" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Main Outlet Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}
