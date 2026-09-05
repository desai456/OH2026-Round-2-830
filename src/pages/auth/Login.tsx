import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, ArrowRight, Lock, Mail, Sparkles, Building2, UserCheck } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Button } from '../../components/ui';

export default function Login() {
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans antialiased">
      {/* LEFT COLUMN: Enterprise Value Pitch */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black tracking-wider text-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            DF
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
              DEALFLOW360
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                ENTERPRISE CPQ
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Intelligent & Self-Governing Sales Operations</p>
          </div>
        </div>

        {/* Hero Copy & Key Features */}
        <div className="space-y-8 relative z-10 max-w-lg">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
              Intelligent Sales Operations, <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
                From Quote to Cash.
              </span>
            </h2>
            <p className="text-slate-400 mt-4 text-sm leading-relaxed">
              Automate complex transactional pricing, enforce real-time discount governance, and orchestrate multi-tiered approval chains in seconds.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              'Smart Quoting & Transaction Line Editor',
              'Discount Governance & Self-Governing Risk Engine',
              'Sequential & Parallel Automated Approvals',
              'Real-Time Margin Intelligence & Anomaly Detection',
              'Multi-Depot Fulfillment & Hybrid Billing Optimization',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-xs font-semibold text-slate-200">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-500 relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-6">
          <span>© 2026 DealFlow360 Technologies Inc.</span>
          <span>Enterprise SaaS Grade</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Card & Demo Role Fast Switcher */}
      <div className="w-full lg:w-1/2 p-6 sm:p-12 flex flex-col justify-center items-center bg-slate-900">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <h3 className="text-2xl font-black text-white tracking-tight">Sign in to your workspace</h3>
            <p className="text-xs text-slate-400 mt-1">Enter your credentials or choose a fast demo role persona below.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0" />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="text-blue-400 hover:underline font-medium">Forgot password?</a>
            </div>

            <Button type="submit" variant="primary" className="w-full font-bold py-2.5">
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Demo Roles Fast Switcher */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Instant Demo Fast-Switcher (Select Persona)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {demoRoles.map(item => (
                <button
                  key={item.role}
                  onClick={() => handleDemoRoleClick(item.role)}
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-blue-300">{item.title}</span>
                    <UserCheck className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
