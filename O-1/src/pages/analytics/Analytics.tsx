import React from 'react';
import { BarChart3, TrendingUp, DollarSign, PieChart, Users, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { Badge, Card } from '../../components/ui';

export default function Analytics() {
  const categoryData = [
    { category: 'Hardware', revenue: 640000, margin: 38 },
    { category: 'Service', revenue: 220000, margin: 28 },
    { category: 'Subscription', revenue: 380000, margin: 55 },
  ];

  const repData = [
    { name: 'Alex Morgan', quotes: 14, revenue: 580000, avgDiscount: 8.4 },
    { name: 'Sam Sales', quotes: 10, revenue: 420000, avgDiscount: 6.2 },
    { name: 'Taylor Rep', quotes: 8, revenue: 310000, avgDiscount: 7.0 },
  ];

  const COLORS = ['#2563eb', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-[#F5F1EA] tracking-tight flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-[#FF4A1C]" />
            Revenue & Operations Analytics
          </h1>
          <p className="text-xs text-[#A6A39C] mt-1">
            Enterprise profitability metrics, category margins, and sales rep discount behavior
          </p>
        </div>
        <Badge variant="primary">Q3 2026 Analytics</Badge>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Revenue & Margin Chart */}
        <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <h3 className="font-semibold text-xs text-[#F5F1EA] uppercase tracking-wider">
              Category Revenue ($)
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

        {/* Rep Performance Chart */}
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
