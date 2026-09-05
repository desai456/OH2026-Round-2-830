import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, UserCheck, Sparkles, Info } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Button } from '../../components/ui';

export default function Login() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('alex.morgan@dealflow360.io');
  const [password, setPassword] = useState('••••••••••••');
  const { switchRole } = useAppContext();
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const handleDemoRoleClick = (role: UserRole) => {
    if (role === 'Customer') {
      navigate('/customer/portal');
    } else {
      switchRole(role);
      navigate('/dashboard');
    }
  };

  const demoRoles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'Sales Rep', title: 'Sales Rep', desc: 'Create & configure quotes' },
    { role: 'Sales Manager', title: 'Sales Manager', desc: 'Review & approve tier discounts' },
    { role: 'Finance', title: 'Finance', desc: 'Margin & risk governance' },
    { role: 'Operations', title: 'Operations', desc: 'Warehouse fulfillment' },
    { role: 'Admin', title: 'Admin', desc: 'Discount rules & pricing' },
    { role: 'Customer', title: 'Customer Portal', desc: 'Review & counter-offer' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 font-sans antialiased">
      {/* Centered Login Card per Excalidraw Wireframe Spec */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#4F46E5] text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
            DF
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#0F172A] dark:text-slate-100">DEALFLOW360</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Intelligent Sales Operations Platform</p>
        </div>

        {/* Log In / Sign Up Two-Tab Toggle */}
        <div className="flex bg-[#F8FAFC] dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login' ? 'bg-white dark:bg-slate-900 text-[#4F46E5] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'signup' ? 'bg-white dark:bg-slate-900 text-[#4F46E5] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#4F46E5] focus:ring-0" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="text-[#4F46E5] hover:underline font-semibold">Forgot Password?</a>
          </div>

          <Button type="submit" variant="primary" className="w-full font-bold py-2.5">
            <span>Log In</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Small Muted Info Strip per Wireframe Spec */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border-l-4 border-slate-300 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>After login, internal users land on Sales Dashboard. Customers land on Portal.</span>
        </div>

        {/* Instant Demo Fast-Switcher */}
        <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Or Click a Demo Role Persona
          </span>
          <div className="grid grid-cols-2 gap-2">
            {demoRoles.map(item => (
              <button
                key={item.role}
                onClick={() => handleDemoRoleClick(item.role)}
                className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#4F46E5]">{item.title}</span>
                  <UserCheck className="w-3 h-3 text-slate-400 group-hover:text-[#4F46E5]" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
