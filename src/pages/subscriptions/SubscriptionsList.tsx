import React, { useState } from 'react';
import { RefreshCw, Plus, Search, Filter, Calendar, Zap, AlertCircle, ArrowUpRight, CheckCircle2, PauseCircle } from 'lucide-react';
import { Badge, Button, Card, StatusTabs } from '../../components/ui';

interface Subscription {
  id: string;
  customer: string;
  plan: string;
  cycle: 'Monthly' | 'Annual';
  mrr: number;
  arr: number;
  status: 'Active' | 'Paused' | 'Cancelled';
  nextRenewal: string;
  startDate: string;
}

export default function SubscriptionsList() {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Paused' | 'Cancelled'>('Active');
  const [searchTerm, setSearchTerm] = useState('');

  const [subscriptions] = useState<Subscription[]>([
    { id: 'SUB-8901', customer: 'Acme Corp', plan: 'Enterprise Cloud Suite (Tier 1)', cycle: 'Annual', mrr: 12500, arr: 150000, status: 'Active', nextRenewal: '2027-03-15', startDate: '2026-03-15' },
    { id: 'SUB-8902', customer: 'Stark Industries', plan: 'Platinum Security & Analytics Add-on', cycle: 'Monthly', mrr: 4800, arr: 57600, status: 'Active', nextRenewal: '2026-10-01', startDate: '2025-10-01' },
    { id: 'SUB-8903', customer: 'Wayne Enterprises', plan: 'Core Platform - 500 Seats', cycle: 'Annual', mrr: 8500, arr: 102000, status: 'Active', nextRenewal: '2026-11-20', startDate: '2024-11-20' },
    { id: 'SUB-8904', customer: 'Cyberdyne Systems', plan: 'Custom AI Inference Workloads', cycle: 'Monthly', mrr: 6200, arr: 74400, status: 'Paused', nextRenewal: '2026-09-30', startDate: '2025-05-12' },
    { id: 'SUB-8905', customer: 'Initech LLC', plan: 'Starter Cloud Package', cycle: 'Monthly', mrr: 1200, arr: 14400, status: 'Cancelled', nextRenewal: 'N/A', startDate: '2024-01-10' },
  ]);

  const filteredSubs = subscriptions.filter(sub => {
    const matchesTab = activeTab === 'All' || sub.status === activeTab;
    const matchesSearch = sub.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sub.plan.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalMRR = subscriptions.filter(s => s.status === 'Active').reduce((acc, s) => acc + s.mrr, 0);
  const totalARR = subscriptions.filter(s => s.status === 'Active').reduce((acc, s) => acc + s.arr, 0);
  const activeCount = subscriptions.filter(s => s.status === 'Active').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <RefreshCw className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Subscriptions & Recurring Revenue
            </h1>
            <Badge variant="primary" size="sm">Screen 9</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage contract renewals, MRR/ARR trajectories, pause requests, and plan upgrades.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Calendar className="w-4 h-4 mr-1.5" />
            Renewal Calendar
          </Button>
          <div className="relative inline-flex items-center">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              New Plan
              <span className="ml-2 px-1.5 py-0.5 text-[10px] uppercase font-extrabold bg-indigo-800 text-indigo-100 rounded">
                Admin
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Active MRR
            </span>
            <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            ${totalMRR.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs last month
          </span>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Run-Rate ARR
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            ${totalARR.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Across {activeCount} active enterprise contracts
          </span>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Paused / Action Required
            </span>
            <PauseCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {subscriptions.filter(s => s.status === 'Paused').length} Contracts
          </p>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">
            Pending billing resolution or upgrade review
          </span>
        </Card>
      </div>

      {/* Status Filter Tabs & Search */}
      <Card padding="md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <StatusTabs
            tabs={[
              { id: 'Active', label: 'Active', count: subscriptions.filter(s => s.status === 'Active').length },
              { id: 'Paused', label: 'Paused', count: subscriptions.filter(s => s.status === 'Paused').length },
              { id: 'Cancelled', label: 'Cancelled', count: subscriptions.filter(s => s.status === 'Cancelled').length },
              { id: 'All', label: 'All Subscriptions', count: subscriptions.length },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
          />

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer, plan or sub ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Subscription ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Billing Cycle</th>
                <th className="py-3 px-4 text-right">MRR ($)</th>
                <th className="py-3 px-4 text-right">ARR ($)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Next Renewal</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {sub.id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {sub.customer}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {sub.plan}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sub.cycle}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    ${sub.mrr.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-600 dark:text-slate-400">
                    ${sub.arr.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    {sub.status === 'Active' && <Badge variant="success">Active</Badge>}
                    {sub.status === 'Paused' && <Badge variant="warning">Paused</Badge>}
                    {sub.status === 'Cancelled' && <Badge variant="danger">Cancelled</Badge>}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                    {sub.nextRenewal}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {sub.status === 'Active' && (
                      <>
                        <button className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                          Upgrade
                        </button>
                        <button className="px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                          Pause
                        </button>
                      </>
                    )}
                    {sub.status === 'Paused' && (
                      <button className="px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                        Resume
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
