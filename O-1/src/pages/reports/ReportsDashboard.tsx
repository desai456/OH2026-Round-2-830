import React, { useState } from 'react';
import { BarChart3, Download, Filter, TrendingUp, Percent, Clock, DollarSign, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge, Button, Card } from '../../components/ui';

export default function ReportsDashboard() {
  const [timeRange, setTimeRange] = useState('Q3 2026');
  const [region, setRegion] = useState('Global');
  const [repFilter, setRepFilter] = useState('All Reps');
  const [familyFilter, setFamilyFilter] = useState('All Families');

  const categoryData = [
    { category: 'Hardware (Servers)', revenue: 640000, margin: 38 },
    { category: 'Software Subscriptions', revenue: 380000, margin: 55 },
    { category: 'Professional Services', revenue: 220000, margin: 28 },
  ];

  const repData = [
    { name: 'Alex Morgan', revenue: 580000, avgDiscount: 8.4 },
    { name: 'Sam Sales', revenue: 420000, avgDiscount: 6.2 },
    { name: 'Taylor Rep', revenue: 310000, avgDiscount: 7.0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif text-[#F5F1EA] tracking-tight flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-[#FF4A1C]" />
              Reports & Executive Revenue Analytics
            </h1>
            <Badge variant="primary" size="sm">Screen 15</Badge>
          </div>
          <p className="text-xs text-[#A6A39C] mt-1">
            Enterprise profitability metrics, category margins, deal velocity, and discount compliance reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-[#F5F1EA] hover:bg-white/5 transition-all flex items-center gap-2">
            <Download className="w-4 h-4 text-[#A6A39C]" />
            <span>Export CSV</span>
          </button>
          <button className="px-5 py-2 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* 4-Select Filter Bar */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F1EA] whitespace-nowrap">
            <Filter className="w-4 h-4 text-[#FF4A1C]" />
            Report Filters:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
            <div>
              <label className="block text-[10px] uppercase font-semibold text-[#A6A39C] mb-1">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-white/10 bg-[#1C1C1E] text-[#F5F1EA] focus:outline-none focus:border-[#FF4A1C]"
              >
                <option>Q3 2026</option>
                <option>YTD 2026</option>
                <option>Q2 2026</option>
                <option>Full Year 2025</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-[#A6A39C] mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-white/10 bg-[#1C1C1E] text-[#F5F1EA] focus:outline-none focus:border-[#FF4A1C]"
              >
                <option>Global (All)</option>
                <option>North America (NA)</option>
                <option>EMEA</option>
                <option>APAC</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-[#A6A39C] mb-1">Sales Rep</label>
              <select
                value={repFilter}
                onChange={(e) => setRepFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-white/10 bg-[#1C1C1E] text-[#F5F1EA] focus:outline-none focus:border-[#FF4A1C]"
              >
                <option>All Reps</option>
                <option>Alex Morgan</option>
                <option>Sam Sales</option>
                <option>Taylor Rep</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-[#A6A39C] mb-1">Product Family</label>
              <select
                value={familyFilter}
                onChange={(e) => setFamilyFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-white/10 bg-[#1C1C1E] text-[#F5F1EA] focus:outline-none focus:border-[#FF4A1C]"
              >
                <option>All Families</option>
                <option>Hardware Servers</option>
                <option>Software Subscriptions</option>
                <option>Professional Services</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-[#FF4A1C] rounded-[20px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
              Total Contract Revenue
            </span>
            <DollarSign className="w-5 h-5 text-[#FF4A1C]" />
          </div>
          <p className="text-3xl font-bold text-[#F5F1EA] mt-2 font-serif">
            $1,240,000
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% YoY Growth
          </span>
        </div>

        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-emerald-500 rounded-[20px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
              Avg Blended Discount %
            </span>
            <Percent className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-[#F5F1EA] mt-2 font-serif">
            7.2%
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            Well within 15% target ceiling limit
          </span>
        </div>

        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-cyan-500 rounded-[20px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
              Deal Velocity (Days)
            </span>
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-[#F5F1EA] mt-2 font-serif">
            4.2 Days
          </p>
          <span className="text-[11px] text-[#A6A39C] mt-1 block">
            Average time from Quote Creation to Sign-Off
          </span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <h3 className="font-semibold text-xs text-[#F5F1EA] uppercase tracking-wider">
              Category Revenue Breakdown ($)
            </h3>
            <Badge variant="info" size="sm">Product Breakdown</Badge>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="category" stroke="#A6A39C" fontSize={11} />
                <YAxis stroke="#A6A39C" fontSize={11} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151517', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F5F1EA', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#FF4A1C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <h3 className="font-semibold text-xs text-[#F5F1EA] uppercase tracking-wider">
              Sales Rep Revenue Contribution ($)
            </h3>
            <Badge variant="success" size="sm">Top Performers</Badge>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repData}>
                <XAxis dataKey="name" stroke="#A6A39C" fontSize={11} />
                <YAxis stroke="#A6A39C" fontSize={11} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151517', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F5F1EA', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
