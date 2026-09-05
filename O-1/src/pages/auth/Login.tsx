import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Mail, ArrowRight, UserCheck, Info, Eye, EyeOff,
  User, Building2, ChevronRight, Sparkles, ShieldCheck, AlertCircle,
  BarChart3, Warehouse, CreditCard, Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../types';

const roleDetails: {
  role: UserRole;
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  permissions: string[];
}[] = [
  {
    role: 'Sales Rep',
    title: 'Sales Rep',
    desc: 'Create & configure quotes',
    icon: UserCheck,
    color: 'text-[#FF7A45]',
    permissions: ['Create & edit quotes', 'View product catalog', 'Submit for approval'],
  },
  {
    role: 'Sales Manager',
    title: 'Sales Manager',
    desc: 'Review & approve tier discounts',
    icon: ShieldCheck,
    color: 'text-purple-400',
    permissions: ['All Sales Rep access', 'Approve/reject quotes', 'View team pipeline'],
  },
  {
    role: 'Finance',
    title: 'Finance',
    desc: 'Margin & risk governance',
    icon: BarChart3,
    color: 'text-emerald-400',
    permissions: ['All Manager access', 'Finance approval tier', 'View P&L reports'],
  },
  {
    role: 'Operations',
    title: 'Operations',
    desc: 'Warehouse fulfillment',
    icon: Warehouse,
    color: 'text-sky-400',
    permissions: ['Fulfillment management', 'Warehouse stock control', 'Dispatch scheduling'],
  },
  {
    role: 'Admin',
    title: 'Admin',
    desc: 'Discount rules & pricing',
    icon: Sliders,
    color: 'text-amber-400',
    permissions: ['Full platform access', 'Configure governance rules', 'Manage users & price books'],
  },
  {
    role: 'Customer',
    title: 'Customer Portal',
    desc: 'Review & counter-offer',
    icon: Building2,
    color: 'text-indigo-400',
    permissions: ['View proposals', 'Submit counter-offers', 'Confirm quotes'],
  },
];

