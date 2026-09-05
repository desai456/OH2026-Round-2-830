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
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif text-[#F5F1EA] tracking-tight flex items-center gap-3">
              <RefreshCw className="w-7 h-7 text-[#FF4A1C]" />
              Subscriptions & Recurring Revenue
            </h1>
            <Badge variant="primary" size="sm">Screen 9</Badge>
          </div>
          <p className="text-xs text-[#A6A39C] mt-1">
            Manage contract renewals, MRR/ARR trajectories, pause requests, and plan upgrades.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-[#F5F1EA] hover:bg-white/5 transition-all flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#A6A39C]" />
            <span>Renewal Calendar</span>
          </button>
          <button className="px-5 py-2 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>New Plan</span>
            <span className="ml-1 px-1.5 py-0.5 text-[9px] uppercase font-bold bg-[#0A0A0B] text-white rounded-full">
              Admin
            </span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-[#FF4A1C] rounded-[20px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
              Total Active MRR
            </span>
            <Zap className="w-5 h-5 text-[#FF4A1C]" />
          </div>
          <p className="text-3xl font-bold text-[#F5F1EA] mt-2 font-serif">
            ${totalMRR.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs last month
          </span>
        </div>

        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-emerald-500 rounded-[20px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
              Run-Rate ARR
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-[#F5F1EA] mt-2 font-serif">
            ${totalARR.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#A6A39C] mt-1 block">
            Across {activeCount} active enterprise contracts
          </span>
        </div>

        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-amber-500 rounded-[20px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
              Paused / Action Required
            </span>
            <PauseCircle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-[#F5F1EA] mt-2 font-serif">
            {subscriptions.filter(s => s.status === 'Paused').length} Contracts
          </p>
          <span className="text-[11px] text-amber-400 font-semibold mt-1 block">
            Pending billing resolution or upgrade review
          </span>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-5">
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
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6A39C]" />
            <input
              type="text"
              placeholder="Search by customer, plan or sub ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-white/10 bg-[#1C1C1E] text-[#F5F1EA] placeholder-[#A6A39C] focus:outline-none focus:border-[#FF4A1C]"
            />
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/8 bg-[#121214] text-[#A6A39C] font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Subscription ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Plan Name</th>
                <th className="py-3.5 px-4">Billing Cycle</th>
                <th className="py-3.5 px-4 text-right">MRR ($)</th>
                <th className="py-3.5 px-4 text-right">ARR ($)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Next Renewal</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#F5F1EA]">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#FF7A45]">
                    {sub.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#F5F1EA]">
                    {sub.customer}
                  </td>
                  <td className="py-3.5 px-4 text-[#A6A39C]">
                    {sub.plan}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1C1C1E] border border-white/10 text-[#F5F1EA]">
                      {sub.cycle}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#F5F1EA]">
                    ${sub.mrr.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-[#A6A39C]">
                    ${sub.arr.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {sub.status === 'Active' && <Badge variant="success">Active</Badge>}
                    {sub.status === 'Paused' && <Badge variant="warning">Paused</Badge>}
                    {sub.status === 'Cancelled' && <Badge variant="danger">Cancelled</Badge>}
                  </td>
                  <td className="py-3.5 px-4 text-[#A6A39C] font-mono text-[11px]">
                    {sub.nextRenewal}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {sub.status === 'Active' && (
                      <>
                        <button className="px-2 py-1 text-[11px] font-bold text-[#FF7A45] hover:underline">
                          Upgrade
                        </button>
                        <button className="px-2 py-1 text-[11px] font-bold text-amber-400 hover:underline">
                          Pause
                        </button>
                      </>
                    )}
                    {sub.status === 'Paused' && (
                      <button className="px-2 py-1 text-[11px] font-bold text-emerald-400 hover:underline">
                        Resume
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
