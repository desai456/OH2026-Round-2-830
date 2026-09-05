import React, { useState } from 'react';
import { CreditCard, Calendar, Repeat, ArrowUpRight, Calculator, Check } from 'lucide-react';
import { calculateProration } from '../../utils/calculations';
import { Badge, Button, Card } from '../ui';

export function HybridBillingCard() {
  const [currentSeats, setCurrentSeats] = useState(10);
  const [newSeats, setNewSeats] = useState(15);
  const ratePerSeat = 200; // $200/mo

  const proration = calculateProration(currentSeats, newSeats, ratePerSeat, 14, 30);

  return (
    <div className="space-y-6">
      {/* Hybrid Billing Breakdown Card */}
      <Card className="border-white/8 dark:border-white/8 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-white/8 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#F5F1EA] dark:text-[#F5F1EA]">Hybrid Billing Schedule</h3>
              <p className="text-xs text-[#A6A39C] dark:text-[#6E6C68] mt-0.5">Separates one-time deliverables from recurring subscription schedules</p>
            </div>
          </div>
          <Badge variant="primary">One-Time + Recurring</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          {/* Section 1: One-Time Charges */}
          <div className="p-4 rounded-xl bg-[#1C1C1E] dark:bg-[#1C1C1E] border border-white/8 dark:border-white/10/70 space-y-3">
            <div className="flex items-center justify-between border-b border-white/8 dark:border-white/10 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A6A39C]">One-Time Deliverables</span>
              <Badge variant="outline" size="sm">Fixed Invoice</Badge>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A6A39C] dark:text-[#F5F1EA]">Enterprise Laptop Pro 16 (10x)</span>
                <span className="font-semibold text-[#F5F1EA] dark:text-[#F5F1EA]">$80,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A6A39C] dark:text-[#F5F1EA]">Setup & Onboarding Service</span>
                <span className="font-semibold text-[#F5F1EA] dark:text-[#F5F1EA]">$5,000</span>
              </div>
            </div>
            <div className="pt-3 border-t border-white/8 dark:border-white/10 flex justify-between font-bold text-sm text-[#F5F1EA] dark:text-[#F5F1EA]">
              <span>One-Time Total</span>
              <span className="text-blue-600 dark:text-blue-400">$85,000</span>
            </div>
          </div>

          {/* Section 2: Subscription Recurring */}
          <div className="p-4 rounded-xl bg-[#1C1C1E] dark:bg-[#1C1C1E] border border-white/8 dark:border-white/10/70 space-y-3">
            <div className="flex items-center justify-between border-b border-white/8 dark:border-white/10 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A6A39C]">Subscription Recurring</span>
              <Badge variant="success" size="sm">Auto-Renewing</Badge>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A6A39C] dark:text-[#F5F1EA]">Premium Support & SLA</span>
                <span className="font-semibold text-[#F5F1EA] dark:text-[#F5F1EA]">$2,000 / month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A6A39C]">Next Billing Cycle</span>
                <span className="text-[#A6A39C] dark:text-[#F5F1EA] font-medium">12 Oct 2026</span>
              </div>
            </div>
            <div className="pt-3 border-t border-white/8 dark:border-white/10 flex justify-between items-baseline">
              <span className="text-xs text-[#A6A39C]">Monthly (MRR) / Annual (ARR)</span>
              <div className="text-right">
                <span className="font-black text-sm text-[#F5F1EA] dark:text-[#F5F1EA]">$2,000<span className="text-xs font-normal text-[#6E6C68]">/mo</span></span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">($24,000 ARR)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Proration Calculation Card */}
      <Card className="border-indigo-200/80 dark:border-indigo-900/60 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-white/8 dark:border-white/8">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-[#F5F1EA] dark:text-[#F5F1EA] uppercase tracking-wider">
              Mid-Cycle Subscription Proration Engine
            </h3>
          </div>
          <Badge variant="info" size="sm">Real-Time Financial Card</Badge>
        </div>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A6A39C] dark:text-[#6E6C68]">Upgrade Seat Expansion:</span>
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#F5F1EA] dark:text-[#F5F1EA]">{currentSeats} Seats</span>
              <span>→</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setNewSeats(Math.max(currentSeats, newSeats - 1))}
                  className="px-2 py-0.5 rounded bg-slate-200 dark:bg-[#2C2C2E] font-bold text-xs"
                >
                  -
                </button>
                <span className="font-bold text-blue-600 text-sm px-1">{newSeats} Seats</span>
                <button
                  onClick={() => setNewSeats(newSeats + 1)}
                  className="px-2 py-0.5 rounded bg-slate-200 dark:bg-[#2C2C2E] font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="p-2.5 rounded-lg bg-[#1C1C1E] dark:bg-[#1C1C1E] text-center">
              <span className="text-[10px] text-[#6E6C68] block font-semibold uppercase">Current Rate</span>
              <span className="text-sm font-bold text-[#F5F1EA] dark:text-[#F5F1EA]">${proration.currentMonthly}/mo</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1C1C1E] dark:bg-[#1C1C1E] text-center">
              <span className="text-[10px] text-[#6E6C68] block font-semibold uppercase">New Rate</span>
              <span className="text-sm font-bold text-[#F5F1EA] dark:text-[#F5F1EA]">${proration.newMonthly}/mo</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1C1C1E] dark:bg-[#1C1C1E] text-center">
              <span className="text-[10px] text-[#6E6C68] block font-semibold uppercase">Remaining</span>
              <span className="text-sm font-bold text-[#F5F1EA] dark:text-[#F5F1EA]">14 of 30 Days</span>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-center border border-indigo-200 dark:border-indigo-800">
              <span className="text-[10px] text-indigo-700 dark:text-indigo-300 block font-bold uppercase">Net Adjustment</span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-300">+${proration.proratedCharge}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
