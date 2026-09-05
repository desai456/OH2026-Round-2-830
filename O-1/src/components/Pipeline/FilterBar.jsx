import React from 'react';
import { Filter, Calendar, UserCheck, ShieldCheck } from 'lucide-react';

export default function FilterBar({
  period = "this_month",
  onPeriodChange,
  salesRep = "All",
  onSalesRepChange,
  approvalStatus = "All",
  onApprovalStatusChange
}) {
  const reps = ["All", "Alex Morgan", "Sarah Vance", "Michael Sterling", "David Ops"];
  const periods = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "this_week" },
    { label: "This Month", value: "this_month" },
    { label: "All Time", value: "all" }
  ];

  return (
    <div className="bg-[#151517] border border-white/10 rounded-[20px] p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-[#FF7A45]" />
        <span className="text-xs font-bold uppercase tracking-wider text-white">Pipeline View Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Period Filter */}
        <div className="flex items-center gap-1.5 bg-black border border-white/10 rounded-full px-3 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#A6A39C]" />
          <select
            value={period}
            onChange={(e) => onPeriodChange && onPeriodChange(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            {periods.map(p => (
              <option key={p.value} value={p.value} className="bg-[#151517] text-white">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rep Filter */}
        <div className="flex items-center gap-1.5 bg-black border border-white/10 rounded-full px-3 py-1.5">
          <UserCheck className="w-3.5 h-3.5 text-[#A6A39C]" />
          <select
            value={salesRep}
            onChange={(e) => onSalesRepChange && onSalesRepChange(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            {reps.map(r => (
              <option key={r} value={r} className="bg-[#151517] text-white">
                Rep: {r}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
