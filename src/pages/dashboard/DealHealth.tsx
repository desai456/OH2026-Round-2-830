import React from 'react';
import { Activity, ShieldAlert, AlertTriangle, TrendingDown, UserX, Clock, ArrowRight } from 'lucide-react';
import { detectDiscountAnomaly } from '../../utils/calculations';
import { Badge, Button, Card } from '../../components/ui';

export default function DealHealth() {
  const anomaly = detectDiscountAnomaly('Alex Morgan', 18);

  const stalledDeals = [
    { id: 'q-1039', quoteNumber: 'Q-1039', customer: 'NovaTech', owner: 'Alex Morgan', lastActivity: '3 days ago', daysStalled: 14, riskScore: 45 },
    { id: 'q-1025', quoteNumber: 'Q-1025', customer: 'Globex', owner: 'Alex Morgan', lastActivity: '8 days ago', daysStalled: 22, riskScore: 65 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-600" />
            Deal Health & Governance Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time pipeline health monitoring, stalled deal detection, and discount anomaly algorithms
          </p>
        </div>
        <Badge variant="primary" size="lg">Self-Governing Engine Active</Badge>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Healthy Deals</span>
          <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1 block">18 Deals</span>
        </Card>

        <Card className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40">
          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">At Risk</span>
          <span className="text-2xl font-black text-rose-900 dark:text-rose-100 mt-1 block">5 Deals</span>
        </Card>

        <Card className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Stalled Deals</span>
          <span className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1 block">3 Deals</span>
        </Card>

        <Card className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40">
          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">Discount Anomalies</span>
          <span className="text-2xl font-black text-purple-900 dark:text-purple-100 mt-1 block">2 Reps</span>
        </Card>

        <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40">
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">Delivery Slippage</span>
          <span className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-1 block">1 Order</span>
        </Card>
      </div>

      {/* Signature Section: Discount Anomalies */}
      <Card className="border-purple-200 dark:border-purple-900/60 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Rep Discount Anomaly Detector
            </h3>
          </div>
          <Badge variant="danger" size="sm">ANOMALY DETECTED</Badge>
        </div>

        <div className="py-4 space-y-4">
          <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">Rep: {anomaly.repName}</span>
              <span className="text-slate-600 dark:text-slate-400 mt-0.5 block">
                Typical Rep Discount: <strong>{anomaly.typicalDiscount}%</strong> vs Current Deal Discount: <strong className="text-rose-600">{anomaly.currentDiscount}%</strong>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-purple-700 uppercase block">Variance Alert</span>
              <span className="text-lg font-black text-rose-600">+{anomaly.variance}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stalled Deals Table */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-md p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Stalled Pipeline Deals (&gt;10 Days Inactive)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b text-[11px] font-bold text-slate-500 uppercase">
                <th className="p-3">Quote #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Last Activity</th>
                <th className="p-3 text-center">Days Stalled</th>
                <th className="p-3 text-center">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stalledDeals.map(d => (
                <tr key={d.id}>
                  <td className="p-3 font-bold text-blue-600">{d.quoteNumber}</td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{d.customer}</td>
                  <td className="p-3 text-slate-600">{d.owner}</td>
                  <td className="p-3 text-slate-500">{d.lastActivity}</td>
                  <td className="p-3 text-center font-bold text-amber-600">{d.daysStalled} Days</td>
                  <td className="p-3 text-center">
                    <Badge variant="warning" size="sm">{d.riskScore}/100</Badge>
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
