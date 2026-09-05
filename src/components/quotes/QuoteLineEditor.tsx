import React, { useState } from 'react';
import { Plus, Trash2, Sliders, Sparkles, Package, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Quote, QuoteLine, Product } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { PRODUCTS } from '../../data/mockData';
import { Badge, Button } from '../ui';
import { ProductCatalogModal } from './ProductCatalogModal';
import { ProductConfiguratorModal } from './ProductConfiguratorModal';

interface QuoteLineEditorProps {
  quote: Quote;
}

export function QuoteLineEditor({ quote }: QuoteLineEditorProps) {
  const { updateQuoteLine, addQuoteLine, removeQuoteLine, getQuoteMetrics } = useAppContext();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [configuringLine, setConfiguringLine] = useState<{ line: QuoteLine; product: Product } | null>(null);

  const metrics = getQuoteMetrics(quote);

  // Recommendations logic (products not already in quote)
  const currentProductIds = quote.lines.map(l => l.productId);
  const recommendedProducts = PRODUCTS.filter(
    p => (p.id === 'p2' || p.id === 'p5' || p.id === 'p3') && !currentProductIds.includes(p.id)
  );

  const handleAddProduct = (product: Product) => {
    addQuoteLine(quote.id, {
      productId: product.id,
      qty: 1,
      unitPrice: product.basePrice,
      discountPercent: 0,
      taxPercent: 5,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Action */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Transaction Line Editor
            <Badge variant="primary" size="sm">Spreadsheet Engine</Badge>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure products, adjust quantities, set line discounts, and inspect live gross margins.
          </p>
        </div>
        <Button onClick={() => setIsCatalogOpen(true)} variant="primary" size="sm" className="shadow-2xs">
          <Plus className="w-4 h-4" />
          <span>Add Products</span>
        </Button>
      </div>

      {/* Interactive Line Editor Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[220px]">Product & Config</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3 text-center min-w-[110px]">Qty</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-center min-w-[100px]">Discount</th>
                <th className="py-3 px-3 text-right">Margin %</th>
                <th className="py-3 px-4 text-right">Total Net</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {metrics.lineDetails.map(line => (
                <tr key={line.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                  {/* Product & Config */}
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{line.product.name}</span>
                        {(line.selectedRam || line.selectedStorage || line.selectedWarranty) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {line.selectedRam && <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{line.selectedRam}</span>}
                            {line.selectedStorage && <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{line.selectedStorage}</span>}
                            {line.selectedWarranty && <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{line.selectedWarranty}</span>}
                          </div>
                        )}
                        {line.exceedsCategoryLimit && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            Exceeds {line.product.category} Limit ({line.categoryLimit}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400">{line.product.sku}</td>

                  {/* Quantity Controls */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                      <button
                        onClick={() => updateQuoteLine(quote.id, line.id, { qty: Math.max(1, line.qty - 1) })}
                        className="px-2 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-slate-100 min-w-[28px] text-center">
                        {line.qty}
                      </span>
                      <button
                        onClick={() => updateQuoteLine(quote.id, line.id, { qty: line.qty + 1 })}
                        className="px-2 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* Unit Price */}
                  <td className="py-3.5 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                    ${line.unitPriceWithConfig.toLocaleString()}
                  </td>

                  {/* Discount Input */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="relative inline-block w-20">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={line.discountPercent}
                        onChange={e =>
                          updateQuoteLine(quote.id, line.id, { discountPercent: Math.max(0, Math.min(100, Number(e.target.value))) })
                        }
                        className={`w-full py-1 pl-2 pr-5 text-center font-bold border rounded-lg text-xs focus:outline-none focus:ring-2 ${
                          line.exceedsCategoryLimit
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 focus:ring-rose-500/40'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-blue-500/40'
                        }`}
                      />
                      <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-bold pointer-events-none">%</span>
                    </div>
                  </td>

                  {/* Gross Margin % */}
                  <td className="py-3.5 px-3 text-right font-bold">
                    <span className={line.marginPercent < 25 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {line.marginPercent.toFixed(1)}%
                    </span>
                  </td>

                  {/* Line Total */}
                  <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-slate-100">
                    ${line.finalLineTotal.toLocaleString()}
                  </td>

                  {/* Context Actions */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {line.product.isConfigurable && (
                        <button
                          onClick={() => setConfiguringLine({ line, product: line.product })}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Configure Options"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeQuoteLine(quote.id, line.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remove Line Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Upsell / Cross-sell Section */}
      {recommendedProducts.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Recommended Upsells & Margin Boosters
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommendedProducts.map(prod => {
              const estMargin = prod.basePrice - prod.cost;
              return (
                <div
                  key={prod.id}
                  className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">{prod.name}</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                      +${estMargin.toLocaleString()} Gross Margin
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100">${prod.basePrice.toLocaleString()}</span>
                    <Button onClick={() => handleAddProduct(prod)} variant="outline" size="sm">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Catalog Modal */}
      <ProductCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Configurator Modal */}
      {configuringLine && (
        <ProductConfiguratorModal
          isOpen={!!configuringLine}
          onClose={() => setConfiguringLine(null)}
          product={configuringLine.product}
          line={configuringLine.line}
          onApplyConfig={updates => updateQuoteLine(quote.id, configuringLine.line.id, updates)}
        />
      )}
    </div>
  );
}
