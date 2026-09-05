import React, { useState } from 'react';
import { Sliders, ShieldCheck, CheckCircle2, Edit2, Save, Plus, BookOpen, DollarSign } from 'lucide-react';
import { RULES_CONFIG, PRICE_BOOKS, PRODUCTS } from '../../data/mockData';
import { Badge, Button, Card } from '../../components/ui';

export default function AdminRules() {
  const [activeTab, setActiveTab] = useState<'rules' | 'pricebooks' | 'products'>('rules');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Sliders className="w-7 h-7 text-blue-600" />
            Administration & Governance Controls
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure discount rules, price books, customer tier limits, and approval matrices
          </p>
        </div>
        <Button variant="primary" className="font-bold shadow-xs">
          <Plus className="w-4 h-4" />
          <span>+ Create New Rule</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Discount Governance Rules</span>
        </button>
        <button
          onClick={() => setActiveTab('pricebooks')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'pricebooks'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Price Books ({PRICE_BOOKS.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Catalog Base Pricing ({PRODUCTS.length})</span>
        </button>
      </div>

      {/* TAB 1: Discount Governance Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Tier Limits */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Customer Tier Standard Limits
                </h3>
                <Badge variant="primary" size="sm">Active Policy</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Bronze Tier Accounts</span>
                    <span className="text-[11px] text-slate-400">Baseline customer tier</span>
                  </div>
                  <Badge variant="default" size="sm" className="font-bold">5% Max Standard Discount</Badge>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Silver Tier Accounts</span>
                    <span className="text-[11px] text-slate-400">Mid-market growth tier</span>
                  </div>
                  <Badge variant="warning" size="sm" className="font-bold">10% Max Standard Discount</Badge>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Gold Partner Accounts</span>
                    <span className="text-[11px] text-slate-400">Strategic enterprise tier</span>
                  </div>
                  <Badge variant="success" size="sm" className="font-bold">15% Max Standard Discount</Badge>
                </div>
              </div>
            </Card>

            {/* Category Limits */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Category Hard Discount Caps
                </h3>
                <Badge variant="info" size="sm">Category Rules</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Hardware Line Items</span>
                    <span className="text-[11px] text-slate-400">Physical devices & workstations</span>
                  </div>
                  <Badge variant="primary" size="sm" className="font-bold">15% Max Cap</Badge>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                  <div>
                    <span className="font-bold text-amber-950 dark:text-amber-200 block">Setup & Professional Services</span>
                    <span className="text-[11px] text-amber-800 dark:text-amber-400">White-glove onboarding</span>
                  </div>
                  <Badge variant="danger" size="sm" className="font-bold">10% Max Cap (Triggers Finance)</Badge>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Subscription & Software</span>
                    <span className="text-[11px] text-slate-400">MRR/ARR cloud licenses</span>
                  </div>
                  <Badge variant="warning" size="sm" className="font-bold">12% Max Cap</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Multi-Stage Approval Matrix Table */}
          <Card className="p-0 overflow-hidden border-slate-200/80 dark:border-slate-800 shadow-md">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Multi-Stage Approval Trigger Matrix
              </h3>
              <Badge variant="primary" size="sm">Rule Engine</Badge>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3.5">Discount Variance Range</th>
                  <th className="p-3.5">Required Governance Approvers</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {RULES_CONFIG.approvalMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{item.range}</td>
                    <td className="p-3.5 text-blue-600 dark:text-blue-400 font-semibold">{item.role}</td>
                    <td className="p-3.5 text-center">
                      <Badge variant="success" size="sm">Enforced</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 2: Price Books Admin */}
      {activeTab === 'pricebooks' && (
        <Card className="p-0 overflow-hidden border-slate-200/80 dark:border-slate-800 shadow-md">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Enterprise Price Books Schedule
            </h3>
            <Button variant="primary" size="sm">+ New Price Book</Button>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">Price Book Name</th>
                <th className="p-3.5">Currency</th>
                <th className="p-3.5">Effective Date</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PRICE_BOOKS.map(pb => (
                <tr key={pb.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-bold text-blue-600 dark:text-blue-400">{pb.name}</td>
                  <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">{pb.currency}</td>
                  <td className="p-3.5 text-slate-500">{pb.effectiveDate}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{pb.description}</td>
                  <td className="p-3.5 text-center">
                    <Badge variant="success" size="sm">Active</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* TAB 3: Catalog Base Pricing */}
      {activeTab === 'products' && (
        <Card className="p-0 overflow-hidden border-slate-200/80 dark:border-slate-800 shadow-md">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Product Catalog Base Prices & Margins
            </h3>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right">Base Price</th>
                <th className="p-3.5 text-right">Cost</th>
                <th className="p-3.5 text-right">Base Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PRODUCTS.map(p => {
                const margin = p.basePrice - p.cost;
                const marginPercent = ((margin / p.basePrice) * 100).toFixed(1);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{p.name}</td>
                    <td className="p-3.5 font-mono text-slate-500">{p.sku}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">{p.category}</td>
                    <td className="p-3.5 text-right font-black text-slate-900 dark:text-slate-100">${p.basePrice.toLocaleString()}</td>
                    <td className="p-3.5 text-right text-slate-500">${p.cost.toLocaleString()}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-600">{marginPercent}% (${margin.toLocaleString()})</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
