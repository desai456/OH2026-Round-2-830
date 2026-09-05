import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  FileText,
  ShieldAlert,
  AlertTriangle,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { CUSTOMERS } from '../../data/mockData';
import { Badge, Button, Card } from '../../components/ui';

export default function Dashboard() {
  const { currentUser, quotes, createQuote, setSelectedQuoteId, getQuoteMetrics } = useAppContext();
  const navigate = useNavigate();

  const handleCreateNewQuote = () => {
    const newQuote = createQuote(CUSTOMERS[0].id);
    setSelectedQuoteId(newQuote.id);
    navigate(`/quotes/${newQuote.id}`);
  };

  const revenueData = [
    { month: 'Jan', revenue: 420000, target: 400000 },
    { month: 'Feb', revenue: 510000, target: 450000 },
    { month: 'Mar', revenue: 480000, target: 460000 },
    { month: 'Apr', revenue: 620000, target: 500000 },
    { month: 'May', revenue: 590000, target: 520000 },
    { month: 'Jun', revenue: 740000, target: 550000 },
    { month: 'Jul', revenue: 880000, target: 600000 },
    { month: 'Aug', revenue: 1050000, target: 700000 },
    { month: 'Sep', revenue: 1240000, target: 800000 },
  ];

  const pendingApprovalsCount = quotes.filter(q => q.status === 'Pending Approval').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Good morning, {currentUser.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Here's your intelligent sales operations & governance overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={handleCreateNewQuote} variant="primary" className="font-bold shadow-xs">
            <Plus className="w-4 h-4" />
            <span>+ New Quotation</span>
          </Button>
          <Button onClick={() => navigate('/quotes')} variant="outline">
            <span>View Pipeline</span>
          </Button>
        </div>
      </div>

      {/* KPI CARDS (6 Key Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* KPI 1 */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-900 dark:text-slate-100">$1.24M</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14.2% YoY
            </span>
          </div>
        </Card>

        {/* KPI 2 */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Open Quotes</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-900 dark:text-slate-100">{quotes.length}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Active in pipeline</span>
          </div>
        </Card>

        {/* KPI 3 */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Approvals</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{pendingApprovalsCount}</span>
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold block mt-0.5">Requires review</span>
          </div>
        </Card>

        {/* KPI 4 */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">At-Risk Deals</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-rose-600 dark:text-rose-400">5</span>
            <span className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold block mt-0.5">Category variance</span>
          </div>
        </Card>

        {/* KPI 5 */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Expected Rev</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-900 dark:text-slate-100">$486K</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Weighted probability</span>
          </div>
        </Card>

        {/* KPI 6 */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Average Margin</span>
            <PieChart className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-900 dark:text-slate-100">34.8%</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">Healthy &gt;30%</span>
          </div>
        </Card>
      </div>

      {/* Intelligence Insights Alert Box */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/50 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">DealFlow AI Governance Insights</h4>
          <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
            <strong>3 quotations require governance approval today.</strong> Quote <strong className="text-blue-600">Q-1042</strong> exceeds the service discount threshold by <strong>8 percentage points</strong>.
          </p>
        </div>
        <Button onClick={() => navigate('/approvals')} variant="primary" size="sm">
          Review Work Items
        </Button>
      </div>

      {/* Main Grid: Revenue Chart + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart (2 cols) */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Revenue & Pipeline Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monthly booked revenue vs target pipeline</p>
            </div>
            <Badge variant="success">Target Exceeded</Badge>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={val => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Booked Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Approval Queue Widget (1 col) */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Approval Work Items
              </h3>
              <Badge variant="warning" size="sm">{pendingApprovalsCount} Pending</Badge>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 my-2">
              {quotes.map(q => {
                const metrics = getQuoteMetrics(q);
                const cust = CUSTOMERS.find(c => c.id === q.customerId);
                return (
                  <div key={q.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-blue-600 dark:text-blue-400 block">{q.quoteNumber}</span>
                      <span className="text-[11px] text-slate-500">{cust?.name} • ${metrics.contractValue.toLocaleString()}</span>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedQuoteId(q.id);
                        navigate(`/quotes/${q.id}`);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Review
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
          <Button onClick={() => navigate('/approvals')} variant="secondary" className="w-full text-xs font-bold mt-2">
            Open Approval Workspace
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
