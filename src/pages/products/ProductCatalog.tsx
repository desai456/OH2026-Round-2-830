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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Package className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Product & Price Book Catalog
            </h1>
            <Badge variant="primary" size="sm">Screen 16</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure enterprise SKUs, base price lists, billing structures, and governance discount ceilings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Settings className="w-4 h-4 mr-1.5" />
            Manage Price Fields
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/products/new')}>
            <Plus className="w-4 h-4 mr-1.5" />
            + New Product
          </Button>
        </div>
      </div>

      {/* 3 Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Catalog SKUs
            </span>
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {products.filter(p => p.status === 'Active').length} SKUs
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Across Hardware, Software & Services
          </span>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bundles & Rule Books
            </span>
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            12 Active Rules
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Automatic multi-product bundle pricing enabled
          </span>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Price Book Matrix
            </span>
            <DollarSign className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            3 Currencies
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            USD (Global Standard), EUR, GBP
          </span>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card padding="md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Category:</span>
            <div className="flex items-center gap-1.5">
              {['All', 'Hardware', 'Software', 'Service'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU code or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Product Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Base Price ($)</th>
                <th className="py-3 px-4">Billing Type</th>
                <th className="py-3 px-4 text-center">Discount Ceiling</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/products/${p.id}`)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {p.sku}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {p.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    ${p.basePrice.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {p.billingType}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {p.discountCeiling}%
                  </td>
                  <td className="py-3 px-4">
                    {p.status === 'Active' && <Badge variant="success">Active</Badge>}
                    {p.status === 'Draft' && <Badge variant="warning">Draft</Badge>}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/products/${p.id}`)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Edit SKU
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
