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
  Menu,
  X,
  UserCheck,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ToastContainer } from '../ui';
import { CommandPalette } from './CommandPalette';
import { UserRole } from '../../types';

export function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const { currentUser, switchRole } = useAppContext();
  const { authUser, logout, loginAsDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsRoleMenuOpen(false);
  };

  const isCustomerPortalRoute = location.pathname.startsWith('/customer');

  if (isCustomerPortalRoute) {
    return (
      <div className="min-h-screen bg-transparent text-[#F5F1EA] flex flex-col font-sans">
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
    <div className="min-h-screen bg-transparent text-[#F5F1EA] flex flex-col font-sans antialiased">
      {/* Command Palette Modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* FLOATING CAPSULE NAVBAR (Full Screen Responsive Fit, No Roller) */}
      <header className="sticky top-0 z-40 w-full pt-3 pb-2 px-3 sm:px-5 lg:px-6 bg-transparent pointer-events-none">
        <div className="w-full max-w-[1536px] mx-auto h-[60px] sm:h-[64px] px-4 sm:px-6 bg-[#0E0E10]/95 backdrop-blur-[16px] border border-white/10 rounded-full flex items-center justify-between shadow-2xl shadow-black/80 pointer-events-auto transition-all">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-1.5 rounded-full text-[#A6A39C] hover:text-[#F5F1EA] hover:bg-white/5 transition-colors"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#FF4A1C] to-[#FF7A45] text-[#F5F1EA] font-black tracking-wider text-xs flex items-center justify-center shadow-lg shadow-[#FF4A1C]/30 border border-white/10 group-hover:scale-105 transition-transform">
                DF
              </div>
              <span className="font-serif font-medium text-base sm:text-lg tracking-tight text-[#F5F1EA] hidden sm:flex items-center gap-1.5">
                <span>DEALFLOW</span>
                <span className="text-[#FF7A45] font-serif font-bold">360</span>
                <span className="text-[9px] font-sans tracking-widest px-2 py-0.5 rounded-full bg-[#1C1C1E] text-[#A6A39C] border border-white/8 font-bold uppercase">
                  CPQ
                </span>
              </span>
            </div>
          </div>

          {/* Center: Clean Nav Links (No Scrollbar Roller, Fits Screen Perfectly) */}
          <nav className="hidden lg:flex items-center gap-2.5 xl:gap-4 no-scrollbar overflow-hidden py-1 mx-2 flex-nowrap shrink">
            {navItems.map(item => {
              const isActive = location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`text-xs xl:text-sm font-medium tracking-tight transition-colors shrink-0 whitespace-nowrap px-1.5 py-0.5 ${
                    isActive
                      ? 'text-[#F5F1EA] font-semibold border-b-2 border-[#FF4A1C]'
                      : 'text-[#A6A39C] hover:text-[#F5F1EA]'
                  }`}
                >
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Actions (Ghost Pill Persona + Primary Light CTA) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Global Search Button */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#1C1C1E] hover:bg-white/10 text-[#A6A39C] hover:text-[#F5F1EA] rounded-full text-xs font-medium border border-white/8 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-[#A6A39C]" />
              <span className="hidden xl:inline">Search...</span>
              <kbd className="px-1.5 py-0.2 bg-[#0A0A0B] rounded border border-white/10 text-[9px] font-mono text-[#6E6C68]">
                ⌘K
              </kbd>
            </button>

            {/* Persona Switcher Pill Button */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-transparent text-[#F5F1EA] border border-white/14 hover:border-white/28 hover:bg-white/5 text-xs font-medium transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-[#FF4A1C] animate-pulse" />
                <UserCheck className="w-3.5 h-3.5 text-[#FF7A45]" />
                <span className="hidden sm:inline">{currentUser.role}</span>
                <ChevronDown className="w-3 h-3 text-[#A6A39C]" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#151517] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                  {/* User info */}
                  <div className="px-3 py-2.5 border-b border-white/8 mb-1">
                    <p className="text-xs font-bold text-[#F5F1EA]">{authUser?.name || currentUser.name}</p>
                    <p className="text-[10px] text-[#A6A39C]">{authUser?.email || currentUser.email}</p>
                    <span className="mt-1 inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FF4A1C]/10 text-[#FF7A45] border border-[#FF4A1C]/20">
                      {currentUser.role}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#6E6C68] uppercase tracking-wider px-3 py-1 block">
                    Switch Persona
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
                            loginAsDemo(role);
                          }
                          setIsRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                          currentUser.role === role
                            ? 'bg-[#FF4A1C] text-[#F5F1EA] font-semibold'
                            : 'text-[#A6A39C] hover:text-[#F5F1EA] hover:bg-white/5'
                        }`}
                      >
                        <span>{role}</span>
                        {currentUser.role === role && <UserCheck className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-white/8 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Off-White CTA Pill Button */}
            <button
              onClick={() => navigate('/quotes/new')}
              className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 bg-[#F5F1EA] hover:opacity-90 text-[#0A0A0B] text-xs font-semibold rounded-full shadow-sm hover:-translate-y-0.5 transition-all whitespace-nowrap"
            >
              + Create Quote
            </button>
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
