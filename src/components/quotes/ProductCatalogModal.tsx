import React, { useState } from 'react';
import { Search, Plus, Package, Check, Tag } from 'lucide-react';
import { PRODUCTS } from '../../data/mockData';
import { Product, ProductCategory } from '../../types';
import { Modal, Button, Badge } from '../ui';

interface ProductCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

export function ProductCatalogModal({ isOpen, onClose, onAddProduct }: ProductCatalogModalProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | ProductCategory>('All');

  const categories: ('All' | ProductCategory)[] = ['All', 'Hardware', 'Service', 'Subscription'];

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Products to Quotation" maxWidth="4xl">
      <div className="space-y-4">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by product name or SKU..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-1 sm:flex-none ${
                  activeCategory === cat
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          {filteredProducts.map(product => {
            const margin = product.basePrice - product.cost;
            const marginPercent = ((margin / product.basePrice) * 100).toFixed(1);

            return (
              <div
                key={product.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{product.name}</h4>
                      <Badge variant="outline" size="sm">{product.sku}</Badge>
                      {product.isConfigurable && <Badge variant="info" size="sm">Configurable</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{product.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <span>Category: <strong className="text-slate-700 dark:text-slate-300">{product.category}</strong></span>
                      <span>Unit: <strong className="text-slate-700 dark:text-slate-300">{product.unit}</strong></span>
                      <span>Margin: <strong className="text-emerald-600 font-bold">{marginPercent}%</strong> (${margin.toLocaleString()})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 dark:text-slate-100 block">
                      ${product.basePrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">Cost: ${product.cost.toLocaleString()}</span>
                  </div>
                  <Button
                    onClick={() => {
                      onAddProduct(product);
                      onClose();
                    }}
                    variant="primary"
                    size="sm"
                    className="shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
