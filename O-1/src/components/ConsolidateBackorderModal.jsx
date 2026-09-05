import React from 'react';
import { PackageCheck, AlertCircle, ArrowRight, CheckCircle2, X } from 'lucide-react';

/**
 * ConsolidateBackorderModal Component
 * 
 * Pops up mid-cycle when new inventory stock arrives for backordered items,
 * allowing the user to consolidate backordered lines into active fulfillment orders.
 */
export default function ConsolidateBackorderModal({
  isOpen = false,
  onClose = () => {},
  onConsolidate = () => {},
  consolidationData = null
}) {
  if (!isOpen || !consolidationData) return null;

  const {
    product_name = "Enterprise Blade Server X9",
    warehouse_name = "Main Warehouse (Central)",
    qty_received = 15,
    missing_qty = 5,
    can_fulfill_qty = 5,
    quotation_id = "q-1042"
  } = consolidationData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#151517] border border-[#FF4A1C]/40 rounded-[24px] max-w-lg w-full p-6 shadow-2xl space-y-5 text-[#F5F1EA] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#FF4A1C]/10 border border-[#FF4A1C]/30 text-[#FF4A1C]">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF4A1C]">
              Mid-Cycle Inventory Arrival Event
            </div>
            <h3 className="text-lg font-bold">Consolidate Backordered Items</h3>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
          <p className="text-xs text-[#A6A39C] leading-relaxed">
            New inventory stock has arrived! Stock can immediately satisfy waiting backorders for Quote <strong className="text-white">{quotation_id}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-white/50">Item Arrived</div>
              <div className="text-xs font-bold text-white mt-1 truncate">{product_name}</div>
              <div className="text-[11px] text-[#FF4A1C] mt-0.5">+{qty_received} Received @ {warehouse_name}</div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-white/50">Backorder Status</div>
              <div className="text-xs font-bold text-amber-400 mt-1">{missing_qty} Units Needed</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Can Fulfill {can_fulfill_qty} Units</div>
            </div>
          </div>
        </div>

        {/* Action Prompt */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Consolidating will release {can_fulfill_qty} units into current shipment immediately.</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-white/70 hover:bg-white/5 transition-all"
          >
            Dismiss for Now
          </button>

          <button
            type="button"
            onClick={() => onConsolidate(consolidationData)}
            className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#FF4A1C] hover:bg-[#e03e13] text-white shadow-lg shadow-[#FF4A1C]/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Consolidate Into Fulfillment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
