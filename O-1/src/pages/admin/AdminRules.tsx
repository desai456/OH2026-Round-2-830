import React, { useState } from 'react';
import { Sliders, ShieldCheck, CheckCircle2, Edit2, Save, Plus, BookOpen, DollarSign } from 'lucide-react';
import { RULES_CONFIG, PRICE_BOOKS, PRODUCTS } from '../../data/mockData';
import { Badge, Button, Card } from '../../components/ui';

export default function AdminRules() {
  const [activeTab, setActiveTab] = useState<'rules' | 'pricebooks' | 'products'>('rules');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#F5F1EA] tracking-tight flex items-center gap-3">
            <Sliders className="w-7 h-7 text-[#FF4A1C]" />
            Administration & Governance Controls
          </h1>
          <p className="text-xs text-[#A6A39C] mt-1">
            Configure discount rules, price books, customer tier limits, and approval matrices
          </p>
        </div>
        <button className="px-5 py-2 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Create New Rule</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/8 pb-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'bg-[#FF4A1C] text-white shadow-sm'
              : 'bg-[#151517] text-[#A6A39C] hover:text-[#F5F1EA] border border-white/8'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Discount Governance Rules</span>
        </button>
        <button
          onClick={() => setActiveTab('pricebooks')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'pricebooks'
              ? 'bg-[#FF4A1C] text-white shadow-sm'
              : 'bg-[#151517] text-[#A6A39C] hover:text-[#F5F1EA] border border-white/8'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Price Books ({PRICE_BOOKS.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-[#FF4A1C] text-white shadow-sm'
              : 'bg-[#151517] text-[#A6A39C] hover:text-[#F5F1EA] border border-white/8'
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
            <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-white/8">
                <h3 className="font-semibold text-xs text-[#F5F1EA] uppercase tracking-wider">
                  Customer Tier Standard Limits
                </h3>
                <Badge variant="primary" size="sm">Active Policy</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-4 rounded-xl bg-[#1C1C1E] border border-white/8">
                  <div>
                    <span className="font-bold text-[#F5F1EA] block">Bronze Tier Accounts</span>
                    <span className="text-[11px] text-[#A6A39C]">Baseline customer tier</span>
                  </div>
                  <Badge variant="default" size="sm" className="font-bold">5% Max Standard Discount</Badge>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl bg-[#1C1C1E] border border-white/8">
                  <div>
                    <span className="font-bold text-[#F5F1EA] block">Silver Tier Accounts</span>
                    <span className="text-[11px] text-[#A6A39C]">Mid-market growth tier</span>
                  </div>
                  <Badge variant="warning" size="sm" className="font-bold">10% Max Standard Discount</Badge>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl bg-[#1C1C1E] border border-white/8">
                  <div>
                    <span className="font-bold text-[#F5F1EA] block">Gold Partner Accounts</span>
                    <span className="text-[11px] text-[#A6A39C]">Strategic enterprise tier</span>
                  </div>
                  <Badge variant="success" size="sm" className="font-bold">15% Max Standard Discount</Badge>
                </div>
              </div>
            </div>

            {/* Category Limits */}
            <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-white/8">
                <h3 className="font-semibold text-xs text-[#F5F1EA] uppercase tracking-wider">
                  Category Hard Discount Caps
                </h3>
                <Badge variant="info" size="sm">Category Rules</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-4 rounded-xl bg-[#1C1C1E] border border-white/8">
                  <div>
                    <span className="font-bold text-[#F5F1EA] block">Hardware Line Items</span>
                    <span className="text-[11px] text-[#A6A39C]">Physical devices & workstations</span>
                  </div>
                  <Badge variant="primary" size="sm" className="font-bold">15% Max Cap</Badge>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl bg-[#FF4A1C]/10 border border-[#FF4A1C]/20">
                  <div>
                    <span className="font-bold text-[#F5F1EA] block">Setup & Professional Services</span>
                    <span className="text-[11px] text-[#FF7A45]">White-glove onboarding</span>
                  </div>
                  <Badge variant="danger" size="sm" className="font-bold">10% Max Cap (Triggers Finance)</Badge>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl bg-[#1C1C1E] border border-white/8">
                  <div>
                    <span className="font-bold text-[#F5F1EA] block">Subscription & Software</span>
                    <span className="text-[11px] text-[#A6A39C]">MRR/ARR cloud licenses</span>
                  </div>
                  <Badge variant="warning" size="sm" className="font-bold">12% Max Cap</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Stage Approval Matrix Table */}
          <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/8">
              <h3 className="font-semibold text-xs text-[#F5F1EA] uppercase tracking-wider">
                Multi-Stage Approval Trigger Matrix
              </h3>
              <Badge variant="primary" size="sm">Rule Engine</Badge>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/8">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#121214] border-b border-white/8 text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
                    <th className="p-3.5">Discount Variance Range</th>
                    <th className="p-3.5">Required Governance Approvers</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#F5F1EA]">
                  {RULES_CONFIG.approvalMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-bold text-[#F5F1EA]">{item.range}</td>
                      <td className="p-3.5 text-[#FF7A45] font-bold">{item.role}</td>
                      <td className="p-3.5 text-center">
                        <Badge variant="success" size="sm">Enforced</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Price Books Admin */}
      {activeTab === 'pricebooks' && (
        <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <h3 className="font-semibold text-xs text-[#F5F1EA] uppercase tracking-wider">
              Enterprise Price Books Schedule
            </h3>
            <button className="px-4 py-1.5 rounded-full bg-[#F5F1EA] text-[#0A0A0B] font-bold text-xs hover:bg-white transition-all">
              + New Price Book
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121214] border-b border-white/8 text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
                  <th className="p-3.5">Price Book Name</th>
                  <th className="p-3.5">Currency</th>
                  <th className="p-3.5">Effective Date</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#F5F1EA]">
                {PRICE_BOOKS.map(pb => (
                  <tr key={pb.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 font-bold text-[#FF7A45]">{pb.name}</td>
                    <td className="p-3.5 font-mono text-[#A6A39C]">{pb.currency}</td>
                    <td className="p-3.5 text-[#A6A39C] font-mono text-[11px]">{pb.effectiveDate}</td>
                    <td className="p-3.5 text-[#A6A39C]">{pb.description}</td>
                    <td className="p-3.5 text-center">
                      <Badge variant="success" size="sm">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Catalog Base Pricing */}
      {activeTab === 'products' && (
        <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-4">
          <div className="pb-3 border-b border-white/8">
            <h3 className="font-semibold text-xs text-[#F5F1EA] uppercase tracking-wider">
              Product Catalog Base Prices & Margins
            </h3>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121214] border-b border-white/8 text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-right">Base Price</th>
                  <th className="p-3.5 text-right">Cost</th>
                  <th className="p-3.5 text-right">Base Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#F5F1EA]">
                {PRODUCTS.map(p => {
                  const margin = p.basePrice - p.cost;
                  const marginPercent = ((margin / p.basePrice) * 100).toFixed(1);
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-bold text-[#F5F1EA]">{p.name}</td>
                      <td className="p-3.5 font-mono text-[#FF7A45]">{p.sku}</td>
                      <td className="p-3.5 text-[#A6A39C]">{p.category}</td>
                      <td className="p-3.5 text-right font-bold text-[#F5F1EA]">${p.basePrice.toLocaleString()}</td>
                      <td className="p-3.5 text-right text-[#A6A39C]">${p.cost.toLocaleString()}</td>
                      <td className="p-3.5 text-right font-bold text-emerald-400">{marginPercent}% (${margin.toLocaleString()})</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
