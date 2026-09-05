import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ShieldAlert,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Activity,
  User,
  TrendingUp,
  DollarSign,
  BarChart2,
  CheckCircle2,
  Clock,
  Warehouse,
  CreditCard,
  ArrowUpRight,
  Zap,
  Target,
  Users,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CUSTOMERS } from '../../data/mockData';
import { Badge, Button, Card } from '../../components/ui';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid
} from 'recharts';

const pipelineData = [
  { month: 'Apr', value: 480000 },
  { month: 'May', value: 620000 },
  { month: 'Jun', value: 590000 },
  { month: 'Jul', value: 840000 },
  { month: 'Aug', value: 980000 },
  { month: 'Sep', value: 1240000 },
];

const repPerformance = [
  { name: 'Alex M.', closed: 580000, pipeline: 320000 },
  { name: 'Sam S.', closed: 420000, pipeline: 210000 },
  { name: 'Taylor R.', closed: 310000, pipeline: 180000 },
];

const QUICK_ACTIONS = {
  'Sales Rep': [
    { label: '+ New Quote', path: '/quotes/new', variant: 'primary' as const, icon: Plus },
    { label: 'My Quotes', path: '/quotes', variant: 'secondary' as const, icon: FileText },
    { label: 'Product Catalog', path: '/products', variant: 'secondary' as const, icon: Sparkles },
  ],
  'Sales Manager': [
    { label: 'Pending Approvals', path: '/approvals', variant: 'primary' as const, icon: ShieldAlert },
    { label: 'View Pipeline', path: '/quotes', variant: 'secondary' as const, icon: FileText },
    { label: 'Team Reports', path: '/reports', variant: 'secondary' as const, icon: BarChart2 },
  ],
  'Finance': [
    { label: 'Pending Approvals', path: '/approvals', variant: 'primary' as const, icon: ShieldAlert },
    { label: 'Revenue Reports', path: '/reports', variant: 'secondary' as const, icon: BarChart2 },
    { label: 'Invoices', path: '/invoices', variant: 'secondary' as const, icon: CreditCard },
  ],
  'Operations': [
    { label: 'Fulfillment Queue', path: '/fulfillment', variant: 'primary' as const, icon: Warehouse },
    { label: 'View Invoices', path: '/invoices', variant: 'secondary' as const, icon: CreditCard },
    { label: 'Deal Health', path: '/health', variant: 'secondary' as const, icon: Activity },
  ],
  'Admin': [
    { label: '+ New Quote', path: '/quotes/new', variant: 'primary' as const, icon: Plus },
    { label: 'Admin Config', path: '/admin/rules', variant: 'secondary' as const, icon: Users },
    { label: 'Reports', path: '/reports', variant: 'secondary' as const, icon: BarChart2 },
  ],
  'Customer': [
    { label: 'View My Proposal', path: '/customer/portal', variant: 'primary' as const, icon: FileText },
  ],
};

