import React, { useState } from 'react';
import { Warehouse as WarehouseIcon, Truck, PackageCheck, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { calculateWarehouseSplit } from '../../utils/calculations';
import { Badge, Button, Card } from '../ui';
import { useAppContext } from '../../context/AppContext';

interface WarehouseOptimizerProps {
  productId?: string;
  quantity?: number;
}

export function WarehouseOptimizer({ productId = 'p1', quantity = 100 }: WarehouseOptimizerProps) {
  const { addToast } = useAppContext();
  const [isAccepted, setIsAccepted] = useState(false);

  const { allocations, totalShipments, estimatedShipping, recommendationReason } = calculateWarehouseSplit(productId, quantity);

  const handleAccept = () => {
    setIsAccepted(true);
    addToast({
      type: 'success',
      title: 'Fulfillment Split Accepted',
      message: `Allocated ${quantity} units across ${totalShipments} fulfillment centers.`,
    });
  };

  return (
    <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#FF4A1C]">
            <WarehouseIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#F5F1EA]">Warehouse Inventory Optimizer</h3>
            <p className="text-xs text-[#A6A39C] mt-0.5">Automated multi-depot order allocation engine</p>
          </div>
        </div>
        <Badge variant={isAccepted ? 'success' : 'primary'}>
          {isAccepted ? 'Allocation Confirmed' : 'Optimal Split Recommendation'}
        </Badge>
      </div>

      {/* Allocation Summary Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-[#1C1C1E] border border-white/8">
          <span className="text-[10px] font-semibold text-[#A6A39C] uppercase tracking-wider block">Order Volume</span>
          <span className="text-xl font-bold text-[#F5F1EA] mt-1 block">{quantity} units</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1C1C1E] border border-white/8">
          <span className="text-[10px] font-semibold text-[#A6A39C] uppercase tracking-wider block">Total Shipments</span>
          <span className="text-xl font-bold text-[#F5F1EA] mt-1 block">{totalShipments} Hubs</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1C1C1E] border border-white/8">
          <span className="text-[10px] font-semibold text-[#A6A39C] uppercase tracking-wider block">Freight Est.</span>
          <span className="text-xl font-bold text-[#FF7A45] mt-1 block">${estimatedShipping}</span>
        </div>
      </div>

      {/* Warehouse Split Allocations List */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#F5F1EA] uppercase tracking-wider">
          Recommended Depot Allocations
        </h4>
        {allocations.map((alloc, idx) => (
          <div
            key={alloc.warehouseId}
            className="p-4 rounded-xl bg-[#1C1C1E] border border-white/8 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF4A1C]/10 border border-[#FF4A1C]/20 text-[#FF4A1C] font-bold flex items-center justify-center text-xs">
                #{idx + 1}
              </div>
              <div>
                <span className="font-bold text-xs text-[#F5F1EA] block">{alloc.warehouseName}</span>
                <span className="text-[11px] text-[#A6A39C]">Allocated: <strong className="text-[#FF7A45] font-bold">{alloc.allocatedQty} units</strong></span>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#A6A39C]">${alloc.shippingCost} Freight</span>
          </div>
        ))}
      </div>

      {/* Rationale Callout */}
      <div className="p-4 rounded-xl bg-[#FF4A1C]/10 border border-[#FF4A1C]/20 text-xs text-[#F5F1EA]">
        <span className="font-bold block text-[#FF7A45]">Optimization Reason:</span>
        <p className="mt-1 leading-relaxed text-[#A6A39C]">{recommendationReason}</p>
      </div>

      {/* Backorder Management Widget */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-[#F5F1EA] block">Backorder Risk: 12 Units</span>
            <span className="text-[#A6A39C] text-[11px]">Expected replenishment ETA: 18 Sept 2026</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/8">
        <button
          onClick={handleAccept}
          disabled={isAccepted}
          className={`flex-1 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            isAccepted
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-default'
              : 'bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white shadow-sm'
          }`}
        >
          {isAccepted ? (
            <>
              <Check className="w-4 h-4" />
              <span>Allocation Applied to Order</span>
            </>
          ) : (
            <>
              <PackageCheck className="w-4 h-4" />
              <span>Confirm & Reserve Inventory</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
