import React, { useState } from 'react';
import { Plus, Trash2, Sliders, Sparkles, Package, AlertCircle } from 'lucide-react';
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
          <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F5F1EA] uppercase tracking-wider flex items-center gap-2">
            Transaction Line Editor
            <Badge variant="primary" size="sm">CPQ Spreadsheet Engine</Badge>
          </h3>
          <p className="text-xs text-[#A6A39C] dark:text-[#6E6C68] mt-0.5">
            Configure line items, adjust quantities, set discounts, and inspect live gross margins.
          </p>
        </div>
        <Button onClick={() => setIsCatalogOpen(true)} variant="primary" size="sm">
          <Plus className="w-4 h-4" />
          <span>Add Products</span>
        </Button>
      </div>

      {/* Spreadsheet-like Table */}
      <div className="bg-[#151517] text-[#F5F1EA] border border-white/8 rounded-[20px] shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#121214] border-b border-white/8 text-[11px] font-bold text-[#A6A39C] uppercase tracking-wider">
                <th className="py-3.5 px-4 min-w-[220px]">Product & Config</th>
                <th className="py-3.5 px-3">SKU</th>
                <th className="py-3.5 px-3 text-center min-w-[110px]">Qty</th>
                <th className="py-3.5 px-3 text-right">Unit Price</th>
                <th className="py-3.5 px-3 text-center min-w-[100px]">Discount</th>
                <th className="py-3.5 px-3 text-right">Margin %</th>
                <th className="py-3.5 px-4 text-right">Total Net</th>
                <th className="py-3.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {metrics.lineDetails.map(line => (
                <tr key={line.id} className="hover:bg-white/5 transition-colors group">
                  {/* Product Name */}
                  <td className="py-3.5 px-4 font-medium text-[#F5F1EA]">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FF4A1C]/10 border border-[#FF4A1C]/30 flex items-center justify-center text-[#FF4A1C] shrink-0 mt-0.5">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-[#F5F1EA] block">{line.product.name}</span>
                        {(line.selectedRam || line.selectedStorage || line.selectedWarranty) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {line.selectedRam && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A6A39C]">{line.selectedRam}</span>}
                            {line.selectedStorage && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A6A39C]">{line.selectedStorage}</span>}
                            {line.selectedWarranty && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A6A39C]">{line.selectedWarranty}</span>}
                          </div>
                        )}
                        {line.exceedsCategoryLimit && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            Exceeds {line.product.category} Limit ({line.categoryLimit}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="py-3.5 px-3 font-mono text-[#A6A39C]">{line.product.sku}</td>

                  {/* Qty Controls */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center border border-white/10 rounded-lg overflow-hidden bg-white/5">
                      <button
                        onClick={() => updateQuoteLine(quote.id, line.id, { qty: Math.max(1, line.qty - 1) })}
                        className="px-2 py-1 text-[#A6A39C] hover:text-white hover:bg-white/10 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 text-xs font-bold text-[#F5F1EA] min-w-[28px] text-center">
                        {line.qty}
                      </span>
                      <button
                        onClick={() => updateQuoteLine(quote.id, line.id, { qty: line.qty + 1 })}
                        className="px-2 py-1 text-[#A6A39C] hover:text-white hover:bg-white/10 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* Unit Price */}
                  <td className="py-3.5 px-3 text-right font-medium text-[#F5F1EA]">
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
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 focus:ring-rose-500/40'
                            : 'bg-white/5 border-white/10 text-[#F5F1EA] focus:ring-[#FF7A45]/40'
                        }`}
                      />
                      <span className="absolute right-2 top-1.5 text-xs text-[#A6A39C] font-bold pointer-events-none">%</span>
                    </div>
                  </td>

                  {/* Margin % */}
                  <td className="py-3.5 px-3 text-right font-bold">
                    <span className={line.marginPercent < 25 ? 'text-rose-400' : 'text-emerald-400'}>
                      {line.marginPercent.toFixed(1)}%
                    </span>
                  </td>

                  {/* Line Total */}
                  <td className="py-3.5 px-4 text-right font-bold text-[#F5F1EA]">
                    ${line.finalLineTotal.toLocaleString()}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {line.product.isConfigurable && (
                        <button
                          onClick={() => setConfiguringLine({ line, product: line.product })}
                          className="p-1.5 rounded-lg text-[#FF7A45] hover:bg-white/10 transition-colors"
                          title="Configure Options"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeQuoteLine(quote.id, line.id)}
                        className="p-1.5 rounded-lg text-[#A6A39C] hover:text-rose-400 hover:bg-white/5 transition-colors"
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

      {/* Upsell Recommendations Section */}
      {recommendedProducts.length > 0 && (
        <div className="p-5 rounded-[20px] bg-[#151517] text-[#F5F1EA] border border-white/8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF4A1C]" />
            <h4 className="text-xs font-bold text-[#F5F1EA] uppercase tracking-wider">
              Recommended Upsells & Margin Boosters
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommendedProducts.map(prod => {
              const estMargin = prod.basePrice - prod.cost;
              return (
                <div
                  key={prod.id}
                  className="p-4 bg-[#1B1B1D] rounded-[16px] border border-white/8 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-[#F5F1EA] block">{prod.name}</span>
                    <span className="text-[11px] text-emerald-400 font-bold block mt-1">
                      +${estMargin.toLocaleString()} Gross Margin
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/8">
                    <span className="text-xs font-black text-[#F5F1EA]">${prod.basePrice.toLocaleString()}</span>
                    <Button onClick={() => handleAddProduct(prod)} variant="secondary" size="sm">
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