export default function Dashboard() {
  const { currentUser, quotes, createQuote, setSelectedQuoteId } = useAppContext();
  const { authUser } = useAuth();
  const navigate = useNavigate();

  const displayName = authUser?.name || currentUser.name;
  const role = currentUser.role;

  const handleCreateNewQuote = () => {
    const newQuote = createQuote(CUSTOMERS[0].id);
    setSelectedQuoteId(newQuote.id);
    navigate(`/quotes/${newQuote.id}`);
  };

  const pendingApprovalsCount = quotes.filter(q => q.status === 'Pending Approval').length;
  const activeQuotes = quotes.filter(q => !['Paid', 'Rejected'].includes(q.status)).length;
  const atRiskCount = quotes.filter(q => q.status === 'Under Negotiation').length;
  const closedWon = quotes.filter(q => q.status === 'Paid').length;

  const recentActivity = [
    { id: '1', timestamp: '10:48 AM', user: 'Alex Morgan', action: 'Submitted Q-1042 for governance approval review', type: 'approval' },
    { id: '2', timestamp: '10:15 AM', user: 'Sarah Vance', action: 'Approved tier discount on Q-1035 for Beta Industries', type: 'success' },
    { id: '3', timestamp: '09:30 AM', user: 'Marcus Brody', action: 'Submitted 20% counter-offer request on Q-1042', type: 'counter' },
    { id: '4', timestamp: 'Yesterday', user: 'David Ops', action: 'Allocated warehouse split: 60 Main WH / 40 East Depot', type: 'ops' },
    { id: '5', timestamp: 'Yesterday', user: 'Michael Sterling', action: 'Finance approved high-value Q-1038 deal at 82% margin', type: 'success' },
  ];

  const activityColor = (type: string) => {
    switch (type) {
      case 'approval': return 'bg-amber-500';
      case 'success': return 'bg-emerald-500';
      case 'counter': return 'bg-purple-500';
      case 'ops': return 'bg-sky-500';
      default: return 'bg-[#FF4A1C]';
    }
  };

  const quickActions = QUICK_ACTIONS[role] || QUICK_ACTIONS['Sales Rep'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(ellipse 60% 100% at 100% 50%, rgba(255,74,28,0.15) 0%, transparent 70%)'
          }}
        />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#FF7A45] uppercase tracking-widest">
                {role} Dashboard
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
            </div>
            <h1 className="text-2xl font-serif font-medium text-[#F5F1EA] tracking-tight">
              Welcome back, {displayName.split(' ')[0]} 👋
            </h1>
            <p className="text-xs text-[#A6A39C] mt-1">
              Sales Operations Command Center · Self-governing rules active · Real-time governance
            </p>
          </div>
          <div className="flex items-center gap-2">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant={action.variant}
                  size="sm"
                  onClick={() => {
                    if (action.path === '/quotes/new') handleCreateNewQuote();
                    else navigate(action.path);
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#FF4A1C]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A6A39C]">Pending Approvals</span>
            <ShieldAlert className="w-4 h-4 text-[#FF7A45]" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold tabular-nums text-[#F5F1EA]">{pendingApprovalsCount}</span>
            <button onClick={() => navigate('/approvals')} className="text-[11px] text-[#FF7A45] hover:underline font-semibold flex items-center gap-1">
              Review <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[11px] text-[#A6A39C] mt-1 block">Awaiting governance sign-off</span>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A6A39C]">Active Quotes</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold tabular-nums text-[#F5F1EA]">{activeQuotes}</span>
            <button onClick={() => navigate('/quotes')} className="text-[11px] text-sky-400 hover:underline font-semibold flex items-center gap-1">
              View <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[11px] text-[#A6A39C] mt-1 block">In pipeline right now</span>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Under Negotiation</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold tabular-nums text-amber-400">{atRiskCount}</span>
            <button onClick={() => navigate('/health')} className="text-[11px] text-amber-400 hover:underline font-semibold flex items-center gap-1">
              Monitor <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[11px] text-amber-300/70 mt-1 block">Counter-offers pending</span>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A6A39C]">Closed Won</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold tabular-nums text-emerald-400">{closedWon}</span>
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +23%
            </span>
          </div>
          <span className="text-[11px] text-[#A6A39C] mt-1 block">Paid this quarter</span>
        </Card>
      </div>

      {/* Middle: Chart + Pipeline Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-[#F5F1EA] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#FF4A1C]" />
                Pipeline Revenue Trend
              </h3>
              <p className="text-[11px] text-[#A6A39C] mt-0.5">Cumulative contract value · Q2–Q3 2026</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#F5F1EA] font-serif">$1.24M</p>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% YoY
              </span>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipelineData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4A1C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF4A1C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#6E6C68" fontSize={11} />
                <YAxis stroke="#6E6C68" fontSize={11} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151517', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F5F1EA', fontSize: '12px' }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Pipeline Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#FF4A1C" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#FF4A1C', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI-Governed Deal Intelligence Panel */}
        <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#F5F1EA] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF4A1C]" />
              Governance Engine
            </h3>
            <Badge variant="success" size="sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
              Active
            </Badge>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Tier Discount Rules', status: 'Enforced', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Finance Approval Gate', status: 'Standing By', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { label: 'Rep Anomaly Monitor', status: '1 Alert', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
              { label: 'Multi-WH Optimizer', status: 'Ready', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
              { label: 'Hybrid Billing Engine', status: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            ].map(item => (
              <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl border text-xs ${item.bg}`}>
                <span className="text-[#A6A39C] font-medium">{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/admin/rules')}
            className="w-full py-2 text-xs font-semibold text-[#A6A39C] hover:text-[#F5F1EA] border border-white/8 hover:border-white/20 rounded-xl transition-all"
          >
            Configure Rules →
          </button>
        </div>
      </div>

      {/* Bottom Row: Sales Rep Performance + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Rep Performance */}
        <div className="lg:col-span-2 bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <h3 className="font-semibold text-sm text-[#F5F1EA] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#FF4A1C]" />
              Rep Performance
            </h3>
            <Badge variant="info" size="sm">Q3 2026</Badge>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repPerformance} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#6E6C68" fontSize={10} />
                <YAxis stroke="#6E6C68" fontSize={10} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151517', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F5F1EA', fontSize: '12px' }}
                />
                <Bar dataKey="closed" name="Closed" fill="#FF4A1C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pipeline" name="Pipeline" fill="rgba(255,74,28,0.25)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#FF4A1C]" />Closed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#FF4A1C]/25" />Pipeline</span>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-3 bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <h3 className="font-semibold text-sm text-[#F5F1EA] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF4A1C]" />
              Live Activity Feed
            </h3>
            <Badge variant="outline" size="sm">System Audit</Badge>
          </div>

          <div className="space-y-1">
            {recentActivity.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors group">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${activityColor(item.type)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-[#F5F1EA]">{item.user}</span>
                  </div>
                  <span className="text-[11px] text-[#A6A39C] leading-relaxed">{item.action}</span>
                </div>
                <span className="text-[10px] text-[#6E6C68] font-mono shrink-0">{item.timestamp}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/health')}
            className="w-full py-2 text-xs font-semibold text-[#A6A39C] hover:text-[#F5F1EA] border border-white/8 hover:border-white/20 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            View Full Deal Health Monitor <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Role-specific bottom banner */}
      {(role === 'Sales Manager' || role === 'Finance') && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[20px] p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#F5F1EA]">
                {pendingApprovalsCount} quotation{pendingApprovalsCount !== 1 ? 's' : ''} waiting for your approval
              </p>
              <p className="text-xs text-[#A6A39C] mt-0.5">
                Some contain high-value discount requests requiring {role} sign-off
              </p>
            </div>
          </div>
          <Button variant="accent" size="sm" onClick={() => navigate('/approvals')}>
            Review Now <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {role === 'Operations' && (
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-[20px] p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Warehouse className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#F5F1EA]">1 order awaiting warehouse fulfillment</p>
              <p className="text-xs text-[#A6A39C] mt-0.5">Q-1042 Acme Corp — 100 units across 2 depots</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/fulfillment')}>
            Open Fulfillment <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
