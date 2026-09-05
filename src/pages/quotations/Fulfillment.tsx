import React from 'react';
import { Warehouse as WarehouseIcon, PackageCheck, Truck, Clock, CheckCircle2 } from 'lucide-react';
import { WarehouseOptimizer } from '../../components/fulfillment/WarehouseOptimizer';
import { Badge, Card } from '../../components/ui';

export default function Fulfillment() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <WarehouseIcon className="w-7 h-7 text-indigo-600" />
            Fulfillment Operations & Logistics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated multi-depot stock allocation, shipping optimization, and backorder tracking
          </p>
        </div>
        <Badge variant="success" size="lg">Order Q-1042 Fulfillment Active</Badge>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Warehouse Optimizer */}
        <div className="lg:col-span-8 space-y-6">
          <WarehouseOptimizer productId="p1" quantity={100} />
        </div>

        {/* Right Column (4 cols): Dispatch & Shipping Status */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Dispatch Timeline
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Inventory Reserved</span>
                  <span className="text-slate-400 text-[11px]">60 units at Main, 40 units at East</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Freight Dispatch Scheduled</span>
                  <span className="text-slate-400 text-[11px]">Expected pick-up: Today 16:00 EST</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
