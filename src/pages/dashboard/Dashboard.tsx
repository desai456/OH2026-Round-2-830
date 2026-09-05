import React from 'react';
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
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { CUSTOMERS } from '../../data/mockData';
import { Badge, Button, Card } from '../../components/ui';

export default function Dashboard() {
  const { currentUser, quotes, createQuote, setSelectedQuoteId } = useAppContext();
  const navigate = useNavigate();

  const handleCreateNewQuote = () => {
    const newQuote = createQuote(CUSTOMERS[0].id);
    setSelectedQuoteId(newQuote.id);
    navigate(`/quotes/${newQuote.id}`);
  };

  const pendingApprovalsCount = quotes.filter(q => q.status === 'Pending Approval').length;

  const recentActivityLog = [
    { id: '1', timestamp: '10:48 AM', user: 'Alex Morgan', action: 'Submitted Q-1042 for governance approval review' },
    { id: '2', timestamp: '10:15 AM', user: 'Sarah Vance', action: 'Approved tier discount on Q-1035 for Beta Industries' },
    { id: '3', timestamp: '09:30 AM', user: 'Marcus Brody', action: 'Submitted 20% counter-offer request on Q-1042' },
    { id: '4', timestamp: 'Yesterday', user: 'David Ops', action: 'Allocated warehouse split: 60 Main WH / 40 East Depot' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-6 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#0F172A] dark:text-slate-100 tracking-tight">
            Sales Operations Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome, {currentUser.name} ({currentUser.role}). Real-time governance & pipeline state.
          </p>
        </div>
      </div>

      {/* 3 STAT/SUMMARY CARDS WITH ACCENT BARS (Screen 2 Excalidraw Wireframe Spec) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Pending Approvals (Neutral Accent) */}
        <Card className="border-l-4 border-l-slate-400 dark:border-l-slate-600 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Approvals</span>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#0F172A] dark:text-slate-100">{pendingApprovalsCount}</span>
            <span className="text-xs text-slate-500 font-medium">4 quotations waiting</span>
          </div>
        </Card>

        {/* Card 2: Open Quotations (Neutral Accent) */}
        <Card className="border-l-4 border-l-slate-400 dark:border-l-slate-600 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Open Quotations</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#0F172A] dark:text-slate-100">{quotes.length}</span>
            <span className="text-xs text-slate-500 font-medium">12 active deals</span>
          </div>
        </Card>

        {/* Card 3: At-Risk Deals (Amber Accent Signal) */}
        <Card className="border-l-4 border-l-[#D97706] p-5 space-y-2 bg-[#FFFBEB]/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">At-Risk Deals</span>
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#D97706]">3</span>
            <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold">3 flagged by Deal Health</span>
          </div>
        </Card>
      </div>

      {/* Button Pair Directly Under Cards per Wireframe Spec */}
      <div className="flex items-center gap-3">
        <Button onClick={handleCreateNewQuote} variant="primary" className="font-bold shadow-2xs">
          <Plus className="w-4 h-4" />
          <span>+ New Quotation</span>
        </Button>
        <Button onClick={() => navigate('/approvals')} variant="secondary" className="font-bold">
          <span>View Approvals</span>
        </Button>
      </div>

      {/* Recent Activity Feed per Wireframe Spec */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 pb-3">
          <h3 className="font-bold text-xs text-[#0F172A] dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#4F46E5]" />
            Recent Activity Log
          </h3>
          <Badge variant="outline" size="sm">System Audit</Badge>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-2">
          {recentActivityLog.map(item => (
            <div key={item.id} className="pt-2 flex items-start justify-between text-xs">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.user}</span>
                <span className="text-slate-500">{item.action}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