export default function Login() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Sales Rep');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // signup: step 1 = info, step 2 = role

  const { login, signup, loginAsDemo } = useAuth();
  const { switchRole } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const ok = await login(email, password);
    setIsLoading(false);
    if (ok) {
      const stored = localStorage.getItem('dealflow360_auth');
      if (stored) {
        const user = JSON.parse(stored);
        switchRole(user.role);
        if (user.role === 'Customer') navigate('/customer/portal');
        else navigate('/dashboard');
      }
    } else {
      setError('Invalid email or password. Try a demo account below.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all required fields.');
        return;
      }
      setError('');
      setStep(2);
      return;
    }
    setIsLoading(true);
    setError('');
    const ok = await signup(name, email, password, selectedRole, company);
    setIsLoading(false);
    if (ok) {
      switchRole(selectedRole);
      if (selectedRole === 'Customer') navigate('/customer/portal');
      else navigate('/dashboard');
    } else {
      setError('An account with this email already exists.');
      setStep(1);
    }
  };

  const handleDemoRoleClick = (role: UserRole) => {
    loginAsDemo(role);
    switchRole(role);
    if (role === 'Customer') navigate('/customer/portal');
    else navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen text-[#F5F1EA] flex flex-col justify-center items-center p-4 font-sans antialiased relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,74,28,0.08) 0%, #0A0A0B 60%)' }}
    >
      {/* Background grid effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4A1C] to-[#E03A0E] text-white font-black text-xl flex items-center justify-center shadow-2xl shadow-[#FF4A1C]/30 border border-white/10">
            DF
          </div>
          <div>
            <h1 className="text-2xl font-serif tracking-tight text-[#F5F1EA] flex items-center gap-2">
              DEALFLOW<span className="text-[#FF7A45]">360</span>
              <span className="text-[9px] font-sans tracking-widest px-2 py-0.5 rounded-full bg-[#1C1C1E] text-[#A6A39C] border border-white/8 font-bold uppercase">
                CPQ
              </span>
            </h1>
            <p className="text-xs text-[#A6A39C]">Intelligent Sales Operations Platform</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#151517]/90 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl shadow-black/50 overflow-hidden">
        {/* Tab Toggle */}
        <div className="flex bg-[#0E0E10] border-b border-white/8">
          <button
            onClick={() => { setTab('login'); setError(''); setStep(1); }}
            className={`flex-1 py-3.5 text-xs font-bold transition-all ${
              tab === 'login'
                ? 'text-[#F5F1EA] border-b-2 border-[#FF4A1C] bg-[#151517]/60'
                : 'text-[#A6A39C] hover:text-[#F5F1EA]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(''); setStep(1); }}
            className={`flex-1 py-3.5 text-xs font-bold transition-all ${
              tab === 'signup'
                ? 'text-[#F5F1EA] border-b-2 border-[#FF4A1C] bg-[#151517]/60'
                : 'text-[#A6A39C] hover:text-[#F5F1EA]'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-7 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider block mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A6A39C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.io"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-xs text-[#F5F1EA] placeholder-[#6E6C68] focus:outline-none focus:border-[#FF4A1C] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A6A39C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-xs text-[#F5F1EA] placeholder-[#6E6C68] focus:outline-none focus:border-[#FF4A1C] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A6A39C] hover:text-[#F5F1EA]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#A6A39C]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-white/10 accent-[#FF4A1C]" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="text-[#FF7A45] hover:underline font-semibold text-[11px]">
                  Forgot Password?
                </button>
              </div>

              <button
                id="btn-login"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
              >
                {isLoading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              {step === 1 && (
                <>
                  {/* Step indicator */}
                  <div className="flex items-center gap-2 text-[11px] text-[#A6A39C] mb-1">
                    <span className="w-5 h-5 rounded-full bg-[#FF4A1C] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    <span className="text-[#F5F1EA] font-semibold">Personal Info</span>
                    <span className="flex-1 h-px bg-white/8" />
                    <span className="w-5 h-5 rounded-full bg-white/10 text-[#A6A39C] flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Select Role</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider block mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#A6A39C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="signup-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-xs text-[#F5F1EA] placeholder-[#6E6C68] focus:outline-none focus:border-[#FF4A1C] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider block mb-1.5">
                      Work Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#A6A39C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@company.io"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-xs text-[#F5F1EA] placeholder-[#6E6C68] focus:outline-none focus:border-[#FF4A1C] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider block mb-1.5">
                      Company (Optional)
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-[#A6A39C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-xs text-[#F5F1EA] placeholder-[#6E6C68] focus:outline-none focus:border-[#FF4A1C] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider block mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#A6A39C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-xs text-[#F5F1EA] placeholder-[#6E6C68] focus:outline-none focus:border-[#FF4A1C] transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A6A39C] hover:text-[#F5F1EA]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="btn-next-step"
                    type="submit"
                    className="w-full py-3 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Next: Select Your Role</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Step indicator */}
                  <div className="flex items-center gap-2 text-[11px] text-[#A6A39C] mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span className="text-[#A6A39C]">Personal Info</span>
                    <span className="flex-1 h-px bg-white/8" />
                    <span className="w-5 h-5 rounded-full bg-[#FF4A1C] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                    <span className="text-[#F5F1EA] font-semibold">Select Role</span>
                  </div>

                  <p className="text-xs text-[#A6A39C]">
                    Choose your role. This determines what you can access in DealFlow360.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {roleDetails.map(item => {
                      const Icon = item.icon;
                      const isSelected = selectedRole === item.role;
                      return (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => setSelectedRole(item.role)}
                          className={`p-3 rounded-xl text-left transition-all border ${
                            isSelected
                              ? 'bg-[#FF4A1C]/10 border-[#FF4A1C]/40 shadow-sm shadow-[#FF4A1C]/10'
                              : 'bg-[#1C1C1E] border-white/8 hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FF7A45]' : item.color}`} />
                            <span className={`text-[11px] font-bold ${isSelected ? 'text-[#FF7A45]' : 'text-[#F5F1EA]'}`}>
                              {item.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#A6A39C] leading-tight block">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Permissions for selected role */}
                  <div className="p-3 rounded-xl bg-[#1C1C1E] border border-white/8 text-[11px] space-y-1">
                    <span className="text-[#A6A39C] uppercase font-bold tracking-wider text-[10px]">
                      {selectedRole} Permissions:
                    </span>
                    {roleDetails.find(r => r.role === selectedRole)?.permissions.map(p => (
                      <div key={p} className="flex items-center gap-1.5 text-[#F5F1EA]">
                        <span className="text-[#FF4A1C]">✓</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-2.5 text-xs font-semibold rounded-full border border-white/14 text-[#F5F1EA] hover:bg-white/5 transition-all"
                    >
                      Back
                    </button>
                    <button
                      id="btn-signup-submit"
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
                    >
                      {isLoading ? (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Create Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* Info strip */}
          <div className="p-3 rounded-xl bg-[#1C1C1E] border border-white/8 text-[11px] text-[#A6A39C] leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-[#FF4A1C] shrink-0 mt-0.5" />
            <span>
              {tab === 'login'
                ? 'Internal users land on the Sales Dashboard. Customers land on their Client Portal.'
                : 'Your role determines access levels. Admins can change roles for team members after login.'}
            </span>
          </div>

          {/* Demo Role Personas */}
          <div className="pt-1 space-y-2.5 border-t border-white/8">
            <span className="text-[10px] font-semibold text-[#A6A39C] uppercase tracking-wider block text-center">
              Quick Demo — Click Any Persona
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {roleDetails.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.role}
                    id={`demo-${item.role.toLowerCase().replace(' ', '-')}`}
                    onClick={() => handleDemoRoleClick(item.role)}
                    className="p-2.5 rounded-xl bg-[#1C1C1E] hover:bg-white/5 border border-white/8 hover:border-white/20 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        <span className="text-[11px] font-semibold text-[#F5F1EA] group-hover:text-[#FF7A45]">
                          {item.title}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-[#A6A39C] group-hover:text-[#FF7A45] opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <span className="text-[10px] text-[#A6A39C] block mt-0.5">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-[11px] text-[#6E6C68] text-center">
        DealFlow360 · Enterprise Sales Operations · All data is demo/simulation only
      </p>
    </div>
  );
}
