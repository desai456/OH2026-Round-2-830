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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-[#F5F1EA] tracking-tight flex items-center gap-3">
            <Activity className="w-7 h-7 text-[#FF4A1C]" />
            Deal Health & Governance Operations
          </h1>
          <p className="text-xs text-[#A6A39C] mt-1">
            Real-time pipeline health monitoring, stalled deal detection, and discount anomaly algorithms
          </p>
        </div>
        <Badge variant="primary" size="lg">Self-Governing Engine Active</Badge>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-emerald-500 rounded-[20px] p-4">
          <span className="text-[10px] font-semibold text-[#A6A39C] uppercase tracking-wider block">Healthy Deals</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block font-serif">18 Deals</span>
        </div>

        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-rose-500 rounded-[20px] p-4">
          <span className="text-[10px] font-semibold text-[#A6A39C] uppercase tracking-wider block">At Risk</span>
          <span className="text-2xl font-bold text-rose-400 mt-1 block font-serif">5 Deals</span>
        </div>

        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-amber-500 rounded-[20px] p-4">
          <span className="text-[10px] font-semibold text-[#A6A39C] uppercase tracking-wider block">Stalled Deals</span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block font-serif">3 Deals</span>
        </div>

        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-purple-500 rounded-[20px] p-4">
          <span className="text-[10px] font-semibold text-[#A6A39C] uppercase tracking-wider block">Discount Anomalies</span>
          <span className="text-2xl font-bold text-purple-400 mt-1 block font-serif">2 Reps</span>
        </div>

        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-[#FF4A1C] rounded-[20px] p-4">
          <span className="text-[10px] font-semibold text-[#A6A39C] uppercase tracking-wider block">Delivery Slippage</span>
          <span className="text-2xl font-bold text-[#FF7A45] mt-1 block font-serif">1 Order</span>
        </div>
      </div>

      {/* Signature Section: Discount Anomalies */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/8">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-xs text-[#F5F1EA] uppercase tracking-wider">
              Rep Discount Anomaly Detector
            </h3>
          </div>
          <Badge variant="danger" size="sm">ANOMALY DETECTED</Badge>
        </div>

        <div className="p-4 rounded-xl bg-[#1C1C1E] border border-white/8 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#F5F1EA] text-sm block">Rep: {anomaly.repName}</span>
            <span className="text-[#A6A39C] mt-1 block">
              Typical Rep Discount: <strong>{anomaly.typicalDiscount}%</strong> vs Current Deal Discount: <strong className="text-rose-400">{anomaly.currentDiscount}%</strong>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-[#A6A39C] uppercase block">Variance Alert</span>
            <span className="text-lg font-bold text-rose-400">+{anomaly.variance}%</span>
          </div>
        </div>
      </div>

      {/* Stalled Deals Table */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
        <h3 className="font-semibold text-xs text-[#F5F1EA] uppercase tracking-wider">
          Stalled Pipeline Deals (&gt;10 Days Inactive)
        </h3>

        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121214] border-b border-white/8 text-[11px] font-semibold text-[#A6A39C] uppercase">
                <th className="p-3.5">Quote #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Owner</th>
                <th className="p-3.5">Last Activity</th>
                <th className="p-3.5 text-center">Days Stalled</th>
                <th className="p-3.5 text-center">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#F5F1EA]">
              {stalledDeals.map(d => (
                <tr key={d.id} className="hover:bg-white/[0.02]">
                  <td className="p-3.5 font-bold text-[#FF7A45]">{d.quoteNumber}</td>
                  <td className="p-3.5 font-bold text-[#F5F1EA]">{d.customer}</td>
                  <td className="p-3.5 text-[#A6A39C]">{d.owner}</td>
                  <td className="p-3.5 text-[#A6A39C]">{d.lastActivity}</td>
                  <td className="p-3.5 text-center font-bold text-amber-400">{d.daysStalled} Days</td>
                  <td className="p-3.5 text-center">
                    <Badge variant="warning" size="sm">{d.riskScore}/100</Badge>
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
