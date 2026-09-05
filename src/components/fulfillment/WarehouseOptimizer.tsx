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
    <Card className="border-slate-200/80 dark:border-slate-800 shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <WarehouseIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Warehouse Inventory Optimizer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated multi-depot order allocation engine</p>
          </div>
        </div>
        <Badge variant={isAccepted ? 'success' : 'primary'}>
          {isAccepted ? 'Allocation Confirmed' : 'Optimal Split Recommendation'}
        </Badge>
      </div>

      {/* Allocation Summary Metrics */}
      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Volume</span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">{quantity} units</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Shipments</span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">{totalShipments} Hubs</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Freight Est.</span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">${estimatedShipping}</span>
        </div>
      </div>

      {/* Warehouse Split Allocations List */}
      <div className="space-y-3 mb-4">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Recommended Depot Allocations
        </h4>
        {allocations.map((alloc, idx) => (
          <div
            key={alloc.warehouseId}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold flex items-center justify-center text-xs">
                #{idx + 1}
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">{alloc.warehouseName}</span>
                <span className="text-[11px] text-slate-500">Allocated: <strong className="text-blue-600 font-bold">{alloc.allocatedQty} units</strong></span>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">${alloc.shippingCost} Freight</span>
          </div>
        ))}
      </div>

      {/* Rationale Callout */}
      <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 mb-4">
        <span className="font-bold block">Optimization Reason:</span>
        <p className="mt-0.5 leading-relaxed text-indigo-800 dark:text-indigo-300">{recommendationReason}</p>
      </div>

      {/* Backorder Management Widget */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs mb-4">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold text-amber-950 dark:text-amber-200 block">Backorder Risk: 12 Units</span>
            <span className="text-amber-800 dark:text-amber-400 text-[11px]">Expected replenishment ETA: 18 Sept 2026</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 border-amber-300 text-amber-900">
          Consolidate Backorder
        </Button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleAccept} variant="primary" className="flex-1 font-bold">
          <Check className="w-4 h-4" />
          <span>{isAccepted ? 'Allocation Accepted' : 'Accept Recommendation'}</span>
        </Button>
        <Button variant="outline">Manual Override</Button>
      </div>
    </Card>
  );
}
