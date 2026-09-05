import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Settings, Search, Layers, Shield, DollarSign, Edit, Eye, Filter } from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui';

interface ProductSKU {
  id: string;
  sku: string;
  name: string;
  category: 'Hardware' | 'Software' | 'Service';
  basePrice: number;
  billingType: 'One-Time' | 'Recurring (Monthly)' | 'Recurring (Annual)';
  discountCeiling: number;
  status: 'Active' | 'Draft' | 'Archived';
}

export default function ProductCatalog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [products] = useState<ProductSKU[]>([
    { id: 'PROD-101', sku: 'SKU-EX900-SRV', name: 'Enterprise Cloud Server X900', category: 'Hardware', basePrice: 45000, billingType: 'One-Time', discountCeiling: 15, status: 'Active' },
    { id: 'PROD-102', sku: 'SKU-AI-OPT-SUB', name: 'AI Workload Optimizer Add-on', category: 'Software', basePrice: 8500, billingType: 'Recurring (Annual)', discountCeiling: 20, status: 'Active' },
    { id: 'PROD-103', sku: 'SKU-SLA-247-SUP', name: 'Priority 24/7 SLA Support', category: 'Service', basePrice: 22000, billingType: 'Recurring (Annual)', discountCeiling: 10, status: 'Active' },
    { id: 'PROD-104', sku: 'SKU-EDGE-GW-10', name: 'Edge Compute Gateway v2', category: 'Hardware', basePrice: 12500, billingType: 'One-Time', discountCeiling: 12, status: 'Active' },
    { id: 'PROD-105', sku: 'SKU-DATA-PIPE-PREM', name: 'Premium Real-Time Data Pipeline', category: 'Software', basePrice: 15000, billingType: 'Recurring (Monthly)', discountCeiling: 18, status: 'Draft' },
  ]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif text-[#F5F1EA] tracking-tight flex items-center gap-3">
              <Package className="w-7 h-7 text-[#FF4A1C]" />
              Product & Price Book Catalog
            </h1>
            <Badge variant="primary" size="sm">Screen 16</Badge>
          </div>
          <p className="text-xs text-[#A6A39C] mt-1">
            Configure enterprise SKUs, base price lists, billing structures, and governance discount ceilings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-[#F5F1EA] hover:bg-white/5 transition-all flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#A6A39C]" />
            <span>Manage Price Fields</span>
          </button>
          <button
            onClick={() => navigate('/products/new')}
            className="px-5 py-2 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* 3 Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-[#FF4A1C] rounded-[20px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
              Active Catalog SKUs
            </span>
            <Layers className="w-5 h-5 text-[#FF4A1C]" />
          </div>
          <p className="text-3xl font-bold text-[#F5F1EA] mt-2 font-serif">
            {products.filter(p => p.status === 'Active').length} SKUs
          </p>
          <span className="text-[11px] text-[#A6A39C] mt-1 block">
            Across Hardware, Software & Services
          </span>
        </div>

        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-emerald-500 rounded-[20px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
              Bundles & Rule Books
            </span>
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-[#F5F1EA] mt-2 font-serif">
            12 Active Rules
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            Automatic multi-product bundle pricing enabled
          </span>
        </div>

        <div className="bg-[#151517] border border-white/8 border-l-4 border-l-purple-500 rounded-[20px] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A6A39C] uppercase tracking-wider">
              Price Book Matrix
            </span>
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-[#F5F1EA] mt-2 font-serif">
            3 Currencies
          </p>
          <span className="text-[11px] text-[#A6A39C] mt-1 block">
            USD (Global Standard), EUR, GBP
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#A6A39C]">Category:</span>
            <div className="flex items-center gap-1.5">
              {['All', 'Hardware', 'Software', 'Service'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                    categoryFilter === cat
                      ? 'bg-[#FF4A1C] text-white shadow-sm'
                      : 'bg-[#1C1C1E] text-[#A6A39C] hover:text-[#F5F1EA] border border-white/8'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6A39C]" />
            <input
              type="text"
              placeholder="Search SKU code or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-white/10 bg-[#1C1C1E] text-[#F5F1EA] placeholder-[#A6A39C] focus:outline-none focus:border-[#FF4A1C]"
            />
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/8 bg-[#121214] text-[#A6A39C] font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">SKU Code</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Base Price ($)</th>
                <th className="py-3.5 px-4">Billing Type</th>
                <th className="py-3.5 px-4 text-center">Discount Ceiling</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#F5F1EA]">
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => navigate(`/products/${p.id}`)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#FF7A45]">
                    {p.sku}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#F5F1EA]">
                    {p.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1C1C1E] border border-white/10 text-[#F5F1EA]">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#F5F1EA]">
                    ${p.basePrice.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-[#A6A39C]">
                    {p.billingType}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                    {p.discountCeiling}%
                  </td>
                  <td className="py-3.5 px-4">
                    {p.status === 'Active' && <Badge variant="success">Active</Badge>}
                    {p.status === 'Draft' && <Badge variant="warning">Draft</Badge>}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/products/${p.id}`)}
                      className="px-2 py-1 text-[11px] font-bold text-[#FF7A45] hover:underline"
                    >
                      Edit SKU
                    </button>
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
