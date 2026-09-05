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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Reports & Executive Revenue Analytics
            </h1>
            <Badge variant="primary" size="sm">Screen 15</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise profitability metrics, category margins, deal velocity, and discount compliance reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV / XLS
          </Button>
          <Button variant="primary" size="sm">
            <Download className="w-4 h-4 mr-1.5" />
            Export PDF Report
          </Button>
        </div>
      </div>

      {/* 4-Select Filter Bar */}
      <Card padding="md">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <Filter className="w-4 h-4 text-indigo-600" />
            Report Filters:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option>Q3 2026</option>
                <option>YTD 2026</option>
                <option>Q2 2026</option>
                <option>Full Year 2025</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option>Global (All)</option>
                <option>North America (NA)</option>
                <option>EMEA</option>
                <option>APAC</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sales Rep</label>
              <select
                value={repFilter}
                onChange={(e) => setRepFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option>All Reps</option>
                <option>Alex Morgan</option>
                <option>Sam Sales</option>
                <option>Taylor Rep</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Product Family</label>
              <select
                value={familyFilter}
                onChange={(e) => setFamilyFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option>All Families</option>
                <option>Hardware Servers</option>
                <option>Software Subscriptions</option>
                <option>Professional Services</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Contract Revenue
            </span>
            <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            $1,240,000
          </p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% YoY Growth
          </span>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg Blended Discount %
            </span>
            <Percent className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            7.2%
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Well within 15% target ceiling limit
          </span>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Deal Velocity (Days)
            </span>
            <Clock className="w-5 h-5 text-cyan-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            4.2 Days
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Average time from Quote Creation to Sign-Off
          </span>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Category Revenue Breakdown ($)
            </h3>
            <Badge variant="info" size="sm">Product Breakdown</Badge>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Sales Rep Revenue Contribution ($)
            </h3>
            <Badge variant="success" size="sm">Top Performers</Badge>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
